import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SentenceDialog } from "@/components/teacher/sentence-dialog"
import { DeleteDialog } from "@/components/teacher/delete-dialog"
import { deleteSentence } from "@/app/actions/sentences"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function SentencesPage() {
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

  // Get all chapters for filter
  const { data: chapters } = await supabase.from("chapters").select("*").order("order_index")

  const { data: grammaticalCases } = await supabase.from("grammatical_cases").select("*").order("name")

  // Get all sentences with chapter info
  const { data: sentences } = await supabase
    .from("sentences")
    .select(
      `
      *,
      chapters (
        title
      )
    `,
    )
    .order("created_at", { ascending: false })

  // Get annotation counts for each sentence
  const annotationCounts = await Promise.all(
    (sentences || []).map(async (sentence) => {
      const { count } = await supabase
        .from("word_annotations")
        .select("*", { count: "exact", head: true })
        .eq("sentence_id", sentence.id)
      return { sentenceId: sentence.id, count: count || 0 }
    }),
  )

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
              <h1 className="text-2xl font-bold">Sentences</h1>
              <p className="text-sm text-muted-foreground">Manage practice sentences and annotations</p>
            </div>
            <SentenceDialog chapters={chapters || []} grammaticalCases={grammaticalCases || []} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {chapters?.map((chapter) => (
                <SelectItem key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sentences List */}
        {sentences && sentences.length > 0 ? (
          <div className="space-y-4">
            {sentences.map((sentence) => {
              const annotationCount = annotationCounts.find((c) => c.sentenceId === sentence.id)?.count || 0
              return (
                <Card key={sentence.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{sentence.chapters?.title}</Badge>
                          <Badge variant="secondary" className="capitalize">
                            {sentence.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-normal">{sentence.text}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <SentenceDialog
                          sentence={sentence}
                          chapters={chapters || []}
                          grammaticalCases={grammaticalCases || []}
                        />
                        <DeleteDialog id={sentence.id} type="sentence" onDelete={deleteSentence} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{annotationCount} word annotations</span>
                      <span>•</span>
                      <span>Added {new Date(sentence.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No sentences yet</p>
              <SentenceDialog chapters={chapters || []} grammaticalCases={grammaticalCases || []} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
