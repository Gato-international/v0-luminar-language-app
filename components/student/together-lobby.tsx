"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Copy, Sparkles, LogOut } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { startTogetherSession, leaveTogetherSession } from "@/app/actions/together"
import { cn } from "@/lib/utils"

const playfulAdjectives = ["Quick", "Clever", "Wise", "Brave", "Happy", "Silent", "Swift", "Curious"]
const playfulNouns = ["Fox", "Owl", "Lion", "Panda", "Eagle", "Tiger", "Dolphin", "Wolf"]
const userColors = ["#3b82f6", "#22c55e", "#ef4444", "#eab308", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6"]

function JoinScreen({
  sessionId,
  userId,
  onJoinSuccess,
}: {
  sessionId: string
  userId: string
  onJoinSuccess: () => void
}) {
  const [availableColors, setAvailableColors] = useState<string[]>([])
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const fetchUsedColors = async () => {
      const { data } = await supabase.from("session_participants").select("color").eq("session_id", sessionId)
      const usedColors = data?.map((p) => p.color) || []
      setAvailableColors(userColors.filter((c) => !usedColors.includes(c)))
    }
    fetchUsedColors()
  }, [sessionId])

  const handleJoin = async () => {
    if (!selectedColor) {
      toast.error("Please select a color to join.")
      return
    }
    setIsJoining(true)
    const supabase = createClient()
    const playfulUsername = `${playfulAdjectives[Math.floor(Math.random() * playfulAdjectives.length)]} ${
      playfulNouns[Math.floor(Math.random() * playfulNouns.length)]
    }`

    const { error } = await supabase
      .from("session_participants")
      .insert({ session_id: sessionId, user_id: userId, playful_username: playfulUsername, color: selectedColor })

    if (error) {
      toast.error("Failed to join session", { description: error.message })
      setIsJoining(false)
    } else {
      onJoinSuccess()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join the Session</CardTitle>
          <CardDescription>Pick a color to represent you in the lobby.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap justify-center gap-3">
            {userColors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "h-12 w-12 rounded-full transition-all ring-offset-background ring-offset-2",
                  selectedColor === color && "ring-2 ring-primary",
                  !availableColors.includes(color) && "opacity-30 cursor-not-allowed relative",
                )}
                style={{ backgroundColor: color }}
                disabled={!availableColors.includes(color)}
              >
                {!availableColors.includes(color) && (
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold">X</div>
                )}
              </button>
            ))}
          </div>
          <Button className="w-full" onClick={handleJoin} disabled={!selectedColor || isJoining}>
            {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Session"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function TogetherLobby({ session, user }: { session: any; user: any }) {
  const router = useRouter()
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasJoined, setHasJoined] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [isStarting, startTransition] = useTransition()
  const [isLeaving, leaveTransition] = useTransition()

  const isHost = user.id === session.created_by

  useEffect(() => {
    setInviteLink(`${window.location.origin}/together/${session.id}`)
  }, [session.id])

  useEffect(() => {
    const supabase = createClient()

    const checkParticipantStatus = async () => {
      const { data: existingParticipant } = await supabase
        .from("session_participants")
        .select("id")
        .eq("session_id", session.id)
        .eq("user_id", user.id)
        .single()
      if (existingParticipant) {
        setHasJoined(true)
      }
      setIsLoading(false)
    }

    checkParticipantStatus()

    const fetchParticipants = async () => {
      const { data } = await supabase.from("session_participants").select("*").eq("session_id", session.id)
      setParticipants(data || [])
    }

    // Single channel for all lobby communication
    const channel = supabase.channel(`together-session-lobby-${session.id}`)

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "session_participants", filter: `session_id=eq.${session.id}` },
        fetchParticipants, // Refetch on any change
      )
      .on("broadcast", { event: "SESSION_START" }, () => {
        toast.success("Session starting! Let's go!")
        router.push(`/together/${session.id}/play`)
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Fetch initial participants once subscribed to avoid race conditions
          fetchParticipants()
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session.id, user.id, router])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success("Invite link copied to clipboard!")
  }

  const handleStartSession = () => {
    startTransition(async () => {
      // Server action will handle errors and redirect
      await startTogetherSession(session.id)
    })
  }

  const handleLeaveSession = () => {
    leaveTransition(async () => {
      await leaveTogetherSession(session.id)
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold">Loading Session...</h1>
      </div>
    )
  }

  if (!hasJoined) {
    return <JoinScreen sessionId={session.id} userId={user.id} onJoinSuccess={() => setHasJoined(true)} />
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
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }}></div>
                    <span className="font-medium">{p.playful_username}</span>
                  </div>
                  {p.user_id === session.created_by && <Badge variant="outline">Host</Badge>}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t">
            <Label htmlFor="invite-link">Invite Link</Label>
            <div className="flex items-center gap-2">
              <Input id="invite-link" value={inviteLink} readOnly className="bg-muted/50" />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {isHost ? (
            <Button className="w-full" disabled={participants.length < 2 || isStarting} onClick={handleStartSession}>
              {isStarting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting...
                </>
              ) : participants.length < 2 ? (
                "Waiting for more students..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Session
                </>
              )}
            </Button>
          ) : (
            <div className="text-center text-muted-foreground p-3 bg-muted rounded-md">
              Waiting for the host to start the session...
            </div>
          )}
          <Button variant="destructive" className="w-full" onClick={handleLeaveSession} disabled={isLeaving}>
            <LogOut className="h-4 w-4 mr-2" />
            {isLeaving ? "Leaving..." : "Leave Session"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}