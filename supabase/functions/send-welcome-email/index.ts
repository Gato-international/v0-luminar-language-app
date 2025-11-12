import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    const { record } = await req.json()
    const { email, raw_user_meta_data, confirmation_token } = record
    const fullName = raw_user_meta_data?.full_name || "New User"

    // Fetch the email template from the database
    const { data: template, error: templateError } = await supabaseAdmin
      .from("email_templates")
      .select("subject, body")
      .eq("name", "welcome-email")
      .single()

    if (templateError || !template) {
      throw new Error(`Could not find 'welcome-email' template: ${templateError?.message}`)
    }

    // Replace placeholders
    const confirmationLink = `https://jodxcwqikzjoqkekqqgg.supabase.co/auth/v1/verify?token=${confirmation_token}&type=signup&redirect_to=/dashboard`
    let emailBody = template.body.replace("{{full_name}}", fullName)
    emailBody = emailBody.replace("{{confirmation_link}}", confirmationLink)

    const resend = new Resend(resendApiKey)

    const { error } = await resend.emails.send({
      from: "Luminar <onboarding@resend.dev>",
      to: [email],
      subject: template.subject,
      html: emailBody,
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