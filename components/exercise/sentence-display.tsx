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
  showFeedback?: boolean
}

export function SentenceDisplay({
  sentence,
  wordsToIdentify,
  selectedWord,
  answers,
  grammaticalCases,
  onWordClick,
  showFeedback = false,
}: SentenceDisplayProps) {
  const words = sentence.text.split(/\s+/)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-x-2 gap-y-8 text-lg leading-loose items-start">
        {words.map((word, index) => {
          const shouldIdentify = wordsToIdentify.some((w) => w.wordIndex === index)
          const isSelected = selectedWord?.wordIndex === index
          const answer = answers.find((a) => a.wordIndex === index)
          const grammaticalCase = answer ? grammaticalCases.find((c) => c.id === answer.selectedCaseId) : null
          const correctCase = shouldIdentify && showFeedback
            ? grammaticalCases.find(c => c.id === wordsToIdentify.find(w => w.wordIndex === index)?.correctCaseId)
            : null

          if (!shouldIdentify) {
            return (
              <span key={index} className="text-foreground py-1">
                {word}
              </span>
            )
          }

          let style = {}
          let className = "px-3 py-1 rounded-md font-medium transition-all relative inline-flex items-center justify-center "

          if (showFeedback && answer) {
             if (answer.isCorrect) {
                 style = { backgroundColor: grammaticalCase?.color }
                 className += "text-white ring-2 ring-green-500 ring-offset-2"
             } else {
                 // Incorrect
                 style = { backgroundColor: grammaticalCase?.color, opacity: 0.7 }
                 className += "text-white ring-2 ring-red-500 ring-offset-2 line-through decoration-white"
             }
          } else if (isSelected) {
            className += "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
          } else if (answer && grammaticalCase) {
             style = { backgroundColor: grammaticalCase.color }
             className += "text-white"
          } else {
             className += "bg-muted hover:bg-muted/80 text-foreground border-2 border-dashed border-muted-foreground/30"
          }

          return (
            <div key={index} className="flex flex-col items-center">
                <div className="relative">
                    <button
                      onClick={() => !showFeedback && onWordClick(index, word)}
                      disabled={showFeedback}
                      className={className}
                      style={style}
                    >
                      {word}
                    </button>
                    {showFeedback && !answer?.isCorrect && correctCase && (
                        <div className="absolute -top-3 -right-3 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold shadow-sm z-20">
                            ✕
                        </div>
                    )}
                    {showFeedback && answer?.isCorrect && (
                        <div className="absolute -top-3 -right-3 h-5 w-5 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center font-bold shadow-sm z-20">
                            ✓
                        </div>
                    )}
                </div>
                {showFeedback && !answer?.isCorrect && correctCase && (
                    <div className="mt-2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap border ring-1 ring-border z-10">
                        Correct: <span style={{ color: correctCase.color, fontWeight: "bold" }}>{correctCase.name}</span>
                    </div>
                )}
            </div>
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
