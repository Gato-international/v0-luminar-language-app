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
    const { student_id, messages } = await req.json()
    if (!student_id || !messages) {
      throw new Error("Missing student_id or messages")
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    })

    // Fetch student data with proper error handling
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", student_id)
      .single()

    if (studentError || !student) {
      throw new Error(`Could not retrieve student profile. ${studentError?.message || ""}`)
    }

    const { data: progressData, error: progressError } = await supabase
      .from("student_progress")
      .select("*, chapters(title)")
      .eq("student_id", student_id)

    if (progressError) {
      throw new Error(`Could not retrieve student progress. ${progressError.message}`)
    }

    const studentData = {
      studentName: student.full_name || "Unnamed Student",
      progress:
        progressData?.map((p) => ({
          chapter: p.chapters?.title || "Untitled Chapter",
          accuracy: p.accuracy_percentage,
          completedExercises: p.completed_exercises,
          totalAttempts: p.total_attempts,
        })) || [],
    }

    // Construct the prompt for Gemini
    const prompt = `
      You are 'Lumi', an expert language learning tutor AI assisting a teacher on the Luminar platform.
      Your tone should be professional, helpful, and encouraging.
      Use the provided student performance data to answer the teacher's questions concisely.

      **Student Performance Data:**
      ---
      ${JSON.stringify(studentData, null, 2)}
      ---

      **Conversation History:**
      ---
      ${messages.map((m) => `${m.role}: ${m.content}`).join("\n")}
      ---

      **Your Task:**
      - If the conversation history is empty, your first message MUST be an introduction. Start by saying "Hello! I'm Lumi, your AI assistant." Then, provide a brief, one-sentence summary of the student's overall performance and ask how you can help.
      - If there is conversation history, respond to the latest user message based on the student data and the context of the conversation.
      - If the student has no progress data, state that clearly and suggest the student should start some exercises.
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

    // Defensive check for Gemini response structure
    if (
      !geminiData.candidates ||
      geminiData.candidates.length === 0 ||
      !geminiData.candidates[0].content ||
      !geminiData.candidates[0].content.parts ||
      geminiData.candidates[0].content.parts.length === 0
    ) {
      const feedback = geminiData.promptFeedback
      if (feedback && feedback.blockReason) {
        throw new Error(`Gemini API request was blocked. Reason: ${feedback.blockReason}`)
      }
      throw new Error("Received an invalid or empty response from the AI model.")
    }

    const analysisText = geminiData.candidates[0].content.parts[0].text

    return new Response(JSON.stringify({ reply: analysisText }), {
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