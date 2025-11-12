import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { DeleteDialog } from "@/components/teacher/delete-dialog"
import { deleteExerciseAsDeveloper } from "@/app/actions/developer"

export default async function AllExercisesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") redirect("/dashboard")

  const { data: exercises } = await supabase
    .from("exercises")
    .select("*, profiles(full_name, email), chapters(title)")
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
          <h1 className="text-2xl font-bold">All Exercises</h1>
          <p className="text-sm text-muted-foreground">Total exercises: {exercises?.length || 0}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises?.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell>
                    <div className="font-medium">{exercise.profiles?.full_name || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{exercise.profiles?.email}</div>
                  </TableCell>
                  <TableCell>{exercise.chapters?.title}</TableCell>
                  <TableCell className="capitalize">{exercise.exercise_type}</TableCell>
                  <TableCell>
                    <Badge variant={exercise.status === "completed" ? "default" : "secondary"}>{exercise.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(exercise.created_at), "PPp")}</TableCell>
                  <TableCell className="text-right">
                    <DeleteDialog id={exercise.id} type="exercise" onDelete={deleteExerciseAsDeveloper} />
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