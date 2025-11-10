import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { FlashcardDialog } from "@/components/teacher/flashcard-dialog"
import { DeleteDialog } from "@/components/teacher/delete-dialog"
import { deleteFlashcard } from "@/app/actions/flashcards"

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

  const { data: set } = await supabase.from("flashcard_sets").select("*").eq("id", setId).single()
  if (!set) redirect("/dashboard/teacher/content/flashcards")

  const { data: flashcards } = await supabase.from("flashcards").select("*").eq("set_id", setId).order("created_at")

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
              <Card key={flashcard.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{flashcard.term}</CardTitle>
                    <div className="flex items-center -mr-4">
                      <FlashcardDialog setId={setId} flashcard={flashcard} />
                      <DeleteDialog
                        id={flashcard.id}
                        type="flashcard"
                        onDelete={async () => deleteFlashcard(flashcard.id, setId)}
                      />
                    </div>
                  </div>
                  <CardDescription>{flashcard.definition.replace(/;/g, ", ")}</CardDescription>
                </CardHeader>
                {flashcard.example_sentence && (
                  <CardContent className="mt-auto">
                    <p className="text-sm text-muted-foreground italic">&quot;{flashcard.example_sentence}&quot;</p>
                  </CardContent>
                )}
              </Card>
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