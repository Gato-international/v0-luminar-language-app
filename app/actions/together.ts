"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export async function createTogetherSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 1. Create the session
  const { data: session, error: sessionError } = await supabase
    .from("together_sessions")
    .insert({ created_by: user.id })
    .select()
    .single()

  if (sessionError) throw new Error(`Failed to create session: ${sessionError.message}`)

  // 2. Fetch 10 random sentences and 10 random flashcards
  const { data: sentences } = await supabase.rpc("get_random_sentences", { limit_count: 10 })
  const { data: flashcards } = await supabase.rpc("get_random_flashcards", { limit_count: 10 })

  if (!sentences || !flashcards) throw new Error("Could not fetch assignments.")

  // 3. Create assignment list
  const sentenceAssignments = sentences.map((s) => ({
    session_id: session.id,
    assignment_type: "sentence",
    source_id: s.id,
  }))
  const flashcardAssignments = flashcards.map((f) => ({
    session_id: session.id,
    assignment_type: "flashcard",
    source_id: f.id,
  }))

  const allAssignments = shuffleArray([...sentenceAssignments, ...flashcardAssignments]).map((assignment, index) => ({
    ...assignment,
    order: index + 1,
  }))

  // 4. Insert assignments into the database
  const { error: assignmentError } = await supabase.from("session_assignments").insert(allAssignments)
  if (assignmentError) throw new Error(`Failed to create assignments: ${assignmentError.message}`)

  // 5. Redirect to the new session lobby
  redirect(`/together/${session.id}`)
}

export async function startTogetherSession(sessionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Verify the user is the host
  const { data: session, error: sessionError } = await supabase
    .from("together_sessions")
    .select("created_by")
    .eq("id", sessionId)
    .single()

  if (sessionError) throw new Error("Session not found.")
  if (session.created_by !== user.id) throw new Error("Only the host can start the session.")

  // Update the session status
  const { error: updateError } = await supabase
    .from("together_sessions")
    .update({ status: "in_progress" })
    .eq("id", sessionId)

  if (updateError) throw new Error(`Failed to start session: ${updateError.message}`)
}

export async function leaveTogetherSession(sessionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from("session_participants")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", user.id)

  if (error) {
    // Don't throw, just log it, so the redirect still happens
    console.error("Error leaving session:", error.message)
  }

  redirect("/dashboard/student")
}