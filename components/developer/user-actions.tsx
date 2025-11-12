"use client"

import { useTransition } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, UserCog } from "lucide-react"
import { toast } from "sonner"
import { updateUserRole, deleteUser } from "@/app/actions/users"
import { DeleteDialog } from "@/components/teacher/delete-dialog"

interface UserActionsProps {
  user: {
    id: string
    role: string
  }
  isCurrentUser: boolean
}

export function UserActions({ user, isCurrentUser }: UserActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (newRole: "student" | "teacher" | "developer") => {
    if (isCurrentUser && newRole !== "developer") {
      toast.error("You cannot demote your own account.")
      return
    }
    startTransition(async () => {
      try {
        await updateUserRole(user.id, newRole)
        toast.success("User role updated successfully.")
      } catch (error: any) {
        toast.error("Failed to update role", { description: error.message })
      }
    })
  }

  const handleDelete = async () => {
    if (isCurrentUser) {
      toast.error("You cannot delete your own account.")
      return
    }
    return deleteUser(user.id)
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <UserCog className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleRoleChange("student")} disabled={user.role === "student"}>
            Set as Student
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRoleChange("teacher")} disabled={user.role === "teacher"}>
            Set as Teacher
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleRoleChange("developer")} disabled={user.role === "developer"}>
            Set as Developer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDialog id={user.id} type="user" onDelete={handleDelete} />
    </div>
  )
}