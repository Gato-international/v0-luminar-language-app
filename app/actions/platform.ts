"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function checkDeveloperRole() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") throw new Error("Forbidden: Not a developer")
}

export async function updatePlatformStatus(role: "student" | "teacher", status: "live" | "maintenance" | "test") {
  await checkDeveloperRole()
  const supabase = await createClient()

  const { error } = await supabase
    .from("platform_status")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("role", role)

  if (error) throw new Error(error.message)

  revalidatePath("/dashboard/developer/platform-status")
}