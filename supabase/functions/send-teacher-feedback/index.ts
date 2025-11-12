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
    // Check for service role key
    const authHeader = req.headers.get("Authorization")!
    if (authHeader !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
      throw new Error("Unauthorized")
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not set.")

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)

    const { student_email, student_name, teacher_name, chapter_title, comment, exercise_id } = await req.json()

    const { data: template, error: templateError } = await supabaseAdmin
      .from("email_templates")
      .select("subject, body")
      .eq("name", "teacher-feedback-notification")
      .single()

    if (templateError || !template) throw new Error("Template 'teacher-feedback-notification' not found.")

    const resultsLink = `${Deno.env.get("NEXT_PUBLIC_BASE_URL")}/exercise/${exercise_id}/results`

    let emailBody = template.body
      .replace("{{student_name}}", student_name)
      .replace("{{teacher_name}}", teacher_name)
      .replace("{{chapter_title}}", chapter_title)
      .replace("{{comment}}", comment)
      .replace("{{link_to_results}}", resultsLink)

    const resend = new Resend(resendApiKey)
    const { error } = await resend.emails.send({
      from: "Luminar Feedback <feedback@resend.dev>",
      to: [student_email],
      subject: template.subject.replace("{{teacher_name}}", teacher_name),
      html: emailBody,
    })

    if (error) throw new Error(`Resend error: ${error.message}`)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})