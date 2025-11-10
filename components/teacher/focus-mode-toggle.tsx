"use client"

import { useState, useTransition } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updatePlatformSetting } from "@/app/actions/settings"
import { toast } from "sonner"

interface FocusModeToggleProps {
  initialValue: boolean
}

export function FocusModeToggle({ initialValue }: FocusModeToggleProps) {
  const [isChecked, setIsChecked] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (checked: boolean) => {
    setIsChecked(checked)
    startTransition(async () => {
      try {
        await updatePlatformSetting("enforce_test_focus_mode", checked)
        toast.success(`Focus mode has been ${checked ? "enabled" : "disabled"}.`)
      } catch (error) {
        toast.error("Failed to update setting.")
        // Revert state on error
        setIsChecked(!checked)
      }
    })
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-1.5">
        <Label htmlFor="focus-mode" className="text-base">
          Enforce Test Focus Mode
        </Label>
        <p className="text-sm text-muted-foreground">
          When enabled, students must enter fullscreen mode to take a test and cannot exit until it's complete.
        </p>
      </div>
      <Switch
        id="focus-mode"
        checked={isChecked}
        onCheckedChange={handleToggle}
        disabled={isPending}
        aria-label="Toggle focus mode"
      />
    </div>
  )
}