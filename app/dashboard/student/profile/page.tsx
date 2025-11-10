import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProgressStats } from "@/components/student/progress-stats"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"
import { UserNav } from "@/components/student/user-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default async function StudentProfilePage() {
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

  // Get student progress for all chapters
  const { data: progressData } = await supabase
    .from("student_progress")
    .select(
      `
      *,
      chapters (
        title
      )
    `,
    )
    .eq("student_id", user.id)

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
              <p className="text-sm text-muted-foreground">Student Profile</p>
            </div>
          </div>
          <UserNav profile={profile} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/dashboard/student">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h2 className="text-3xl font-bold mb-2">{profile.full_name}'s Profile</h2>
          <p className="text-muted-foreground">Your learning statistics and progress</p>
        </div>

        {/* Progress Stats */}
        <ProgressStats
          totalCompleted={totalCompleted}
          overallAccuracy={overallAccuracy}
          totalAttempts={totalAttempts}
          chaptersStarted={progressData?.length || 0}
        />

        {/* Progress by Chapter */}
        <Card className="mt-8">
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
                          <p className="text-sm text-muted-foreground">
                            {progress.completed_exercises} of {progress.total_exercises || "..."} exercises
                          </p>
                        </div>
                        <Badge variant="outline">{progress.accuracy_percentage.toFixed(1)}% accuracy</Badge>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No progress data yet. Start a chapter to see your progress here!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}