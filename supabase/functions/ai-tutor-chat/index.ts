import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

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

    // NOTE: Authentication and data fetching are temporarily removed to isolate the Gemini API call.

    const prompt = `
      You are 'Lumi', a friendly and encouraging AI language tutor.
      Your goal is to help a student understand grammar concepts.
      Your tone should be patient, clear, and supportive.

      **Conversation History:**
      ---
      ${messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")}
      ---

      **Your Task:**
      - If the conversation history is empty, introduce yourself warmly.
      - Respond to the student's latest message.
      - Keep your responses focused on learning language.
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
      const errorBody = await geminiResponse.text()
      throw new Error(`Gemini API error: ${geminiResponse.status} ${errorBody}`)
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
    // This will now be the primary source of debugging information.
    return new Response(JSON.stringify({ error: `Function Error: ${error.message}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})