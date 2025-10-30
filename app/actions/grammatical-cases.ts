"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createGrammaticalCase(data: {
  name: string
  abbreviation: string
  color: string
  description: string | null
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

  const { error } = await supabase.from("grammatical_cases").insert({
    name: data.name,
    abbreviation: data.abbreviation,
    color: data.color,
    description: data.description,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/cases")
}

export async function updateGrammaticalCase(
  id: string,
  data: {
    name: string
    abbreviation: string
    color: string
    description: string | null
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
    .from("grammatical_cases")
    .update({
      name: data.name,
      abbreviation: data.abbreviation,
      color: data.color,
      description: data.description,
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/cases")
}

export async function deleteGrammaticalCase(id: string) {
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

  const { error } = await supabase.from("grammatical_cases").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/cases")
}