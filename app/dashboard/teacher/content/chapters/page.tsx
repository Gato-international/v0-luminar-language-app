import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ChapterDialog } from "@/components/teacher/chapter-dialog"
import { DeleteDialog } from "@/components/teacher/delete-dialog"
import { deleteChapter } from "@/app/actions/chapters"

export default async function ChaptersPage() {
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

  // Get all chapters
  const { data: chapters } = await supabase.from("chapters").select("*").order("order_index")

  // Get sentence counts for each chapter
  const chapterCounts = await Promise.all(
    (chapters || []).map(async (chapter) => {
      const { count } = await supabase
        .from("sentences")
        .select("*", { count: "exact", head: true })
        .eq("chapter_id", chapter.id)
      return { chapterId: chapter.id, count: count || 0 }
    }),
  )

  const nextOrderIndex = chapters && chapters.length > 0 ? Math.max(...chapters.map((c) => c.order_index)) + 1 : 1

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
              <h1 className="text-2xl font-bold">Chapters</h1>
              <p className="text-sm text-muted-foreground">Manage learning chapters</p>
            </div>
            <ChapterDialog nextOrderIndex={nextOrderIndex} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {chapters && chapters.length > 0 ? (
          <div className="space-y-4">
            {chapters.map((chapter) => {
              const sentenceCount = chapterCounts.find((c) => c.chapterId === chapter.id)?.count || 0
              return (
                <Card key={chapter.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">Chapter {chapter.order_index}</Badge>
                          <CardTitle className="text-xl">{chapter.title}</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">{chapter.description || "No description"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChapterDialog chapter={chapter} />
                        <DeleteDialog id={chapter.id} type="chapter" onDelete={deleteChapter} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{sentenceCount} sentences</span>
                      <span>•</span>
                      <span>Created {new Date(chapter.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No chapters yet</p>
              <ChapterDialog nextOrderIndex={nextOrderIndex} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
