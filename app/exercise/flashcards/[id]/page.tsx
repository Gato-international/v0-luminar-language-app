import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FlashcardExercise } from "@/components/student/flashcard-exercise"

interface FlashcardExercisePageProps {
  params: { id: string }
}

export default async function FlashcardExercisePage({ params }: FlashcardExercisePageProps) {
  const { id: setId } = params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: set } = await supabase.from("flashcard_sets").select("*, chapters(title)").eq("id", setId).single()

  if (!set) {
    redirect("/dashboard/student/word-learning")
  }

  const { data: flashcards } = await supabase.from("flashcards").select("*").eq("set_id", setId)

  if (!flashcards || flashcards.length === 0) {
    redirect("/dashboard/student/word-learning")
  }

  return <FlashcardExercise set={set} flashcards={flashcards} />
}