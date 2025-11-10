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

    // Fetch student data
    const { data: student } = await supabase.from("profiles").select("full_name").eq("id", student_id).single()
    const { data: progressData } = await supabase.from("student_progress").select("*, chapters(title)").eq("student_id", student_id)
    
    const studentData = {
      studentName: student.full_name,
      progress: progressData?.map(p => ({
        chapter: p.chapters.title,
        accuracy: p.accuracy_percentage,
        completedExercises: p.completed_exercises,
        totalAttempts: p.total_attempts,
      })),
    }

    const lastUserMessage = messages[messages.length - 1].content

    // Construct the prompt for Gemini
    const prompt = `
      You are an expert language learning tutor AI named 'Lumi'. You are chatting with a teacher about their student's performance on the Luminar platform.
      Use the provided performance data to answer the teacher's questions. Keep your answers concise, helpful, and encouraging.
      If the conversation is just beginning, introduce yourself and provide a brief, high-level summary of the student's performance, then ask how you can help.

      Here is the student's performance data:
      ---
      ${JSON.stringify(studentData, null, 2)}
      ---

      Here is the conversation history so far:
      ---
      ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
      ---

      Based on all the above, provide a response to the teacher.
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