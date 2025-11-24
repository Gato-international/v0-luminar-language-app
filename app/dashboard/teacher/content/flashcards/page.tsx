import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { FlashcardSetDialog } from "@/components/teacher/flashcard-set-dialog"
import { FlashcardSetCard } from "@/components/teacher/flashcard-set-card"

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

  // Get all flashcard sets with chapter info and flashcard counts
  const { data: flashcardSets } = await supabase
    .from("flashcard_sets")
    .select(
      `
      *,
      chapters (title),
      flashcards (count)
    `,
    )
    .order("created_at", { ascending: false })

  // Get all chapters for the dialog
  const { data: chapters } = await supabase.from("chapters").select("*").order("order_index")

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
            <FlashcardSetDialog chapters={chapters || []} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {flashcardSets && flashcardSets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcardSets.map((set) => (
              <FlashcardSetCard key={set.id} set={set} chapters={chapters || []} basePath="/dashboard/teacher" />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-muted-foreground mb-4">No flashcard sets yet</p>
              <FlashcardSetDialog chapters={chapters || []} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}