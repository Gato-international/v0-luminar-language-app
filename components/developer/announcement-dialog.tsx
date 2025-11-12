"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil } from "lucide-react"
import { createAnnouncement, updateAnnouncement } from "@/app/actions/announcements"
import { toast } from "sonner"
import { format } from "date-fns"

interface AnnouncementDialogProps {
  announcement?: any
}

export function AnnouncementDialog({ announcement }: AnnouncementDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        if (announcement) {
          await updateAnnouncement(announcement.id, formData)
          toast.success("Announcement updated successfully.")
        } else {
          await createAnnouncement(formData)
          toast.success("Announcement created successfully.")
        }
        setOpen(false)
      } catch (error: any) {
        toast.error("Operation failed", { description: error.message })
      }
    })
  }

  const expiresDate = announcement?.expires_at ? format(new Date(announcement.expires_at), "yyyy-MM-dd") : ""

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {announcement ? (
          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" /> Create Announcement</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{announcement ? "Edit Announcement" : "Create New Announcement"}</DialogTitle>
          <DialogDescription>Fill in the details for the popup announcement.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={announcement?.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" name="content" defaultValue={announcement?.content} required rows={5} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_role">Target Audience</Label>
              <Select name="target_role" defaultValue={announcement?.target_role || "student"} required>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires_at">Expires At (Optional)</Label>
              <Input id="expires_at" name="expires_at" type="date" defaultValue={expiresDate} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cta_text">Button Text (Optional)</Label>
              <Input id="cta_text" name="cta_text" defaultValue={announcement?.cta_text || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cta_link">Button Link (Optional)</Label>
              <Input id="cta_link" name="cta_link" defaultValue={announcement?.cta_link || ""} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is_active" name="is_active" defaultChecked={announcement?.is_active ?? true} />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}