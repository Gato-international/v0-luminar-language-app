"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function checkDeveloperRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") throw new Error("Forbidden: Not a developer")
}

export async function deleteExerciseAsDeveloper(exerciseId: string) {
  await checkDeveloperRole()
  const supabase = await createClient()
  const { error } = await supabase.from("exercises").delete().eq("id", exerciseId)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/developer/student-data/exercises")
}

export async function deleteAIFeedbackAsDeveloper(feedbackId: string) {
  await checkDeveloperRole()
  const supabase = await createClient()
  const { error } = await supabase.from("ai_exercise_feedback").delete().eq("id", feedbackId)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/developer/student-data/feedback")
}