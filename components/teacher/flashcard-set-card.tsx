"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FlashcardSetDialog } from "@/components/teacher/flashcard-set-dialog"
import { DeleteDialog } from "@/components/teacher/delete-dialog"
import { deleteFlashcardSet } from "@/app/actions/flashcards"
import type { Chapter } from "@/lib/types"

interface FlashcardSetCardProps {
  set: {
    id: string
    created_at: string
    title: string
    description: string | null
    chapters: { title: string } | null
    flashcards: { count: number }[]
  }
  chapters: Chapter[]
}

export function FlashcardSetCard({ set, chapters }: FlashcardSetCardProps) {
  const router = useRouter()
  const flashcardCount = set.flashcards[0]?.count || 0

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent navigation if a button within the card was clicked
    if ((e.target as HTMLElement).closest("button")) {
      return
    }
    router.push(`/dashboard/teacher/content/flashcards/${set.id}`)
  }

  return (
    <Card onClick={handleCardClick} className="hover:shadow-lg transition-shadow w-full cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {set.chapters && <Badge variant="outline">{set.chapters.title}</Badge>}
              <CardTitle className="text-xl">{set.title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{set.description || "No description"}</p>
          </div>
          <div className="flex items-center gap-2 -mr-4">
            <FlashcardSetDialog set={set} chapters={chapters || []} />
            <DeleteDialog id={set.id} type="flashcard set" onDelete={deleteFlashcardSet} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{flashcardCount} flashcards</span>
          <span>•</span>
          <span>Created {new Date(set.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}