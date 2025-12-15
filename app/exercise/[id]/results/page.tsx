import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ResultsSummary } from "@/components/exercise/results-summary"
import { ResultsBreakdown } from "@/components/exercise/results-breakdown"
import { CasePerformance } from "@/components/exercise/case-performance"
import { ArrowLeft, RotateCcw } from "lucide-react"
import Link from "next/link"
import { PracticeFeedback } from "@/components/exercise/practice-feedback"
import { AIFeedbackDisplay } from "@/components/exercise/ai-feedback-display"

interface ResultsPageProps {
  params: Promise<{ id: string }>
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get exercise details
  const { data: exercise, error: exerciseError } = await supabase
    .from("exercises")
    .select(
      `
      *,
      chapters (
        id,
        title,
        description
      )
    `,
    )
    .eq("id", id)
    .single()

  if (exerciseError || !exercise) {
    redirect("/dashboard/student") // Redirect to student dashboard if exercise not found or error
  }

  // Authorization check:
  // Students can only view their own exercises.
  // Teachers can view any exercise.
  if (profile.role === "student" && exercise.student_id !== user.id) {
    redirect("/dashboard/student")
  }

  // Get all attempts for this exercise
  const { data: attempts } = await supabase
    .from("exercise_attempts")
    .select(
      `
      *,
      sentences (
        id,
        text,
        difficulty
      )
    `,
    )
    .eq("exercise_id", id)

  if (!attempts || attempts.length === 0) {
    // If no attempts, it means the exercise might not have been started or completed properly
    // Redirect to the exercise interface if it's still in progress, otherwise to dashboard
    if (exercise.status === "in_progress") {
      redirect(`/exercise/${id}`)
    } else {
      redirect("/dashboard/student")
    }
  }

  // Get all grammatical cases
  const { data: grammaticalCases } = await supabase.from("grammatical_cases").select("*").order("name")

  // Get word annotations for detailed review
  const sentenceIds = [...new Set(attempts.map((a) => a.sentence_id))]
  const { data: annotations } = await supabase
    .from("word_annotations")
    .select(
      `
      *,
      grammatical_cases (
        id,
        name,
        abbreviation,
        color
      )
    `,
    )
    .in("sentence_id", sentenceIds)

  // Calculate statistics
  const totalAttempts = attempts.length
  const correctAttempts = attempts.filter((a) => a.is_correct).length
  const accuracy = Math.round((correctAttempts / totalAttempts) * 100)
  const totalTimeSpent = attempts.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0)

  // Calculate performance by case
  const casePerformance = grammaticalCases?.map((grammaticalCase) => {
    const caseAttempts = attempts.filter((a) => a.correct_case_id === grammaticalCase.id)
    const caseCorrect = caseAttempts.filter((a) => a.is_correct).length
    const caseTotal = caseAttempts.length
    const caseAccuracy = caseTotal > 0 ? Math.round((caseCorrect / caseTotal) * 100) : 0

    return {
      case: grammaticalCase,
      correct: caseCorrect,
      total: caseTotal,
      accuracy: caseAccuracy,
    }
  })

  // Group attempts by sentence for detailed review
  const sentenceReviews = sentenceIds.map((sentenceId) => {
    const sentenceAttempts = attempts.filter((a) => a.sentence_id === sentenceId)
    const sentence = sentenceAttempts[0]?.sentences
    const sentenceAnnotations = annotations?.filter((a) => a.sentence_id === sentenceId) || []

    return {
      sentence,
      attempts: sentenceAttempts,
      annotations: sentenceAnnotations,
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Exercise Results</h1>
              <p className="text-sm text-muted-foreground">{exercise.chapters.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {profile.role === "student" && (
                <Button asChild variant="outline">
                  <Link href={`/exercise/setup?chapterId=${exercise.chapter_id}`}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Link>
                </Button>
              )}
              <Button asChild>
                <Link
                  href={
                    profile.role === "teacher" ? `/dashboard/teacher/students/${exercise.student_id}` : "/dashboard/student"
                  }
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {profile.role === "teacher" ? "Back to Student" : "Dashboard"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Results Summary */}
        <ResultsSummary
          accuracy={accuracy}
          correctAttempts={correctAttempts}
          totalAttempts={totalAttempts}
          timeSpent={totalTimeSpent}
          exerciseType={exercise.exercise_type}
          difficulty={exercise.difficulty}
        />

        {/* AI Feedback */}
        <div className="mt-8">
          <AIFeedbackDisplay exerciseId={exercise.id} />
        </div>

        {/* Personalized Feedback for Practice Mode */}
        {exercise.exercise_type === "practice" && casePerformance && (
          <div className="mt-8">
            <PracticeFeedback 
                casePerformance={casePerformance} 
                accuracy={accuracy} 
                totalQuestions={totalAttempts}
            />
          </div>
        )}

        {/* Case Performance */}
        {casePerformance && casePerformance.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Performance by Grammatical Case</h2>
            <CasePerformance performance={casePerformance} />
          </div>
        )}

        {/* Detailed Breakdown */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Detailed Review</h2>
          <ResultsBreakdown reviews={sentenceReviews} grammaticalCases={grammaticalCases || []} />
        </div>
      </div>
    </div>
  )
}