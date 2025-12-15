import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PlatformStatusControls } from "@/components/developer/platform-status-controls"
import { RegistrationControl } from "@/components/developer/registration-control"

export default async function PlatformStatusPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") redirect("/dashboard")

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: statuses } = await adminSupabase.from("platform_status").select("role, status, maintenance_message")
  const { data: registrationSetting } = await adminSupabase
    .from("platform_settings")
    .select("value")
    .eq("key", "registration_enabled")
    .single()

  const studentStatus = statuses?.find((s) => s.role === "student")
  const teacherStatus = statuses?.find((s) => s.role === "teacher")
  const registrationEnabled = registrationSetting?.value ?? true // Default to true if not set

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
        <RegistrationControl initialEnabled={registrationEnabled} />
        
        <PlatformStatusControls
          role="student"
          initialStatus={studentStatus?.status || "live"}
          initialMaintenanceMessage={studentStatus?.maintenance_message}
        />
        <PlatformStatusControls
          role="teacher"
          initialStatus={teacherStatus?.status || "live"}
          initialMaintenanceMessage={teacherStatus?.maintenance_message}
        />
      </div>
    </div>
  )
}