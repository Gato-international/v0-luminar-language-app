"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createSentence(data: {
  text: string
  chapter_id: string
  difficulty: string
  annotations?: Array<{ wordIndex: number; wordText: string; caseId: string; explanation: string }>
}) {
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

  const { data: sentence, error } = await supabase
    .from("sentences")
    .insert({
      text: data.text,
      chapter_id: data.chapter_id,
      difficulty: data.difficulty,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (data.annotations && data.annotations.length > 0 && sentence) {
    const annotationsToInsert = data.annotations.map((ann) => ({
      sentence_id: sentence.id,
      word_index: ann.wordIndex,
      word_text: ann.wordText,
      grammatical_case_id: ann.caseId,
      explanation: ann.explanation || null,
    }))

    const { error: annotationsError } = await supabase.from("word_annotations").insert(annotationsToInsert)

    if (annotationsError) {
      throw new Error(annotationsError.message)
    }
  }

  revalidatePath("/dashboard/teacher/content/sentences")
}

export async function updateSentence(
  id: string,
  data: {
    text: string
    chapter_id: string
    difficulty: string
    annotations?: Array<{ wordIndex: number; wordText: string; caseId: string; explanation: string }>
  },
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

  if (data.annotations !== undefined) {
    // Delete old annotations
    await supabase.from("word_annotations").delete().eq("sentence_id", id)

    // Insert new annotations if provided
    if (data.annotations.length > 0) {
      const annotationsToInsert = data.annotations.map((ann) => ({
        sentence_id: id,
        word_index: ann.wordIndex,
        word_text: ann.wordText,
        grammatical_case_id: ann.caseId,
        explanation: ann.explanation || null,
      }))

      const { error: annotationsError } = await supabase.from("word_annotations").insert(annotationsToInsert)

      if (annotationsError) {
        throw new Error(annotationsError.message)
      }
    }
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
