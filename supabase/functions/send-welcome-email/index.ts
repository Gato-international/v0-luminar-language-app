import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@3.4.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set in Supabase secrets.")
    }

    const { record } = await req.json()
    const { email, raw_user_meta_data, confirmation_token } = record
    const fullName = raw_user_meta_data?.full_name || "New User"

    const resend = new Resend(resendApiKey)

    // Note: You must verify your domain in Resend to send from a custom domain.
    // Using their default domain for now.
    const { error } = await resend.emails.send({
      from: "Luminar <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Luminar!",
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h1 style="color: #333;">Welcome to Luminar, ${fullName}!</h1>
          <p>We're thrilled to have you on board. Get ready to master grammar and expand your vocabulary like never before.</p>
          <p>Click the button below to confirm your email address and start your learning journey:</p>
          <a 
            href="https://jodxcwqikzjoqkekqqgg.supabase.co/auth/v1/verify?token=${confirmation_token}&type=signup&redirect_to=/dashboard" 
            style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px;"
          >
            Confirm Your Email & Go to Dashboard
          </a>
          <p>Happy learning!</p>
          <p><em>— The Luminar Team</em></p>
        </div>
      `,
    })

    if (error) {
      throw new Error(`Resend API error: ${error.message}`)
    }

    return new Response(JSON.stringify({ success: true }), {
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