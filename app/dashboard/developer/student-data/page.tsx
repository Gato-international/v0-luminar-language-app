import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BrainCircuit, FileText } from "lucide-react"
import Link from "next/link"

export default async function StudentDataPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") redirect("/dashboard")

  const { count: exercisesCount } = await supabase.from("exercises").select("*", { count: "exact", head: true })
  const { count: feedbackCount } = await supabase.from("ai_exercise_feedback").select("*", { count: "exact", head: true })

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
          <h1 className="text-2xl font-bold">Student Data Management</h1>
          <p className="text-sm text-muted-foreground">Monitor all student-generated data.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/dashboard/developer/student-data/exercises">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>All Exercises</CardTitle>
                </div>
                <CardDescription>View and manage every exercise record in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{exercisesCount || 0}</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/developer/student-data/feedback">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <BrainCircuit className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle>AI Feedback Log</CardTitle>
                </div>
                <CardDescription>Review all generated AI feedback for quality and debugging.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">{feedbackCount || 0}</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}