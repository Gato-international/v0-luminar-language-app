import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Award, Target, TrendingUp, BookOpen } from "lucide-react"
import Link from "next/link"
import { AIStudentChat } from "@/components/teacher/ai-student-chat"

interface StudentDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get teacher profile
  const { data: teacherProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!teacherProfile || teacherProfile.role !== "teacher") {
    redirect("/auth/login")
  }

  // Get student profile
  const { data: student } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (!student || student.role !== "student") {
    redirect("/dashboard/teacher/students")
  }

  // Get student progress
  const { data: progressData } = await supabase
    .from("student_progress")
    .select(
      `
      *,
      chapters (
        title,
        description
      )
    `,
    )
    .eq("student_id", id)

  // Get student exercises
  const { data: exercises } = await supabase
    .from("exercises")
    .select(
      `
      *,
      chapters (
        title
      )
    `,
    )
    .eq("student_id", id)
    .order("created_at", { ascending: false })

  // Calculate overall stats
  const totalCompleted = progressData?.reduce((sum, p) => sum + p.completed_exercises, 0) || 0
  const totalCorrect = progressData?.reduce((sum, p) => sum + p.total_correct, 0) || 0
  const totalAttempts = progressData?.reduce((sum, p) => sum + p.total_attempts, 0) || 0
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/teacher/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{student.full_name || "Student"}</h1>
              <p className="text-sm text-muted-foreground">{student.email}</p>
            </div>
            <Badge variant="outline">Student</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-2 gap-8">
        {/* Left Column: AI Chat */}
        <div className="lg:col-span-1">
          <AIStudentChat studentId={student.id} />
        </div>

        {/* Right Column: Stats and Progress */}
        <div className="lg:col-span-1 space-y-8">
          {/* Overall Stats */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Exercises</p>
                    <p className="text-2xl font-bold">{totalCompleted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="text-2xl font-bold">{overallAccuracy}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress by Chapter */}
          <Card>
            <CardHeader>
              <CardTitle>Progress by Chapter</CardTitle>
            </CardHeader>
            <CardContent>
              {progressData && progressData.length > 0 ? (
                <div className="space-y-4">
                  {progressData.map((progress) => {
                    const completionRate = Math.round(
                      (progress.completed_exercises / Math.max(progress.total_exercises, 1)) * 100,
                    )
                    return (
                      <div key={progress.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{progress.chapters?.title}</p>
                          </div>
                          <Badge variant="outline">{progress.accuracy_percentage.toFixed(1)}%</Badge>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No progress data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Exercises */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              {exercises && exercises.length > 0 ? (
                <div className="space-y-3">
                  {exercises.slice(0, 5).map((exercise) => (
                    <Link key={exercise.id} href={`/exercise/${exercise.id}/results`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{exercise.chapters?.title}</p>
                        </div>
                        <Badge variant={exercise.status === "completed" ? "default" : "secondary"}>
                          {exercise.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No exercises yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}