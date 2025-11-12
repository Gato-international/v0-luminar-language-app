"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

async function checkDeveloperRole() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") throw new Error("Forbidden: Not a developer")
  return user
}

export async function createEmailTemplate(formData: FormData) {
  await checkDeveloperRole()
  const supabase = await createClient()

  const data = {
    name: formData.get("name") as string,
    subject: formData.get("subject") as string,
    body: formData.get("body") as string,
  }

  const { error } = await supabase.from("email_templates").insert(data)
  if (error) throw new Error(error.message)

  revalidatePath("/dashboard/developer/emails")
}

export async function updateEmailTemplate(id: string, formData: FormData) {
  await checkDeveloperRole()
  const supabase = await createClient()

  const data = {
    name: formData.get("name") as string,
    subject: formData.get("subject") as string,
    body: formData.get("body") as string,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("email_templates").update(data).eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/dashboard/developer/emails")
}

export async function deleteEmailTemplate(id: string) {
  await checkDeveloperRole()
  const supabase = await createClient()
  const { error } = await supabase.from("email_templates").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/developer/emails")
}

export async function sendTestEmail(templateId: string, recipientEmail: string) {
  await checkDeveloperRole()

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set in environment variables.")
  }

  const supabase = await createClient()
  const { data: template, error: templateError } = await supabase
    .from("email_templates")
    .select("subject, body")
    .eq("id", templateId)
    .single()

  if (templateError || !template) {
    throw new Error("Email template not found.")
  }

  // Replace placeholders with sample data
  let emailBody = template.body.replace("{{full_name}}", "Test User")
  emailBody = emailBody.replace("{{confirmation_link}}", "#")

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: "Luminar Test <onboarding@resend.dev>",
    to: [recipientEmail],
    subject: `[TEST] ${template.subject}`,
    html: emailBody,
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return { success: true }
}