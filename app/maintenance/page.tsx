import { HardHat } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 text-center">
      <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
        <HardHat className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Under Maintenance</h1>
      <p className="mt-2 text-muted-foreground">
        We're currently performing some scheduled maintenance.
        <br />
        We'll be back online shortly. Thank you for your patience!
      </p>
    </div>
  )
}