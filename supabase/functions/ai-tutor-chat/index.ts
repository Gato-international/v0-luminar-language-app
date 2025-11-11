/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const rawBody = await req.text()
    if (!rawBody) {
      return new Response(JSON.stringify({ error: "Request body is empty." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    let body
    try {
      body = JSON.parse(rawBody)
    } catch (e: any) {
      return new Response(JSON.stringify({ error: `Invalid JSON in request body: ${e.message}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const messages = body.messages
    if (messages === undefined) {
      return new Response(JSON.stringify({ error: "Request body is missing 'messages' property." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not set in Supabase secrets.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

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
    const geminiData = await geminiResponse.json()

    const reply = geminiData.candidates[0].content.parts[0].text
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error: any) {
    console.error("Edge function error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})