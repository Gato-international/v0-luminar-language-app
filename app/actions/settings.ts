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

export async function updatePlatformSetting(key: string, value: boolean) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || (profile.role !== "teacher" && profile.role !== "developer")) throw new Error("Unauthorized")

  // Use admin client to bypass RLS for platform_settings
  const supabaseAdmin = getSupabaseAdmin()

  const { error } = await supabaseAdmin
    .from("platform_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key)

  if (error) {
    // If the setting doesn't exist, create it
    if (error.code === "PGRST116") {
      // No rows returned
      const { error: insertError } = await supabaseAdmin.from("platform_settings").insert({ key, value })
      if (insertError) throw new Error(insertError.message)
    } else {
      throw new Error(error.message)
    }
  }

  revalidatePath("/dashboard/teacher/settings")
}