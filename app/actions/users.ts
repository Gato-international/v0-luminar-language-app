"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

// This function requires the Supabase Admin client to perform privileged actions
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

export async function updateUserRole(userId: string, newRole: "student" | "teacher" | "developer") {
  await checkDeveloperRole()
  const supabase = await createClient()
  const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/developer/users")
}

export async function deleteUser(userId: string) {
  await checkDeveloperRole()
  const supabaseAdmin = getSupabaseAdmin()
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
  revalidatePath("/dashboard/developer/users")
}