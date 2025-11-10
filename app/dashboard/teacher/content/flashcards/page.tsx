import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

export default async function FlashcardsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "teacher") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/teacher/content">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Content
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Flashcard Sets</h1>
              <p className="text-sm text-muted-foreground">Manage vocabulary sets for students</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">Flashcard Management is Coming Soon!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground max-w-md mx-auto">
              We're building the tools for you to create and manage flashcard sets. This feature will be available in the next update.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}