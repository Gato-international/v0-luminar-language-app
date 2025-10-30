"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createSentence(data: { text: string; chapter_id: string; difficulty: string }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "teacher") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("sentences").insert({
    text: data.text,
    chapter_id: data.chapter_id,
    difficulty: data.difficulty,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/sentences")
}

export async function updateSentence(id: string, data: { text: string; chapter_id: string; difficulty: string }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "teacher") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase
    .from("sentences")
    .update({
      text: data.text,
      chapter_id: data.chapter_id,
      difficulty: data.difficulty,
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/sentences")
}

export async function deleteSentence(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "teacher") {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("sentences").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/sentences")
}
