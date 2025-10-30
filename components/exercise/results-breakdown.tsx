import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"
import type { GrammaticalCase } from "@/lib/types"

interface SentenceReview {
  sentence: {
    id: string
    text: string
    difficulty: string
  }
  attempts: Array<{
    word_index: number
    selected_case_id: string | null
    correct_case_id: string
    is_correct: boolean
  }>
  annotations: Array<{
    word_index: number
    word_text: string
    grammatical_case_id: string
    explanation: string | null
    grammatical_cases: {
      id: string
      name: string
      abbreviation: string
      color: string
    }
  }>
}

interface ResultsBreakdownProps {
  reviews: SentenceReview[]
  grammaticalCases: GrammaticalCase[]
}

export function ResultsBreakdown({ reviews, grammaticalCases }: ResultsBreakdownProps) {
  return (
    <div className="space-y-4">
      {reviews.map((review, index) => {
        const words = review.sentence.text.split(/\s+/)
        const correctCount = review.attempts.filter((a) => a.is_correct).length
        const totalCount = review.attempts.length

        return (
          <Card key={review.sentence.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {review.sentence.difficulty}
                  </Badge>
                  <Badge variant={correctCount === totalCount ? "default" : "secondary"}>
                    {correctCount}/{totalCount} Correct
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sentence with color-coded words */}
              <div className="flex flex-wrap gap-2 text-lg leading-relaxed p-4 bg-muted/50 rounded-lg">
                {words.map((word, wordIndex) => {
                  const annotation = review.annotations.find((a) => a.word_index === wordIndex)
                  const attempt = review.attempts.find((a) => a.word_index === wordIndex)

                  if (!annotation) {
                    return (
                      <span key={wordIndex} className="text-foreground">
                        {word}
                      </span>
                    )
                  }

                  const isCorrect = attempt?.is_correct
                  const selectedCase = attempt?.selected_case_id
                    ? grammaticalCases.find((c) => c.id === attempt.selected_case_id)
                    : null

                  return (
                    <span
                      key={wordIndex}
                      className="px-3 py-1 rounded-md font-medium text-white relative"
                      style={{
                        backgroundColor: annotation.grammatical_cases.color,
                      }}
                    >
                      {word}
                      {attempt && (
                        <span className="absolute -top-2 -right-2">
                          {isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 bg-background rounded-full" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 bg-background rounded-full" />
                          )}
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>

              {/* Detailed breakdown */}
              <div className="space-y-2">
                {review.annotations.map((annotation) => {
                  const attempt = review.attempts.find((a) => a.word_index === annotation.word_index)
                  const selectedCase = attempt?.selected_case_id
                    ? grammaticalCases.find((c) => c.id === attempt.selected_case_id)
                    : null
                  const isCorrect = attempt?.is_correct

                  return (
                    <div
                      key={annotation.word_index}
                      className={`p-3 rounded-lg border-2 ${
                        isCorrect ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{annotation.word_text}</span>
                            {!isCorrect && selectedCase && (
                              <>
                                <span className="text-sm text-muted-foreground">Your answer:</span>
                                <Badge
                                  variant="outline"
                                  style={{
                                    borderColor: selectedCase.color,
                                    color: selectedCase.color,
                                  }}
                                >
                                  {selectedCase.name}
                                </Badge>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Correct answer:</span>
                            <Badge
                              style={{
                                backgroundColor: annotation.grammatical_cases.color,
                                color: "white",
                              }}
                            >
                              {annotation.grammatical_cases.name}
                            </Badge>
                          </div>
                          {annotation.explanation && (
                            <p className="text-sm text-muted-foreground mt-2">{annotation.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
