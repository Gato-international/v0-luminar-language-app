import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, Sparkles, ArrowRight, BrainCircuit, Languages } from "lucide-react"
import Link from "next/link"
import { UserNav } from "@/components/student/user-nav"

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "student") {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Luminar</h1>
              <p className="text-sm text-muted-foreground">Student Dashboard</p>
            </div>
          </div>
          <UserNav profile={profile} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile.full_name?.split(" ")[0] || "Student"}!</h2>
          <p className="text-muted-foreground">Choose your learning path for today.</p>
        </div>

        {/* Learning Path Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Text Learning */}
          <Link href="/dashboard/student/text-learning" className="group">
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-6 w-6 text-foreground" />
                  </div>
                  <CardTitle>Text Learning</CardTitle>
                </div>
                <CardDescription>Improve your grammar by analyzing and practicing with full sentences.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex items-center text-sm font-semibold text-foreground">
                  Go to Text Learning
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Word Learning */}
          <Link href="/dashboard/student/word-learning" className="group">
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-foreground" />
                  </div>
                  <CardTitle>Word Learning</CardTitle>
                </div>
                <CardDescription>Expand your vocabulary with flashcards and interactive word exercises.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex items-center text-sm font-semibold text-foreground">
                  Go to Word Learning
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* AI Tutor */}
          <Link href="/dashboard/student/ai-tutor" className="group">
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <BrainCircuit className="h-6 w-6 text-foreground" />
                  </div>
                  <CardTitle>AI Tutor</CardTitle>
                </div>
                <CardDescription>Ask questions and get personalized practice from your AI assistant, Lumi.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex items-center text-sm font-semibold text-foreground">
                  Chat with Lumi
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Translator */}
          <Link href="/dashboard/student/translator" className="group">
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col bg-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <Languages className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Translator</CardTitle>
                </div>
                <CardDescription>Quickly translate text to Dutch using our AI-powered tool.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="flex items-center text-sm font-semibold text-primary">
                  Open Translator
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}