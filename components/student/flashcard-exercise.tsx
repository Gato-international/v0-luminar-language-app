"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Check, RotateCcw, ThumbsUp, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Flashcard {
  id: string
  term: string
  definition: string
  stem: string | null
  group_id: string | null
  gender_id: string | null
}

interface Group { id: string; name: string }
interface Gender { id: string; name: string }

interface FlashcardExerciseProps {
  set: { id: string; title: string }
  flashcards: Flashcard[]
  groups: Group[]
  genders: Gender[]
}

type Feedback = "correct" | "incorrect" | "none"

export function FlashcardExercise({ set, flashcards, groups, genders }: FlashcardExerciseProps) {
  const router = useRouter()
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>("none")
  const [correctCount, setCorrectCount] = useState(0)
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
    const isMeaningCorrect = meaningInput.trim().toLowerCase() === currentCard.definition.trim().toLowerCase()
    const isStemCorrect = stemInput.trim().toLowerCase() === currentCard.stem?.trim().toLowerCase()
    const isGroupCorrect = selectedGroupId === currentCard.group_id
    const isGenderCorrect = selectedGenderId === currentCard.gender_id

    if (isMeaningCorrect && isStemCorrect && isGroupCorrect && isGenderCorrect) {
      setFeedback("correct")
      setCorrectCount((c) => c + 1)
    } else {
      setFeedback("incorrect")
    }
  }

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex((i) => i + 1)
      setFeedback("none")
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
    setFeedback("none")
    setCorrectCount(0)
    setSessionFinished(false)
    setMeaningInput("")
    setStemInput("")
    setSelectedGroupId("")
    setSelectedGenderId("")
  }

  const progress = (currentIndex / shuffledCards.length) * 100

  if (shuffledCards.length === 0) return <div>Loading...</div>

  if (sessionFinished) {
    const accuracy = Math.round((correctCount / shuffledCards.length) * 100)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ThumbsUp className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Set Compleet!</CardTitle>
            <CardDescription>Je hebt de set &quot;{set.title}&quot; afgerond.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">{accuracy}%</div>
            <p className="text-muted-foreground">Je had {correctCount} van de {shuffledCards.length} woorden correct.</p>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleRestart} className="flex-1"><RotateCcw className="h-4 w-4 mr-2" /> Opnieuw Oefenen</Button>
              <Button onClick={() => router.push("/dashboard/student/word-learning")} className="flex-1">Terug naar Sets</Button>
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
              <p className="text-sm text-muted-foreground">Kaart {currentIndex + 1} van {shuffledCards.length}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/student/word-learning")}><ArrowLeft className="h-4 w-4 mr-2" /> Stoppen</Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className={cn("transition-all", feedback === "correct" && "border-green-500", feedback === "incorrect" && "border-destructive")}>
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">WOORD</p>
              <p className="text-4xl font-bold">{currentCard?.term}</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="meaning">Betekenis</Label>
                <Input id="meaning" value={meaningInput} onChange={(e) => setMeaningInput(e.target.value)} disabled={feedback !== "none"} />
              </div>
              <div>
                <Label htmlFor="stem">Stam</Label>
                <Input id="stem" value={stemInput} onChange={(e) => setStemInput(e.target.value)} disabled={feedback !== "none"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Groep</Label>
                  <RadioGroup value={selectedGroupId} onValueChange={setSelectedGroupId} className="mt-2" disabled={feedback !== "none"}>
                    {groups.map(g => <div key={g.id} className="flex items-center space-x-2"><RadioGroupItem value={g.id} id={`g-${g.id}`} /><Label htmlFor={`g-${g.id}`}>{g.name}</Label></div>)}
                  </RadioGroup>
                </div>
                <div>
                  <Label>Geslacht</Label>
                  <RadioGroup value={selectedGenderId} onValueChange={setSelectedGenderId} className="mt-2" disabled={feedback !== "none"}>
                    {genders.map(g => <div key={g.id} className="flex items-center space-x-2"><RadioGroupItem value={g.id} id={`s-${g.id}`} /><Label htmlFor={`s-${g.id}`}>{g.name}</Label></div>)}
                  </RadioGroup>
                </div>
              </div>
            </div>
            {feedback === "none" ? (
              <Button onClick={handleCheck} className="w-full">Controleer Antwoord</Button>
            ) : (
              <Button onClick={handleNext} className="w-full">Volgende Kaart</Button>
            )}
            {feedback !== "none" && (
              <div className={cn("p-4 rounded-md text-center", feedback === "correct" ? "bg-green-500/10 text-green-700" : "bg-destructive/10 text-destructive")}>
                <div className="flex items-center justify-center gap-2 font-semibold mb-2">
                  {feedback === "correct" ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  <span>{feedback === "correct" ? "Correct!" : "Incorrect"}</span>
                </div>
                {feedback === "incorrect" && (
                  <p className="text-sm">Het juiste antwoord is: <strong>{currentCard.definition}</strong> (Stam: {currentCard.stem})</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}