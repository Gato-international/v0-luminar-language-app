import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExerciseInterface } from "@/components/exercise/exercise-interface"

interface ExercisePageProps {
  params: Promise<{ id: string }>
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
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
    redirect("/dashboard/student")
  }

  // Verify the exercise belongs to the current user
  if (exercise.student_id !== user.id) {
    redirect("/dashboard/student")
  }

  // If exercise is already completed, redirect to results
  if (exercise.status === "completed") {
    redirect(`/exercise/${id}/results`)
  }

  // Get sentences for this chapter with the specified difficulty
  const { data: sentences } = await supabase
    .from("sentences")
    .select("*")
    .eq("chapter_id", exercise.chapter_id)
    .eq("difficulty", exercise.difficulty)
    .limit(exercise.total_questions)

  // If not enough sentences, get any sentences from the chapter
  let finalSentences = sentences || []
  if (finalSentences.length < exercise.total_questions) {
    const { data: allSentences } = await supabase
      .from("sentences")
      .select("*")
      .eq("chapter_id", exercise.chapter_id)
      .limit(exercise.total_questions)
    finalSentences = allSentences || []
  }

  // Get word annotations for these sentences
  const sentenceIds = finalSentences.map((s) => s.id)
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

  // Get all grammatical cases
  const { data: grammaticalCases } = await supabase.from("grammatical_cases").select("*").order("name")

  // Get existing attempts for this exercise
  const { data: existingAttempts } = await supabase.from("exercise_attempts").select("*").eq("exercise_id", id)

  // Get the platform setting for focus mode
  const { data: focusModeSetting } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "enforce_test_focus_mode")
    .single()

  const enforceFocusMode = focusModeSetting?.value ?? true // Default to true

  return (
    <ExerciseInterface
      exercise={exercise}
      sentences={finalSentences}
      annotations={annotations || []}
      grammaticalCases={grammaticalCases || []}
      existingAttempts={existingAttempts || []}
      enforceFocusMode={enforceFocusMode}
    />
  )
}