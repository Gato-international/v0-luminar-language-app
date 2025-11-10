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
    const { text } = await req.json()
    if (!text) {
      throw new Error("Missing 'text' in request body")
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY")
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not set in Supabase secrets.")
    }

    const prompt = `Translate the following text to Dutch. Provide only the translation, with no additional commentary or explanations.\n\nText to translate: "${text}"`

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

    const translatedText = geminiData.candidates[0].content.parts[0].text
    return new Response(JSON.stringify({ translatedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Edge function error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})