"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const getSupabaseAdmin = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.")
  }
  return createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

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

export async function updateRegistrationStatus(enabled: boolean) {
  await checkDeveloperRole()
  // Use admin client to bypass RLS for platform_settings
  const supabase = getSupabaseAdmin()
  
  const { error } = await supabase
    .from("platform_settings")
    .upsert({ key: "registration_enabled", value: enabled, updated_at: new Date().toISOString() }, { onConflict: "key" })
    
  if (error) throw new Error(error.message)
  revalidatePath("/auth/sign-up")
  revalidatePath("/dashboard/developer/platform-status")
}