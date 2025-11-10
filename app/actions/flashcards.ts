"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createFlashcardSet(data: { title: string; description: string | null; chapter_id: string | null }) {
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

  const { error } = await supabase.from("flashcard_sets").insert({
    title: data.title,
    description: data.description,
    chapter_id: data.chapter_id || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/flashcards")
}

export async function updateFlashcardSet(
  id: string,
  data: { title: string; description: string | null; chapter_id: string | null },
) {
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
    .from("flashcard_sets")
    .update({
      title: data.title,
      description: data.description,
      chapter_id: data.chapter_id || null,
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/flashcards")
}

export async function deleteFlashcardSet(id: string) {
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

  const { error } = await supabase.from("flashcard_sets").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/flashcards")
}