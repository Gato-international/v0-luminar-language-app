import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChapterCard } from "@/components/student/chapter-card"
import { ProgressStats } from "@/components/student/progress-stats"
import { RecentActivity } from "@/components/student/recent-activity"
import { Button } from "@/components/ui/button"
import { BookOpen, LogOut } from "lucide-react"

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "student") {
    redirect("/auth/login")
  }

  // Get all chapters
  const { data: chapters } = await supabase.from("chapters").select("*").order("order_index")

  // Get student progress for all chapters
  const { data: progressData } = await supabase.from("student_progress").select("*").eq("student_id", user.id)

  // Get recent exercises
  const { data: recentExercises } = await supabase
    .from("exercises")
    .select(`
      *,
      chapters (
        title
      )
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate overall stats
  const totalCompleted = progressData?.reduce((sum, p) => sum + p.completed_exercises, 0) || 0
  const totalCorrect = progressData?.reduce((sum, p) => sum + p.total_correct, 0) || 0
  const totalAttempts = progressData?.reduce((sum, p) => sum + p.total_attempts, 0) || 0
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
              <p className="text-sm text-muted-foreground">Student Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{profile.full_name || "Student"}</p>
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
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile.full_name?.split(" ")[0] || "Student"}!</h2>
          <p className="text-muted-foreground">Continue your journey to master Dutch grammar</p>
        </div>

        {/* Progress Stats */}
        <ProgressStats
          totalCompleted={totalCompleted}
          overallAccuracy={overallAccuracy}
          totalAttempts={totalAttempts}
          chaptersStarted={progressData?.length || 0}
        />

        {/* Chapters Grid */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold">Chapters</h3>
            <p className="text-sm text-muted-foreground">{chapters?.length || 0} chapters available</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters?.map((chapter) => {
              const progress = progressData?.find((p) => p.chapter_id === chapter.id)
              return <ChapterCard key={chapter.id} chapter={chapter} progress={progress} />
            })}
          </div>
        </div>

        {/* Recent Activity */}
        {recentExercises && recentExercises.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Recent Activity</h3>
            <RecentActivity exercises={recentExercises} />
          </div>
        )}
      </div>
    </div>
  )
}
