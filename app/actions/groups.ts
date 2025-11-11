"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createGroup(name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("groups").insert({ name })
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/groups")
}

export async function updateGroup(id: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("groups").update({ name }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/groups")
}

export async function deleteGroup(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("groups").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/groups")
}