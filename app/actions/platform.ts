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

export async function updatePlatformStatus(
  role: "student" | "teacher",
  status: "live" | "maintenance" | "test",
  maintenanceMessage?: string | null,
) {
  await checkDeveloperRole()
  const supabase = await createClient()

  const { data: existingStatus, error: selectError } = await supabase
    .from("platform_status")
    .select("id")
    .eq("role", role)
    .single()

  if (selectError && selectError.code !== "PGRST116") {
    throw new Error(selectError.message)
  }

  const dataToUpsert = {
    status,
    updated_at: new Date().toISOString(),
    maintenance_message: status === "maintenance" ? maintenanceMessage : null,
  }

  if (existingStatus) {
    const { error: updateError } = await supabase.from("platform_status").update(dataToUpsert).eq("role", role)
    if (updateError) throw new Error(updateError.message)
  } else {
    const { error: insertError } = await supabase.from("platform_status").insert({ role, ...dataToUpsert })
    if (insertError) throw new Error(insertError.message)
  }

  revalidatePath("/dashboard/developer/platform-status")
}