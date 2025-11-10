import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, Sparkles } from "lucide-react"
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
          <Link href="/dashboard/student/text-learning">
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>Text Learning</CardTitle>
                </div>
                <CardDescription>Improve your grammar by analyzing and practicing with full sentences.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="text-sm font-semibold text-blue-500">Go to Text Learning →</p>
              </CardContent>
            </Card>
          </Link>

          {/* Word Learning */}
          <Link href="/dashboard/student/word-learning">
            <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle>Word Learning</CardTitle>
                </div>
                <CardDescription>Expand your vocabulary with flashcards and interactive word exercises.</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="text-sm font-semibold text-green-500">Go to Word Learning →</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}