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

export async function createAnnouncement(formData: FormData) {
  await checkDeveloperRole()
  const supabase = await createClient()

  const data = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    target_role: formData.get("target_role") as string,
    is_active: formData.get("is_active") === "on",
    expires_at: formData.get("expires_at") ? new Date(formData.get("expires_at") as string).toISOString() : null,
    cta_text: formData.get("cta_text") as string || null,
    cta_link: formData.get("cta_link") as string || null,
  }

  const { error } = await supabase.from("announcements").insert(data)
  if (error) throw new Error(error.message)

  revalidatePath("/dashboard/developer/announcements")
}

export async function updateAnnouncement(id: string, formData: FormData) {
  await checkDeveloperRole()
  const supabase = await createClient()

  const data = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    target_role: formData.get("target_role") as string,
    is_active: formData.get("is_active") === "on",
    expires_at: formData.get("expires_at") ? new Date(formData.get("expires_at") as string).toISOString() : null,
    cta_text: formData.get("cta_text") as string || null,
    cta_link: formData.get("cta_link") as string || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("announcements").update(data).eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/dashboard/developer/announcements")
}

export async function deleteAnnouncement(id: string) {
  await checkDeveloperRole()
  const supabase = await createClient()
  const { error } = await supabase.from("announcements").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/developer/announcements")
}