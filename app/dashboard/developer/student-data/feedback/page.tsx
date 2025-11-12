import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { DeleteDialog } from "@/components/teacher/delete-dialog"
import { deleteAIFeedbackAsDeveloper } from "@/app/actions/developer"

export default async function AIFeedbackLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") redirect("/dashboard")

  const { data: feedbackItems } = await supabase
    .from("ai_exercise_feedback")
    .select("*, profiles(full_name), exercises(chapters(title))")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/developer/student-data">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Student Data
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">AI Feedback Log</h1>
          <p className="text-sm text-muted-foreground">Total feedback items: {feedbackItems?.length || 0}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedbackItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.profiles?.full_name || "N/A"}</TableCell>
                  <TableCell>{item.exercises?.chapters?.title || "N/A"}</TableCell>
                  <TableCell className="max-w-sm truncate">{item.summary}</TableCell>
                  <TableCell>{format(new Date(item.created_at), "PPp")}</TableCell>
                  <TableCell className="text-right">
                    <DeleteDialog id={item.id} type="AI feedback" onDelete={deleteAIFeedbackAsDeveloper} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}