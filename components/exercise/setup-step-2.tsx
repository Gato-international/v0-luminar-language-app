"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Check } from "lucide-react"
import type { Chapter } from "@/lib/types"

interface SetupStep2Props {
  chapters: Chapter[]
  value: string
  onChange: (value: string) => void
}

export function SetupStep2({ chapters, value, onChange }: SetupStep2Props) {
  if (chapters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No chapters available yet</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {chapters.map((chapter) => {
        const isSelected = value === chapter.id
        return (
          <Card
            key={chapter.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? "border-2 border-primary shadow-md" : "border"
            }`}
            onClick={() => onChange(chapter.id)}
          >
            <div className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                {isSelected ? (
                  <Check className="h-6 w-6 text-primary" />
                ) : (
                  <BookOpen className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{chapter.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    Chapter {chapter.order_index}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{chapter.description || "Practice grammatical cases"}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
