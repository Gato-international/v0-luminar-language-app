"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// --- Flashcard Set Actions ---

export async function createFlashcardSet(data: { title: string; description: string | null; chapter_id: string | null }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "teacher") throw new Error("Unauthorized")

  const { error } = await supabase.from("flashcard_sets").insert({
    title: data.title,
    description: data.description,
    chapter_id: data.chapter_id || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/flashcards")
}

export async function updateFlashcardSet(
  id: string,
  data: { title: string; description: string | null; chapter_id: string | null },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "teacher") throw new Error("Unauthorized")

  const { error } = await supabase
    .from("flashcard_sets")
    .update({
      title: data.title,
      description: data.description,
      chapter_id: data.chapter_id || null,
    })
    .eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/flashcards")
  revalidatePath(`/dashboard/teacher/content/flashcards/${id}`)
}

export async function deleteFlashcardSet(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "teacher") throw new Error("Unauthorized")

  const { error } = await supabase.from("flashcard_sets").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/teacher/content/flashcards")
}

// --- Individual Flashcard Actions ---

interface FlashcardData {
  set_id: string
  term: string
  definition: string
  stem: string
  group_id: string
  gender_id: string
  example_sentence: string | null
}

export async function createFlashcard(data: FlashcardData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "teacher") throw new Error("Unauthorized")

  const { error } = await supabase.from("flashcards").insert(data)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/teacher/content/flashcards/${data.set_id}`)
}

export async function updateFlashcard(
  id: string,
  setId: string,
  data: Omit<FlashcardData, "set_id">,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "teacher") throw new Error("Unauthorized")

  const { error } = await supabase.from("flashcards").update(data).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/teacher/content/flashcards/${setId}`)
}

export async function deleteFlashcard(id: string, setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "teacher") throw new Error("Unauthorized")

  const { error } = await supabase.from("flashcards").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/teacher/content/flashcards/${setId}`)
}

export async function importFlashcardsFromCSV(setId: string, csvContent: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "teacher") throw new Error("Unauthorized")

  // Fetch all existing groups and genders once to create a lookup map
  const { data: groups } = await supabase.from("groups").select("id, name")
  const { data: genders } = await supabase.from("genders").select("id, name")
  const groupMap = new Map(groups?.map(g => [g.name.toLowerCase(), g.id]))
  const genderMap = new Map(genders?.map(g => [g.name.toLowerCase(), g.id]))

  const flashcardsToInsert = []
  const rows = csvContent.split("\n").slice(1) // Skip header row

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].trim()
    if (!row) continue

    const [term, definition, stem, group_name, gender_name, example_sentence] = row.split(",").map(s => s.trim().replace(/"/g, ''))

    if (!term || !definition || !stem || !group_name || !gender_name) {
      throw new Error(`Row ${i + 2}: Missing required fields.`)
    }

    const groupId = groupMap.get(group_name.toLowerCase())
    if (!groupId) {
      throw new Error(`Row ${i + 2}: Group "${group_name}" not found. Please create it first.`)
    }

    const genderId = genderMap.get(gender_name.toLowerCase())
    if (!genderId) {
      throw new Error(`Row ${i + 2}: Gender "${gender_name}" not found. Please create it first.`)
    }

    flashcardsToInsert.push({
      set_id: setId,
      term,
      definition,
      stem,
      group_id: groupId,
      gender_id: genderId,
      example_sentence: example_sentence || null,
    })
  }

  if (flashcardsToInsert.length > 0) {
    const { error } = await supabase.from("flashcards").insert(flashcardsToInsert)
    if (error) throw new Error(error.message)
  }

  revalidatePath(`/dashboard/teacher/content/flashcards/${setId}`)
  return { count: flashcardsToInsert.length }
}