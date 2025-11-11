"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createGender(name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("genders").insert({ name })
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/genders")
}

export async function updateGender(id: string, name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("genders").update({ name }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/genders")
}

export async function deleteGender(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("genders").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/genders")
}