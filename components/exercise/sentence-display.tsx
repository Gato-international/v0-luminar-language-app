"use client"

import { Badge } from "@/components/ui/badge"
import type { Sentence, GrammaticalCase } from "@/lib/types"

interface WordToIdentify {
  wordIndex: number
  wordText: string
  correctCaseId: string
}

interface Answer {
  sentenceId: string
  wordIndex: number
  selectedCaseId: string | null
  correctCaseId: string
  isCorrect: boolean
}

interface WordSelection {
  wordIndex: number
  wordText: string
}

interface SentenceDisplayProps {
  sentence: Sentence
  wordsToIdentify: WordToIdentify[]
  selectedWord: WordSelection | null
  answers: Answer[]
  grammaticalCases: GrammaticalCase[]
  onWordClick: (wordIndex: number, wordText: string) => void
}

export function SentenceDisplay({
  sentence,
  wordsToIdentify,
  selectedWord,
  answers,
  grammaticalCases,
  onWordClick,
}: SentenceDisplayProps) {
  const words = sentence.text.split(/\s+/)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 text-lg leading-relaxed">
        {words.map((word, index) => {
          const shouldIdentify = wordsToIdentify.some((w) => w.wordIndex === index)
          const isSelected = selectedWord?.wordIndex === index
          const answer = answers.find((a) => a.wordIndex === index)
          const grammaticalCase = answer ? grammaticalCases.find((c) => c.id === answer.selectedCaseId) : null

          if (!shouldIdentify) {
            return (
              <span key={index} className="text-foreground">
                {word}
              </span>
            )
          }

          return (
            <button
              key={index}
              onClick={() => onWordClick(index, word)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : answer
                    ? `text-white`
                    : "bg-muted hover:bg-muted/80 text-foreground border-2 border-dashed border-muted-foreground/30"
              }`}
              style={
                answer && grammaticalCase
                  ? {
                      backgroundColor: grammaticalCase.color,
                    }
                  : undefined
              }
            >
              {word}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <span className="text-sm text-muted-foreground">Legend:</span>
        {grammaticalCases.map((grammaticalCase) => (
          <div key={grammaticalCase.id} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded" style={{ backgroundColor: grammaticalCase.color }} />
            <span className="text-sm font-medium">{grammaticalCase.name}</span>
            <Badge variant="outline" className="text-xs">
              {grammaticalCase.abbreviation}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
