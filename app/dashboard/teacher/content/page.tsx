import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BookOpen, FileText, Tag } from "lucide-react"
import Link from "next/link"

export default async function ContentManagementPage() {
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

  // Get counts
  const { count: chaptersCount } = await supabase.from("chapters").select("*", { count: "exact", head: true })
  const { count: sentencesCount } = await supabase.from("sentences").select("*", { count: "exact", head: true })
  const { count: casesCount } = await supabase.from("grammatical_cases").select("*", { count: "exact", head: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/teacher">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-sm text-muted-foreground">Manage chapters, sentences, and grammatical cases</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Chapters */}
          <Link href="/dashboard/teacher/content/chapters">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>Chapters</CardTitle>
                </div>
                <CardDescription>Manage learning chapters and their order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{chaptersCount || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">Total chapters</p>
              </CardContent>
            </Card>
          </Link>

          {/* Sentences */}
          <Link href="/dashboard/teacher/content/sentences">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle>Sentences</CardTitle>
                </div>
                <CardDescription>Add and edit practice sentences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">{sentencesCount || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">Total sentences</p>
              </CardContent>
            </Card>
          </Link>

          {/* Grammatical Cases */}
          <Link href="/dashboard/teacher/content/cases">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Tag className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle>Grammatical Cases</CardTitle>
                </div>
                <CardDescription>View and manage case types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">{casesCount || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">Total cases</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
