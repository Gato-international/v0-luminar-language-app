import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react"
import Link from "next/link"
import { UserNav } from "@/components/student/user-nav"
import { Card, CardContent } from "@/components/ui/card"
import { FlashcardSetPracticeCard } from "@/components/student/flashcard-set-practice-card"

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
          <h2 className="text-3xl font-bold mb-2">Vocabulary Practice</h2>
          <p className="text-muted-foreground">Choose a set to start practicing your vocabulary with flashcards.</p>
        </div>

        {flashcardSets && flashcardSets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcardSets.map((set) => (
              <FlashcardSetPracticeCard key={set.id} set={set} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-muted-foreground">No flashcard sets have been created yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}