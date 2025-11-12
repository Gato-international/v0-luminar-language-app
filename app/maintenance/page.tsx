import { createClient } from "@/lib/supabase/server"
import { HardHat } from "lucide-react"
import { MaintenanceUpdate } from "@/components/shared/maintenance-update"

export default async function MaintenancePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let maintenanceMessage = "We're making some improvements to the platform."

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (profile) {
      const { data: platformStatus } = await supabase
        .from("platform_status")
        .select("maintenance_message")
        .eq("role", profile.role)
        .eq("status", "maintenance")
        .single()

      if (platformStatus?.maintenance_message) {
        maintenanceMessage = platformStatus.maintenance_message
      }
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 text-center space-y-8">
      <div>
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <HardHat className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Under Maintenance</h1>
        <p className="mt-2 text-muted-foreground">
          We'll be back online shortly. Thank you for your patience!
        </p>
      </div>
      <MaintenanceUpdate text={maintenanceMessage} />
    </div>
  )
}