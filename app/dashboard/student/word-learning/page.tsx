import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react"
import Link from "next/link"
import { UserNav } from "@/components/student/user-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function WordLearningPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "student") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Luminar</h1>
              <p className="text-sm text-muted-foreground">Word Learning</p>
            </div>
          </div>
          <UserNav profile={profile} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/dashboard/student">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader className="items-center text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Word Learning is Coming Soon!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground max-w-md mx-auto">
              We're busy building an exciting new way for you to expand your vocabulary. Check back soon for
              interactive flashcards and word exercises!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}