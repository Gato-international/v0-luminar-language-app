"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function checkAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || !["teacher", "developer"].includes(profile.role)) {
    throw new Error("Forbidden")
  }
}

export async function createGender(name: string) {
  await checkAuth()
  const supabase = await createClient()
  const { error } = await supabase.from("genders").insert({ name })
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/genders")
  revalidatePath("/dashboard/developer/content/genders")
}

export async function updateGender(id: string, name: string) {
  await checkAuth()
  const supabase = await createClient()
  const { error } = await supabase.from("genders").update({ name }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/genders")
  revalidatePath("/dashboard/developer/content/genders")
}

export async function deleteGender(id: string) {
  await checkAuth()
  const supabase = await createClient()
  const { error } = await supabase.from("genders").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/genders")
  revalidatePath("/dashboard/developer/content/genders")
}