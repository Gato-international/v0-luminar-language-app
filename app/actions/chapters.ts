"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createChapter(data: { title: string; description: string; order_index: number }) {
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

  const { error } = await supabase.from("chapters").insert({
    title: data.title,
    description: data.description,
    order_index: data.order_index,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/chapters")
}

export async function updateChapter(id: string, data: { title: string; description: string; order_index: number }) {
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
    .from("chapters")
    .update({
      title: data.title,
      description: data.description,
      order_index: data.order_index,
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/chapters")
}

export async function deleteChapter(id: string) {
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

  const { error } = await supabase.from("chapters").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/dashboard/teacher/content/chapters")
}
