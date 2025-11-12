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

export async function createGroup(name: string) {
  await checkAuth()
  const supabase = await createClient()
  const { error } = await supabase.from("groups").insert({ name })
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/groups")
  revalidatePath("/dashboard/developer/content/groups")
}

export async function updateGroup(id: string, name: string) {
  await checkAuth()
  const supabase = await createClient()
  const { error } = await supabase.from("groups").update({ name }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/groups")
  revalidatePath("/dashboard/developer/content/groups")
}

export async function deleteGroup(id: string) {
  await checkAuth()
  const supabase = await createClient()
  const { error } = await supabase.from("groups").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/groups")
  revalidatePath("/dashboard/developer/content/groups")
}