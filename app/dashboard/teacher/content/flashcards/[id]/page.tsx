import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { FlashcardDialog } from "@/components/teacher/flashcard-dialog"
import { EditableFlashcardCard } from "@/components/teacher/editable-flashcard-card"

interface FlashcardSetDetailPageProps {
  params: { id: string }
}

export default async function FlashcardSetDetailPage({ params }: FlashcardSetDetailPageProps) {
  const { id: setId } = params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "teacher") redirect("/auth/login")

  const { data: set } = await supabase
    .from("flashcard_sets")
    .select(
      `
      *,
      flashcards (
        *
      )
    `,
    )
    .eq("id", setId)
    .order("created_at", { foreignTable: "flashcards" })
    .single()

  if (!set) {
    redirect("/dashboard/teacher/content/flashcards")
  }

  const flashcards = set.flashcards || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/teacher/content/flashcards">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sets
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{set.title}</h1>
              <p className="text-sm text-muted-foreground">{set.description || "Manage the flashcards in this set."}</p>
            </div>
            <FlashcardDialog setId={setId} />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {flashcards && flashcards.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map((flashcard) => (
              <EditableFlashcardCard key={flashcard.id} flashcard={flashcard} setId={setId} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No flashcards in this set yet.</p>
              <FlashcardDialog setId={setId} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}