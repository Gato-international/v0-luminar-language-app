import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PlatformStatusControls } from "@/components/developer/platform-status-controls"

export default async function PlatformStatusPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") redirect("/dashboard")

  const { data: statuses } = await supabase.from("platform_status").select("role, status")

  const studentStatus = statuses?.find((s) => s.role === "student")?.status || "live"
  const teacherStatus = statuses?.find((s) => s.role === "teacher")?.status || "live"

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/developer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Developer Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Platform Status</h1>
          <p className="text-sm text-muted-foreground">
            Enable maintenance mode or other statuses for different user roles.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <PlatformStatusControls role="student" initialStatus={studentStatus} />
        <PlatformStatusControls role="teacher" initialStatus={teacherStatus} />
      </div>
    </div>
  )
}