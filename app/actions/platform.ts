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

  // Check if a record for this role already exists
  const { data: existingStatus, error: selectError } = await supabase
    .from("platform_status")
    .select("id")
    .eq("role", role)
    .single()

  // Ignore 'PGRST116' which means no rows were found, but throw other errors
  if (selectError && selectError.code !== "PGRST116") {
    throw new Error(selectError.message)
  }

  if (existingStatus) {
    // Update the existing record if it was found
    const { error: updateError } = await supabase
      .from("platform_status")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("role", role)
    if (updateError) throw new Error(updateError.message)
  } else {
    // Insert a new record if one didn't exist
    const { error: insertError } = await supabase.from("platform_status").insert({ role, status })
    if (insertError) throw new Error(insertError.message)
  }

  revalidatePath("/dashboard/developer/platform-status")
}