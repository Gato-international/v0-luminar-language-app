import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default async function EmailManagementPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") redirect("/dashboard")

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
          <h1 className="text-2xl font-bold">Email Management</h1>
          <p className="text-sm text-muted-foreground">Configure and manage automated emails.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Automated Welcome Email</CardTitle>
            <CardDescription>
              This email is automatically sent to new users upon successful signup and email confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border bg-green-500/10 p-4 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">The welcome email trigger is active.</p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              The email content is managed within the{" "}
              <code className="bg-muted px-1 py-0.5 rounded-sm">/supabase/functions/send-welcome-email/index.ts</code>{" "}
              file. Building a full email template editor is a larger project planned for the future.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}