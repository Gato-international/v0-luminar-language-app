import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Redirect based on role
  if (profile.role === "developer") {
    redirect("/dashboard/developer")
  } else if (profile.role === "teacher") {
    redirect("/dashboard/teacher")
  } else {
    redirect("/dashboard/student")
  }
}