"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { createTogetherSession } from "@/app/actions/together"
import { toast } from "sonner"

export default function LumiTogetherPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleCreateSession = () => {
    startTransition(async () => {
      // We don't wrap this in a try...catch block.
      // If createTogetherSession throws a real error, Next.js will handle it.
      // If it calls redirect(), Next.js will handle the navigation.
      await createTogetherSession()
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard/student">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Lumi Together</CardTitle>
            <CardDescription className="text-lg">Team up and learn with friends!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              Create a new session to start a live, collaborative practice. You'll get a shareable link to invite
              other students to join you.
            </p>
            <Button size="lg" onClick={handleCreateSession} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create New Session
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}