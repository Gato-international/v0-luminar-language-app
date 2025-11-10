import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

interface FlashcardSetPracticeCardProps {
  set: {
    id: string
    title: string
    description: string | null
    chapters: { title: string } | null
    flashcards: { count: number }[]
  }
}

export function FlashcardSetPracticeCard({ set }: FlashcardSetPracticeCardProps) {
  const flashcardCount = set.flashcards[0]?.count || 0

  return (
    <Link href={`/exercise/flashcards/${set.id}`} className="group">
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{set.title}</CardTitle>
              <CardDescription className="text-sm">{set.description || "Practice these vocabulary words"}</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-auto">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{flashcardCount} cards</Badge>
            <div className="flex items-center text-sm font-semibold text-foreground">
              Start Practice
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}