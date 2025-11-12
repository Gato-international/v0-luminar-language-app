"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Loader2, Sparkles } from "lucide-react"
import { nextAssignment } from "@/app/actions/together"
import { toast } from "sonner"

export function TogetherPlayground({ initialSession, initialParticipants, assignments, sentences, flashcards, user }: any) {
  const router = useRouter()
  const [session, setSession] = useState(initialSession)
  const [participants, setParticipants] = useState(initialParticipants)
  const [isHost, setIsHost] = useState(user.id === initialSession.created_by)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    const sessionChannel = supabase
      .channel(`together-session-play-${session.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "together_sessions", filter: `id=eq.${session.id}` },
        (payload) => {
          if (payload.new.status === "completed") {
            toast.success("Session complete! Well done everyone!")
            router.push("/dashboard/student")
          } else {
            setSession(payload.new)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sessionChannel)
    }
  }, [session.id, router])

  const handleNext = () => {
    startTransition(async () => {
      try {
        await nextAssignment(session.id)
      } catch (error: any) {
        toast.error("Error", { description: error.message })
      }
    })
  }

  const currentAssignment = assignments.find((a: any) => a.order === session.current_assignment_index)
  let assignmentContent = null
  if (currentAssignment) {
    if (currentAssignment.assignment_type === "sentence") {
      assignmentContent = sentences.find((s: any) => s.id === currentAssignment.source_id)
    } else {
      assignmentContent = flashcards.find((f: any) => f.id === currentAssignment.source_id)
    }
  }

  const progress = (session.current_assignment_index / assignments.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Lumi Together</h1>
            <p className="text-sm text-muted-foreground">
              Question {session.current_assignment_index} of {assignments.length}
            </p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {currentAssignment?.assignment_type === "sentence" ? "Analyze the Sentence" : "What's the meaning?"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignmentContent ? (
                currentAssignment.assignment_type === "sentence" ? (
                  <p className="text-2xl font-serif leading-relaxed">{assignmentContent.text}</p>
                ) : (
                  <p className="text-4xl font-bold text-center p-8">{assignmentContent.term}</p>
                )
              ) : (
                <p>Loading assignment...</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Participants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {participants.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <span className="font-medium">{p.playful_username}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {isHost && (
            <Button className="w-full" onClick={handleNext} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Next Question <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}