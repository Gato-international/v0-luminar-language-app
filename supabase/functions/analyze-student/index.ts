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
    const { student_id } = await req.json()
    if (!student_id) {
      throw new Error("Missing student_id")
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    })

    // Fetch student data
    const { data: student } = await supabase.from("profiles").select("*").eq("id", student_id).single()
    const { data: progressData } = await supabase.from("student_progress").select("*, chapters(title)").eq("student_id", student_id)
    const { data: recentAttempts } = await supabase.from("exercise_attempts").select("is_correct, grammatical_cases(name)").eq("exercise_id", (await supabase.from("exercises").select("id").eq("student_id", student_id).limit(1).single()).data?.id)

    // Prepare data for AI
    const analysisData = {
      studentName: student.full_name,
      overallProgress: progressData?.map(p => ({
        chapter: p.chapters.title,
        accuracy: p.accuracy_percentage,
        completed: p.completed_exercises,
      })),
      recentMistakes: recentAttempts?.filter(a => !a.is_correct).map(a => a.grammatical_cases?.name),
    }

    // Construct the prompt for Gemini
    const prompt = `
      You are an expert language learning tutor analyzing a student's performance on the Luminar platform.
      Based on the following JSON data, provide a concise, insightful analysis for a teacher.
      The output should be a JSON object with three keys: "strengths", "weaknesses", and "suggestions".
      - "strengths": A string highlighting what the student is doing well.
      - "weaknesses": A string identifying the primary areas for improvement.
      - "suggestions": A string with 2-3 actionable tips for the teacher to help the student.
      Keep the language professional, encouraging, and easy to understand.

      Student Data:
      ${JSON.stringify(analysisData, null, 2)}
    `

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set in Supabase secrets.")
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text()
      throw new Error(`Gemini API error: ${geminiResponse.status} ${errorBody}`)
    }

    const geminiData = await geminiResponse.json()
    const analysisText = geminiData.candidates[0].content.parts[0].text
    
    // Clean the response from markdown backticks
    const cleanedJsonText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
    const analysisJson = JSON.parse(cleanedJsonText)

    return new Response(JSON.stringify(analysisJson), {
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