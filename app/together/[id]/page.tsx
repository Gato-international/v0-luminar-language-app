import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TogetherLobby } from "@/components/student/together-lobby"

interface TogetherSessionPageProps {
  params: { id: string }
}

export default async function TogetherSessionPage({ params }: TogetherSessionPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: session, error } = await supabase
    .from("together_sessions")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !session) {
    // Redirect if session doesn't exist
    redirect("/dashboard/student/together")
  }

  return <TogetherLobby session={session} user={user} />
}