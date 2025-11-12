"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Link as LinkIcon, Loader2, Copy } from "lucide-react"
import { toast } from "sonner"

const playfulAdjectives = ["Quick", "Clever", "Wise", "Brave", "Happy", "Silent", "Swift", "Curious"]
const playfulNouns = ["Fox", "Owl", "Lion", "Panda", "Eagle", "Tiger", "Dolphin", "Wolf"]
const userColors = ["#3b82f6", "#22c55e", "#ef4444", "#eab308", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6"]

export function TogetherLobby({ session, user }: { session: any; user: any }) {
  const [participants, setParticipants] = useState<any[]>([])
  const [isJoining, setIsJoining] = useState(true)
  const inviteLink = `${window.location.origin}/together/${session.id}`

  useEffect(() => {
    const supabase = createClient()

    const joinSession = async () => {
      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from("session_participants")
        .select("*")
        .eq("session_id", session.id)
        .eq("user_id", user.id)
        .single()

      if (!existingParticipant) {
        const playfulUsername = `${playfulAdjectives[Math.floor(Math.random() * playfulAdjectives.length)]} ${
          playfulNouns[Math.floor(Math.random() * playfulNouns.length)]
        }`
        const { data: currentParticipants } = await supabase.from("session_participants").select("color").eq("session_id", session.id)
        const usedColors = currentParticipants?.map(p => p.color) || []
        const availableColors = userColors.filter(c => !usedColors.includes(c))
        const color = availableColors.length > 0 ? availableColors[0] : userColors[Math.floor(Math.random() * userColors.length)]

        const { error } = await supabase
          .from("session_participants")
          .insert({ session_id: session.id, user_id: user.id, playful_username: playfulUsername, color: color })
        
        if (error) {
          toast.error("Failed to join session", { description: error.message })
        }
      }
      setIsJoining(false)
    }

    joinSession()

    const channel = supabase
      .channel(`together-session-${session.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "session_participants", filter: `session_id=eq.${session.id}` },
        async () => {
          const { data } = await supabase.from("session_participants").select("*").eq("session_id", session.id)
          setParticipants(data || [])
        },
      )
      .subscribe()

    // Initial fetch
    supabase.from("session_participants").select("*").eq("session_id", session.id).then(({data}) => setParticipants(data || []))

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session.id, user.id])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success("Invite link copied to clipboard!")
  }

  if (isJoining) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold">Joining Session...</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Lobby</CardTitle>
          <CardDescription>Waiting for other students to join...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-center">Participants ({participants.length})</h3>
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-md bg-muted">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: p.color }}></div>
                  <span className="font-medium">{p.playful_username}</span>
                  {p.user_id === session.created_by && <span className="text-xs text-muted-foreground">(Host)</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Button onClick={copyToClipboard} variant="outline" className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Copy Invite Link
            </Button>
            <Button className="w-full" disabled={participants.length < 2}>
              {participants.length < 2 ? "Waiting for more students..." : "Start Session"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}