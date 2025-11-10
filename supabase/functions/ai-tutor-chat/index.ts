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
    const { messages } = await req.json()
    if (!messages) {
      throw new Error("Missing messages in request body")
    }

    // 1. Create a client with the user's auth token to get the authenticated user
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders })
    }

    // 2. Create an admin client to securely fetch data, bypassing RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // 3. Fetch student's performance data using the admin client, but scoped to the authenticated user's ID
    const { data: progressData, error: progressError } = await supabaseAdmin
      .from("student_progress")
      .select("*, chapters(title)")
      .eq("student_id", user.id) // Securely scope to the authenticated user
      .order("accuracy_percentage", { ascending: true }) // Get weakest areas first
      .limit(5)

    if (progressError) {
      throw new Error(`Could not retrieve student progress: ${progressError.message}`)
    }

    const studentData = {
      weakestAreas:
        progressData?.map((p) => ({
          chapter: p.chapters?.title || "Untitled Chapter",
          accuracy: p.accuracy_percentage,
        })) || [],
    }

    const prompt = `
      You are 'Lumi', a friendly and encouraging AI language tutor for the Luminar platform.
      Your goal is to help the student understand grammar concepts and practice effectively.
      Your tone should be patient, clear, and supportive.

      **Student Performance Data (Weakest Areas):**
      ---
      ${JSON.stringify(studentData, null, 2)}
      ---

      **Conversation History:**
      ---
      ${messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")}
      ---

      **Your Task:**
      - If the conversation history is empty, introduce yourself warmly. For example: "Hi there! I'm Lumi, your personal AI tutor. I'm here to help you master grammar. Feel free to ask me any questions or ask for a practice sentence!".
      - Respond to the student's latest message based on their question and their performance data.
      - If the student asks for a practice sentence, generate a new, relevant sentence targeting one of their weak areas if possible. Ask them to identify a grammatical case or concept within it.
      - If the student asks a grammar question, explain it clearly and simply, using examples.
      - Keep your responses focused on learning the language. Do not go off-topic.
    `

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set in Supabase secrets.")
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${await geminiResponse.text()}`)
    }

    const geminiData = await geminiResponse.json()

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

    const reply = geminiData.candidates[0].content.parts[0].text

    return new Response(JSON.stringify({ reply }), {
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