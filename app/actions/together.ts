"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
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

  // Update the session status. The client-side listener will handle the redirect for everyone.
  const { error: updateError } = await supabase
    .from("together_sessions")
    .update({ status: "in_progress", current_assignment_index: 1 })
    .eq("id", sessionId)

  if (updateError) throw new Error(`Failed to start session: ${updateError.message}`)

  // No redirect here. Let the real-time event handle it for all clients.
}

export async function nextAssignment(sessionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Verify the user is the host
  const { data: session, error: sessionError } = await supabase
    .from("together_sessions")
    .select("created_by, current_assignment_index")
    .eq("id", sessionId)
    .single()

  if (sessionError) throw new Error("Session not found.")
  if (session.created_by !== user.id) throw new Error("Only the host can proceed.")

  const { count: totalAssignments } = await supabase
    .from("session_assignments")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId)

  const currentIndex = session.current_assignment_index || 1
  const nextIndex = currentIndex + 1

  if (nextIndex > (totalAssignments || 0)) {
    // End of session
    const { error: updateError } = await supabase
      .from("together_sessions")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", sessionId)
    if (updateError) throw new Error(updateError.message)
  } else {
    // Go to next assignment
    const { error: updateError } = await supabase
      .from("together_sessions")
      .update({ current_assignment_index: nextIndex })
      .eq("id", sessionId)
    if (updateError) throw new Error(updateError.message)
  }
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
    console.error("Error leaving session:", error.message)
  }

  redirect("/dashboard/student")
}