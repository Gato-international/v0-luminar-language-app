import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, TrendingUp, Settings, LogOut, FileText } from "lucide-react"
import Link from "next/link"

export default async function TeacherDashboardPage() {
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

  // Get total students
  const { count: totalStudents } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")

  // Get total chapters
  const { count: totalChapters } = await supabase.from("chapters").select("*", { count: "exact", head: true })

  // Get total exercises completed
  const { count: totalExercises } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")

  // Get recent student activity
  const { data: recentActivity } = await supabase
    .from("exercises")
    .select(
      `
      *,
      profiles!exercises_student_id_fkey (
        full_name,
        email
      ),
      chapters (
        title
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10)

  // Get top performing students
  const { data: topStudents } = await supabase
    .from("student_progress")
    .select(
      `
      *,
      profiles!student_progress_student_id_fkey (
        id,
        full_name,
        email
      )
    `,
    )
    .order("accuracy_percentage", { ascending: false })
    .limit(5)

  // Calculate overall statistics
  const { data: allProgress } = await supabase.from("student_progress").select("*")

  const totalCompleted = allProgress?.reduce((sum, p) => sum + p.completed_exercises, 0) || 0
  const totalCorrect = allProgress?.reduce((sum, p) => sum + p.total_correct, 0) || 0
  const totalAttempts = allProgress?.reduce((sum, p) => sum + p.total_attempts, 0) || 0
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Luminar</h1>
              <p className="text-sm text-muted-foreground">Teacher Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{profile.full_name || "Teacher"}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
            </div>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="icon" type="submit">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile.full_name?.split(" ")[0] || "Teacher"}!</h2>
          <p className="text-muted-foreground">Manage your students and content</p>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Chapters</p>
                  <p className="text-2xl font-bold">{totalChapters || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Exercises Completed</p>
                  <p className="text-2xl font-bold">{totalExercises || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                  <p className="text-2xl font-bold">{overallAccuracy}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/teacher/students">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <CardTitle className="text-lg">View Students</CardTitle>
                </div>
                <CardDescription>See all students and their progress</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/teacher/content">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-500" />
                  </div>
                  <CardTitle className="text-lg">Manage Content</CardTitle>
                </div>
                <CardDescription>Add and edit chapters and sentences</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/dashboard/teacher/settings">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-purple-500" />
                  </div>
                  <CardTitle className="text-lg">Settings</CardTitle>
                </div>
                <CardDescription>Configure platform settings</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Performing Students */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Students</CardTitle>
              <CardDescription>Students with highest accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              {topStudents && topStudents.length > 0 ? (
                <div className="space-y-3">
                  {topStudents.map((progress, index) => (
                    <Link
                      key={progress.id}
                      href={`/dashboard/teacher/students/${progress.profiles?.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{progress.profiles?.full_name || "Student"}</p>
                        <p className="text-xs text-muted-foreground truncate">{progress.profiles?.email}</p>
                      </div>
                      <Badge variant="outline">{progress.accuracy_percentage.toFixed(1)}%</Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No student data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest exercises from all students</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((exercise) => (
                    <div key={exercise.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          exercise.status === "completed" ? "bg-green-500/10" : "bg-blue-500/10"
                        }`}
                      >
                        {exercise.status === "completed" ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{exercise.profiles?.full_name || "Student"}</p>
                        <p className="text-xs text-muted-foreground truncate">{exercise.chapters?.title}</p>
                      </div>
                      <Badge variant={exercise.status === "completed" ? "default" : "secondary"} className="text-xs">
                        {exercise.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
