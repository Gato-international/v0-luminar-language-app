"use client"

import { useTransition, useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateRegistrationStatus } from "@/app/actions/developer"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

interface RegistrationControlProps {
  initialEnabled: boolean
}

export function RegistrationControl({ initialEnabled }: RegistrationControlProps) {
  const [isPending, startTransition] = useTransition()
  // Use local state for optimistic updates
  const [isEnabled, setIsEnabled] = useState(initialEnabled)

  // Sync with server state when it changes
  useEffect(() => {
    setIsEnabled(initialEnabled)
  }, [initialEnabled])

  const handleToggle = (checked: boolean) => {
    // Optimistically update the UI
    setIsEnabled(checked)
    
    startTransition(async () => {
      try {
        await updateRegistrationStatus(checked)
        toast.success(checked ? "Registration enabled" : "Registration disabled")
      } catch (error: any) {
        // Revert state on error
        setIsEnabled(!checked)
        toast.error("Failed to update registration status", { description: error.message })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <UserPlus className="h-5 w-5 text-blue-500" />
          </div>
          <CardTitle className="text-lg">User Registration</CardTitle>
        </div>
        <CardDescription>
          Control whether new users can sign up for the platform. Login will always remain active.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="registration-mode" className="text-base">
              Allow Registration
            </Label>
            <span className="text-sm text-muted-foreground">
              {isEnabled
                ? "New users can create accounts."
                : "Sign-up page is disabled."}
            </span>
          </div>
          <Switch
            id="registration-mode"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
        </div>
      </CardContent>
    </Card>
  )
}
