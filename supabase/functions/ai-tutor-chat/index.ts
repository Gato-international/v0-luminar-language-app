import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Step 1: Parse request body
    let messages
    try {
      const body = await req.json()
      messages = body.messages
      if (messages === undefined) {
        throw new Error("Request body is missing 'messages' property.")
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: `Failed to parse request body: ${e.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Step 2: Get API Key
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not set in Supabase secrets. Please ask the administrator to set it.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    // Step 3: Construct Prompt
    const prompt = `
      You are 'Lumi', a friendly and encouraging AI language tutor. Your goal is to help a student understand grammar concepts. Your tone should be patient, clear, and supportive.
      **Conversation History:**
      ---
      ${messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join("\n")}
      ---
      **Your Task:**
      - If the conversation history is empty, introduce yourself warmly.
      - Respond to the student's latest message.
      - Keep your responses focused on learning language.
    `

    // Step 4: Call Gemini API
    let geminiData
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`
      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      })

      if (!geminiResponse.ok) {
        const errorBody = await geminiResponse.text()
        throw new Error(`API request failed with status ${geminiResponse.status}: ${errorBody}`)
      }
      geminiData = await geminiResponse.json()
    } catch (e) {
      return new Response(JSON.stringify({ error: `Error calling Gemini API: ${e.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Step 5: Parse Gemini Response
    try {
      const reply = geminiData.candidates[0].content.parts[0].text
      if (!reply) {
        throw new Error("Response structure is invalid or empty.")
      }
      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      })
    } catch (e) {
      const feedback = geminiData.promptFeedback
      if (feedback && feedback.blockReason) {
        return new Response(
          JSON.stringify({
            error: `Gemini API request was blocked. Reason: ${feedback.blockReason}. This might be due to the content of your prompt.`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        )
      }
      return new Response(
        JSON.stringify({
          error: `Failed to parse Gemini response: ${e.message}. Full response: ${JSON.stringify(geminiData)}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    // This is a fallback for any unexpected errors.
    return new Response(JSON.stringify({ error: `An unexpected error occurred in the edge function: ${error.message}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})