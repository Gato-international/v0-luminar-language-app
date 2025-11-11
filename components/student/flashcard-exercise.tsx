"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Check, RotateCcw, ThumbsUp, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { FlashcardResultsTable } from "./flashcard-results-table"

interface Flashcard {
  id: string
  term: string
  definition: string
  stem: string | null
  group_id: string | null
  gender_id: string | null
}

interface Group {
  id: string
  name: string
}
interface Gender {
  id: string
  name: string
}

interface FlashcardExerciseProps {
  set: { id: string; title: string }
  flashcards: Flashcard[]
  groups: Group[]
  genders: Gender[]
}

type Feedback = "correct" | "incorrect" | "none"

interface CardResult {
  card: Flashcard
  feedback: {
    meaning: Feedback
    stem: Feedback
    group: Feedback
    gender: Feedback
  }
}

export function FlashcardExercise({ set, flashcards, groups, genders }: FlashcardExerciseProps) {
  const router = useRouter()
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCardChecked, setIsCardChecked] = useState(false)
  const [fieldFeedback, setFieldFeedback] = useState({
    meaning: "none" as Feedback,
    stem: "none" as Feedback,
    group: "none" as Feedback,
    gender: "none" as Feedback,
  })
  const [sessionResults, setSessionResults] = useState<CardResult[]>([])
  const [sessionFinished, setSessionFinished] = useState(false)

  // State for student answers
  const [meaningInput, setMeaningInput] = useState("")
  const [stemInput, setStemInput] = useState("")
  const [selectedGroupId, setSelectedGroupId] = useState("")
  const [selectedGenderId, setSelectedGenderId] = useState("")

  useEffect(() => {
    setShuffledCards([...flashcards].sort(() => Math.random() - 0.5))
  }, [flashcards])

  const currentCard = useMemo(() => shuffledCards[currentIndex], [shuffledCards, currentIndex])

  const handleCheck = () => {
    if (!currentCard) return

    const correctMeanings = currentCard.definition.split(";").map((m) => m.trim().toLowerCase())
    const isMeaningCorrect = correctMeanings.includes(meaningInput.trim().toLowerCase())
    const isStemCorrect = stemInput.trim().toLowerCase() === currentCard.stem?.trim().toLowerCase()
    const isGroupCorrect = selectedGroupId === currentCard.group_id
    const isGenderCorrect = selectedGenderId === currentCard.gender_id

    const feedback = {
      meaning: isMeaningCorrect ? "correct" : ("incorrect" as Feedback),
      stem: isStemCorrect ? "correct" : ("incorrect" as Feedback),
      group: isGroupCorrect ? "correct" : ("incorrect" as Feedback),
      gender: isGenderCorrect ? "correct" : ("incorrect" as Feedback),
    }

    setFieldFeedback(feedback)
    setIsCardChecked(true)

    setSessionResults((prev) => [...prev, { card: currentCard, feedback }])
  }

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((i) => i + 1)
      setIsCardChecked(false)
      setFieldFeedback({ meaning: "none", stem: "none", group: "none", gender: "none" })
      setMeaningInput("")
      setStemInput("")
      setSelectedGroupId("")
      setSelectedGenderId("")
    } else {
      setSessionFinished(true)
    }
  }

  const handleRestart = () => {
    setShuffledCards([...flashcards].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
    setIsCardChecked(false)
    setFieldFeedback({ meaning: "none", stem: "none", group: "none", gender: "none" })
    setSessionResults([])
    setSessionFinished(false)
    setMeaningInput("")
    setStemInput("")
    setSelectedGroupId("")
    setSelectedGenderId("")
  }

  const progress = ((currentIndex + 1) / shuffledCards.length) * 100
  const isAnythingIncorrect = Object.values(fieldFeedback).some((f) => f === "incorrect")

  if (shuffledCards.length === 0) return <div>Loading...</div>

  if (sessionFinished) {
    const correctCount = sessionResults.filter(r => Object.values(r.feedback).every(f => f === 'correct')).length
    const accuracy = Math.round((correctCount / shuffledCards.length) * 100)
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="w-full text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ThumbsUp className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Set Compleet!</CardTitle>
              <CardDescription>
                Je hebt de set &quot;{set.title}&quot; afgerond. Hier is je gedetailleerde overzicht.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-4xl font-bold">{accuracy}%</div>
              <p className="text-muted-foreground">
                Je had {correctCount} van de {shuffledCards.length} kaarten volledig correct.
              </p>
              
              <FlashcardResultsTable results={sessionResults} groups={groups} genders={genders} />

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={handleRestart} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" /> Opnieuw Oefenen
                </Button>
                <Button onClick={() => router.push("/dashboard/student/word-learning")} className="flex-1">
                  Terug naar Sets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
                Kaart {currentIndex + 1} van {shuffledCards.length}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/student/word-learning")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Stoppen
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">WOORD</p>
              <p className="text-4xl font-bold">{currentCard?.term}</p>
            </div>
            <div className="space-y-6">
              <div>
                <Label>Geslacht</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {genders.map((g) => (
                    <Button
                      key={g.id}
                      variant={selectedGenderId === g.id ? "default" : "outline"}
                      onClick={() => setSelectedGenderId(g.id)}
                      disabled={isCardChecked}
                      className={cn(isCardChecked && "border-2", {
                        "border-green-500": isCardChecked && g.id === currentCard.gender_id,
                        "border-destructive": isCardChecked && selectedGenderId === g.id && g.id !== currentCard.gender_id,
                      })}
                    >
                      {g.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Groep</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {groups.map((g) => (
                    <Button
                      key={g.id}
                      variant={selectedGroupId === g.id ? "default" : "outline"}
                      onClick={() => setSelectedGroupId(g.id)}
                      disabled={isCardChecked}
                      className={cn(isCardChecked && "border-2", {
                        "border-green-500": isCardChecked && g.id === currentCard.group_id,
                        "border-destructive": isCardChecked && selectedGroupId === g.id && g.id !== currentCard.group_id,
                      })}
                    >
                      {g.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="meaning">Betekenis</Label>
                  <Input
                    id="meaning"
                    value={meaningInput}
                    onChange={(e) => setMeaningInput(e.target.value)}
                    disabled={isCardChecked}
                    className={cn(isCardChecked && "pr-10", {
                      "border-green-500 focus-visible:ring-green-500/20": fieldFeedback.meaning === "correct",
                      "border-destructive focus-visible:ring-destructive/20": fieldFeedback.meaning === "incorrect",
                    })}
                  />
                  {isCardChecked && (
                    <div className="absolute inset-y-0 right-3 top-6 flex items-center">
                      {fieldFeedback.meaning === "correct" ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Label htmlFor="stem">Stam</Label>
                  <Input
                    id="stem"
                    value={stemInput}
                    onChange={(e) => setStemInput(e.target.value)}
                    disabled={isCardChecked}
                    className={cn(isCardChecked && "pr-10", {
                      "border-green-500 focus-visible:ring-green-500/20": fieldFeedback.stem === "correct",
                      "border-destructive focus-visible:ring-destructive/20": fieldFeedback.stem === "incorrect",
                    })}
                  />
                  {isCardChecked && (
                    <div className="absolute inset-y-0 right-3 top-6 flex items-center">
                      {fieldFeedback.stem === "correct" ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {isCardChecked ? (
              <Button onClick={handleNext} className="w-full">
                Volgende Kaart
              </Button>
            ) : (
              <Button onClick={handleCheck} className="w-full">
                Controleer Antwoord
              </Button>
            )}
            {isCardChecked && isAnythingIncorrect && (
              <div className="p-4 rounded-md bg-muted/50 text-center">
                <p className="font-semibold mb-2">Juiste antwoorden:</p>
                <ul className="text-sm space-y-1">
                  <li>
                    <strong>Betekenis:</strong> {currentCard.definition.replace(/;/g, " / ")}
                  </li>
                  <li>
                    <strong>Stam:</strong> {currentCard.stem}
                  </li>
                  <li>
                    <strong>Geslacht:</strong> {genders.find((g) => g.id === currentCard.gender_id)?.name}
                  </li>
                  <li>
                    <strong>Groep:</strong> {groups.find((g) => g.id === currentCard.group_id)?.name}
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}