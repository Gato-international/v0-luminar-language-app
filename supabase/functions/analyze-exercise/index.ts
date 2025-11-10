import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { exercise_id } = await req.json()
    if (!exercise_id) {
      throw new Error("Missing exercise_id")
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // Fetch all necessary data in parallel to improve performance
    const [exerciseResult, attemptsResult, casesResult] = await Promise.all([
      supabaseAdmin.from("exercises").select("*, student_id, chapters(title)").eq("id", exercise_id).single(),
      supabaseAdmin.from("exercise_attempts").select("is_correct, correct_case_id").eq("exercise_id", exercise_id),
      supabaseAdmin.from("grammatical_cases").select("id, name"),
    ])

    const { data: exercise, error: exerciseError } = exerciseResult
    if (exerciseError || !exercise) throw new Error(`Exercise not found: ${exerciseError?.message}`)

    const { data: attempts, error: attemptsError } = attemptsResult
    if (attemptsError) throw new Error(`Could not fetch attempts: ${attemptsError.message}`)

    const { data: cases, error: casesError } = casesResult
    if (casesError) throw new Error(`Could not fetch cases: ${casesError.message}`)

    // Process data for the prompt
    const caseMap = new Map(cases.map((c) => [c.id, c.name]))
    const performanceByCase = attempts.reduce((acc, attempt) => {
      const caseName = caseMap.get(attempt.correct_case_id) || "Unknown Case"
      if (!acc[caseName]) {
        acc[caseName] = { correct: 0, total: 0 }
      }
      acc[caseName].total++
      if (attempt.is_correct) {
        acc[caseName].correct++
      }
      return acc
    }, {})

    const analysisData = {
      chapter: exercise.chapters?.title,
      difficulty: exercise.difficulty,
      overallAccuracy: (attempts.filter((a) => a.is_correct).length / attempts.length) * 100,
      performanceByCase,
    }

    const prompt = `
      You are an expert language learning tutor AI named 'Lumi'. You are analyzing a student's exercise performance.
      Your goal is to provide encouraging, actionable feedback.
      The output MUST be a valid JSON object with the following keys and value types:
      - "summary": A brief, encouraging paragraph (2-3 sentences) summarizing the performance.
      - "strengths": An array of strings (2-3 items) highlighting what the student did well.
      - "weaknesses": An array of strings (2-3 items) identifying specific areas for improvement.
      - "suggestions": A paragraph with actionable tips for the student to improve.
      - "suggested_topics": An array of 3-4 specific topics or grammar rules the student should search for to learn more.

      Here is the student's performance data:
      ---
      ${JSON.stringify(analysisData, null, 2)}
      ---

      Generate the JSON object based on this data.
    `

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY is not set.")

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    })

    if (!geminiResponse.ok) throw new Error(`Gemini API error: ${await geminiResponse.text()}`)

    const geminiData = await geminiResponse.json()
    const rawText = geminiData.candidates[0].content.parts[0].text
    const jsonText = rawText.replace(/```json|```/g, "").trim()
    const analysisResult = JSON.parse(jsonText)

    // Save the analysis to the database
    const { error: insertError } = await supabaseAdmin.from("ai_exercise_feedback").insert({
      exercise_id: exercise_id,
      student_id: exercise.student_id,
      summary: analysisResult.summary,
      strengths: analysisResult.strengths,
      weaknesses: analysisResult.weaknesses,
      suggestions: analysisResult.suggestions,
      suggested_topics: analysisResult.suggested_topics,
    })

    if (insertError) throw new Error(`Failed to save AI feedback: ${insertError.message}`)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})