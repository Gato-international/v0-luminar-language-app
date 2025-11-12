"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updatePlatformStatus } from "@/app/actions/platform"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

type Status = "live" | "maintenance" | "test"

interface PlatformStatusControlsProps {
  role: "student" | "teacher"
  initialStatus: Status
  initialMaintenanceMessage?: string | null
}

export function PlatformStatusControls({
  role,
  initialStatus,
  initialMaintenanceMessage,
}: PlatformStatusControlsProps) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [message, setMessage] = useState(initialMaintenanceMessage || "")
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updatePlatformStatus(role, status, message)
        toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} platform status updated to '${status}'.`)
      } catch (error: any) {
        toast.error("Update Failed", { description: error.message })
      }
    })
  }

  const getStatusColor = (s: Status) => {
    switch (s) {
      case "live":
        return "bg-green-500"
      case "maintenance":
        return "bg-red-500"
      case "test":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="capitalize">{role} Platform</CardTitle>
          <Badge className={cn("flex items-center gap-2 text-white", getStatusColor(initialStatus))}>
            <span className={cn("h-2 w-2 rounded-full bg-white", getStatusColor(initialStatus))} />
            Current: {initialStatus}
          </Badge>
        </div>
        <CardDescription>Control the access status for all {role} accounts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Select value={status} onValueChange={(v: Status) => setStatus(v)} disabled={isPending}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="test">Test</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
        {status === "maintenance" && (
          <Textarea
            placeholder="Describe what's being worked on... (e.g., Deploying new features for Chapter 5!)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
          />
        )}
      </CardContent>
    </Card>
  )
}