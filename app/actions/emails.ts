"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function checkDeveloperRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") throw new Error("Forbidden: Not a developer")
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