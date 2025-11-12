"use client"

import { useState, useTransition, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Send } from "lucide-react"
import { createEmailTemplate, updateEmailTemplate, sendTestEmail } from "@/app/actions/emails"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface EmailTemplateDialogProps {
  template?: any
}

export function EmailTemplateDialog({ template }: EmailTemplateDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSendingTest, startTestTransition] = useTransition()
  const [testEmail, setTestEmail] = useState("")

  useEffect(() => {
    if (open) {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setTestEmail(user.email || "")
        }
      })
    }
  }, [open])

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        if (template) {
          await updateEmailTemplate(template.id, formData)
          toast.success("Email template updated successfully.")
        } else {
          await createEmailTemplate(formData)
          toast.success("Email template created successfully.")
        }
        setOpen(false)
      } catch (error: any) {
        toast.error("Operation failed", { description: error.message })
      }
    })
  }

  const handleSendTest = () => {
    if (!testEmail) {
      toast.error("Please enter an email address to send the test to.")
      return
    }
    startTestTransition(async () => {
      try {
        await sendTestEmail(template.id, testEmail)
        toast.success(`Test email sent to ${testEmail}`)
      } catch (error: any) {
        toast.error("Failed to send test email", { description: error.message })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {template ? (
          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" /> Create Template</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Email Template" : "Create New Email Template"}</DialogTitle>
          <DialogDescription>
            Design an email template. Use placeholders like <code>{"{{full_name}}"}</code> and <code>{"{{confirmation_link}}"}</code>.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input id="name" name="name" defaultValue={template?.name} required placeholder="e.g., welcome-email" />
            <p className="text-xs text-muted-foreground">A unique identifier for this template (e.g., 'welcome-email').</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" defaultValue={template?.subject} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">HTML Body</Label>
            <Textarea id="body" name="body" defaultValue={template?.body} required rows={10} />
          </div>

          {template && (
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <Label className="font-semibold">Send Test Email</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={isSendingTest}
                />
                <Button type="button" onClick={handleSendTest} disabled={isSendingTest}>
                  <Send className="h-4 w-4 mr-2" />
                  {isSendingTest ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}