import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TogetherPlayground } from "@/components/student/together-playground"

interface TogetherPlayPageProps {
  params: Promise<{ id: string }>
}

export default async function TogetherPlayPage({ params }: TogetherPlayPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all session data in parallel
  const [sessionResult, participantsResult, assignmentsResult] = await Promise.all([
    supabase.from("together_sessions").select("*").eq("id", id).single(),
    supabase.from("session_participants").select("*, profiles(full_name)").eq("session_id", id),
    supabase.from("session_assignments").select("*").eq("session_id", id).order("order"),
  ])

  const { data: session, error: sessionError } = sessionResult
  if (sessionError || !session) redirect("/dashboard/student/together")

  const { data: participants } = participantsResult
  const { data: assignments } = assignmentsResult

  if (!participants || !assignments) throw new Error("Failed to load session data.")

  // Fetch all required sentences and flashcards
  const sentenceIds = assignments.filter((a) => a.assignment_type === "sentence").map((a) => a.source_id)
  const flashcardIds = assignments.filter((a) => a.assignment_type === "flashcard").map((a) => a.source_id)

  const [sentencesResult, flashcardsResult] = await Promise.all([
    sentenceIds.length > 0 ? supabase.from("sentences").select("*").in("id", sentenceIds) : Promise.resolve({ data: [] }),
    flashcardIds.length > 0 ? supabase.from("flashcards").select("*").in("id", flashcardIds) : Promise.resolve({ data: [] }),
  ])

  return (
    <TogetherPlayground
      initialSession={session}
      initialParticipants={participants}
      assignments={assignments}
      sentences={sentencesResult.data || []}
      flashcards={flashcardsResult.data || []}
      user={user}
    />
  )
}