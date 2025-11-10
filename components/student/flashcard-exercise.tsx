"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Check, RotateCcw, ThumbsUp, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Flashcard {
  id: string
  term: string
  definition: string
  example_sentence: string | null
}

interface FlashcardExerciseProps {
  set: {
    id: string
    title: string
    chapters: { title: string } | null
  }
  flashcards: Flashcard[]
}

type Feedback = "correct" | "incorrect" | "none"

export function FlashcardExercise({ set, flashcards }: FlashcardExerciseProps) {
  const router = useRouter()
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputValue, setInputValue] = useState("")
  const [feedback, setFeedback] = useState<Feedback>("none")
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [sessionFinished, setSessionFinished] = useState(false)

  useEffect(() => {
    setShuffledCards([...flashcards].sort(() => Math.random() - 0.5))
  }, [flashcards])

  const currentCard = useMemo(() => shuffledCards[currentIndex], [shuffledCards, currentIndex])

  const handleCheck = () => {
    if (!currentCard) return
    const correctAnswers = currentCard.definition.split(";").map((a) => a.trim().toLowerCase())
    if (correctAnswers.includes(inputValue.trim().toLowerCase())) {
      setFeedback("correct")
      setCorrectCount((c) => c + 1)
    } else {
      setFeedback("incorrect")
      setIncorrectCount((c) => c + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((i) => i + 1)
      setFeedback("none")
      setInputValue("")
    } else {
      setSessionFinished(true)
    }
  }

  const handleRestart = () => {
    setShuffledCards([...flashcards].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
    setInputValue("")
    setFeedback("none")
    setCorrectCount(0)
    setIncorrectCount(0)
    setSessionFinished(false)
  }

  const progress = (currentIndex / shuffledCards.length) * 100

  if (shuffledCards.length === 0) {
    return <div>Loading...</div>
  }

  if (sessionFinished) {
    const accuracy = Math.round((correctCount / (correctCount + incorrectCount)) * 100)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ThumbsUp className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Set Complete!</CardTitle>
            <CardDescription>You finished the &quot;{set.title}&quot; set.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">{accuracy}%</div>
            <p className="text-muted-foreground">
              You got {correctCount} out of {shuffledCards.length} correct.
            </p>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleRestart} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Practice Again
              </Button>
              <Button onClick={() => router.push("/dashboard/student/word-learning")} className="flex-1">
                Back to Sets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">{set.title}</h1>
              <p className="text-sm text-muted-foreground">
                Card {currentIndex + 1} of {shuffledCards.length}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/student/word-learning")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card
          className={cn(
            "transition-all",
            feedback === "correct" && "border-green-500",
            feedback === "incorrect" && "border-destructive",
          )}
        >
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">TERM</p>
              <p className="text-3xl font-bold">{currentCard.term}</p>
            </div>
            <div className="space-y-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type the meaning..."
                disabled={feedback !== "none"}
                onKeyDown={(e) => e.key === "Enter" && feedback === "none" && handleCheck()}
              />
              {feedback === "none" ? (
                <Button onClick={handleCheck} className="w-full">
                  Check Answer
                </Button>
              ) : (
                <Button onClick={handleNext} className="w-full">
                  Next Card
                </Button>
              )}
            </div>
            {feedback !== "none" && (
              <div
                className={cn(
                  "p-4 rounded-md text-center",
                  feedback === "correct" ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive",
                )}
              >
                <div className="flex items-center justify-center gap-2 font-semibold mb-2">
                  {feedback === "correct" ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  <span>{feedback === "correct" ? "Correct!" : "Incorrect"}</span>
                </div>
                <p className="text-sm">
                  The correct meaning is: <strong>{currentCard.definition.replace(/;/g, " / ")}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}