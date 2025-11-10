"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updatePlatformSetting(key: string, value: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "teacher") throw new Error("Unauthorized")

  const { error } = await supabase
    .from("platform_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key)

  if (error) {
    // If the setting doesn't exist, create it
    if (error.code === "PGRST116") {
      // No rows returned
      const { error: insertError } = await supabase.from("platform_settings").insert({ key, value })
      if (insertError) throw new Error(insertError.message)
    } else {
      throw new Error(error.message)
    }
  }

  revalidatePath("/dashboard/teacher/settings")
}