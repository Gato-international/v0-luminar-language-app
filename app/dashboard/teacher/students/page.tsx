import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function StudentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "teacher") {
    redirect("/auth/login")
  }

  // Get all students
  const { data: students } = await supabase.from("profiles").select("*").eq("role", "student").order("created_at")

  // Get progress for all students
  const { data: allProgress } = await supabase.from("student_progress").select("*")

  // Combine student data with their progress
  const studentsWithProgress = students?.map((student) => {
    const studentProgress = allProgress?.filter((p) => p.student_id === student.id) || []
    const totalCompleted = studentProgress.reduce((sum, p) => sum + p.completed_exercises, 0)
    const totalCorrect = studentProgress.reduce((sum, p) => sum + p.total_correct, 0)
    const totalAttempts = studentProgress.reduce((sum, p) => sum + p.total_attempts, 0)
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

    return {
      ...student,
      totalCompleted,
      accuracy,
      chaptersStarted: studentProgress.length,
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button asChild variant="ghost" className="mb-2">
                <Link href="/dashboard/teacher">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Students</h1>
              <p className="text-sm text-muted-foreground">View and manage all students</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-10" />
          </div>
        </div>

        {/* Students List */}
        {studentsWithProgress && studentsWithProgress.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentsWithProgress.map((student) => (
              <Link key={student.id} href={`/dashboard/teacher/students/${student.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{student.full_name || "Student"}</h3>
                        <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-lg bg-muted">
                          <p className="text-xs text-muted-foreground">Exercises</p>
                          <p className="text-lg font-bold">{student.totalCompleted}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted">
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                          <p className="text-lg font-bold">{student.accuracy}%</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted">
                          <p className="text-xs text-muted-foreground">Chapters</p>
                          <p className="text-lg font-bold">{student.chaptersStarted}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">View Details</span>
                        <Badge variant="outline">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {student.accuracy}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No students found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
