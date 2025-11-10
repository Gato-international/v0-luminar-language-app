"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { SentenceDisplay } from "@/components/exercise/sentence-display"
import { CaseSelector } from "@/components/exercise/case-selector"
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Loader2 } from "lucide-react"
import type { Exercise, Sentence, WordAnnotation, GrammaticalCase, ExerciseAttempt } from "@/lib/types"

interface ExerciseInterfaceProps {
  exercise: Exercise & { chapters: { id: string; title: string; description: string | null } }
  sentences: Sentence[]
  annotations: (WordAnnotation & { grammatical_cases: GrammaticalCase })[]
  grammaticalCases: GrammaticalCase[]
  existingAttempts: ExerciseAttempt[]
}

interface WordSelection {
  wordIndex: number
  wordText: string
}

interface Answer {
  sentenceId: string
  wordIndex: number
  selectedCaseId: string | null
  correctCaseId: string
  isCorrect: boolean
}

export function ExerciseInterface({
  exercise,
  sentences,
  annotations,
  grammaticalCases,
  existingAttempts,
}: ExerciseInterfaceProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedWord, setSelectedWord] = useState<WordSelection | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [startTime] = useState(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentSentence = sentences[currentQuestionIndex]
  const currentAnnotations = annotations.filter((a) => a.sentence_id === currentSentence?.id)

  // Get words that need to be identified in current sentence
  const wordsToIdentify = currentAnnotations.map((a) => ({
    wordIndex: a.word_index,
    wordText: a.word_text,
    correctCaseId: a.grammatical_case_id,
  }))

  // Get current answers for this sentence
  const currentSentenceAnswers = answers.filter((a) => a.sentenceId === currentSentence?.id)

  const handleWordClick = (wordIndex: number, wordText: string) => {
    // Check if this word should be identified
    const shouldIdentify = wordsToIdentify.some((w) => w.wordIndex === wordIndex)
    if (!shouldIdentify) return

    setSelectedWord({ wordIndex, wordText })
  }

  const handleCaseSelect = (caseId: string) => {
    if (!selectedWord || !currentSentence) return

    const wordToIdentify = wordsToIdentify.find((w) => w.wordIndex === selectedWord.wordIndex)
    if (!wordToIdentify) return

    const isCorrect = wordToIdentify.correctCaseId === caseId

    // Update or add answer
    const newAnswer: Answer = {
      sentenceId: currentSentence.id,
      wordIndex: selectedWord.wordIndex,
      selectedCaseId: caseId,
      correctCaseId: wordToIdentify.correctCaseId,
      isCorrect,
    }

    setAnswers((prev) => {
      const filtered = prev.filter(
        (a) => !(a.sentenceId === currentSentence.id && a.wordIndex === selectedWord.wordIndex),
      )
      return [...filtered, newAnswer]
    })

    setSelectedWord(null)
  }

  const handleNext = () => {
    if (currentQuestionIndex < sentences.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedWord(null)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedWord(null)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // Calculate time spent
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000)

      // Save all attempts to database
      const attemptsToSave = answers.map((answer) => ({
        exercise_id: exercise.id,
        sentence_id: answer.sentenceId,
        word_index: answer.wordIndex,
        selected_case_id: answer.selectedCaseId,
        correct_case_id: answer.correctCaseId,
        is_correct: answer.isCorrect,
        time_spent_seconds: Math.floor(timeSpentSeconds / answers.length),
      }))

      const { error: attemptsError } = await supabase.from("exercise_attempts").insert(attemptsToSave)

      if (attemptsError) throw attemptsError

      // Update exercise status
      const { error: exerciseError } = await supabase
        .from("exercises")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", exercise.id)

      if (exerciseError) throw exerciseError

      // Update student progress
      const totalCorrect = answers.filter((a) => a.isCorrect).length
      const totalAttempts = answers.length
      const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0

      // Get existing progress
      const { data: existingProgress } = await supabase
        .from("student_progress")
        .select("*")
        .eq("student_id", exercise.student_id)
        .eq("chapter_id", exercise.chapter_id)
        .single()

      if (existingProgress) {
        // Update existing progress
        const newTotalCorrect = existingProgress.total_correct + totalCorrect
        const newTotalAttempts = existingProgress.total_attempts + totalAttempts
        const newAccuracy = (newTotalCorrect / newTotalAttempts) * 100

        await supabase
          .from("student_progress")
          .update({
            total_exercises: existingProgress.total_exercises + 1,
            completed_exercises: existingProgress.completed_exercises + 1,
            total_correct: newTotalCorrect,
            total_attempts: newTotalAttempts,
            accuracy_percentage: newAccuracy,
            last_practiced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProgress.id)
      } else {
        // Create new progress record
        await supabase.from("student_progress").insert({
          student_id: exercise.student_id,
          chapter_id: exercise.chapter_id,
          total_exercises: 1,
          completed_exercises: 1,
          total_correct: totalCorrect,
          total_attempts: totalAttempts,
          accuracy_percentage: accuracy,
          last_practiced_at: new Date().toISOString(),
        })
      }

      // Redirect to results page
      router.push(`/exercise/${exercise.id}/results`)
    } catch (error) {
      console.error("[v0] Error submitting exercise:", error)
      alert("Failed to submit exercise. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Check if current sentence is complete
  const isCurrentSentenceComplete = wordsToIdentify.every((w) =>
    currentSentenceAnswers.some((a) => a.wordIndex === w.wordIndex),
  )

  // Check if all questions are answered
  const totalWordsToIdentify = annotations.length
  const isAllComplete = answers.length === totalWordsToIdentify

  const progressPercentage = totalWordsToIdentify > 0 ? (answers.length / totalWordsToIdentify) * 100 : 0

  if (!currentSentence) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No sentences available for this exercise.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">{exercise.chapters.title}</h1>
              <p className="text-sm text-muted-foreground">
                {exercise.exercise_type} • {exercise.difficulty}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{Math.floor((Date.now() - startTime) / 60000)}m</span>
              </div>
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {sentences.length}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Instructions */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm">
              <strong>Instructions:</strong> Click on the highlighted words in the sentence below, then select the
              correct grammatical case from the color-coded buttons.
            </p>
          </CardContent>
        </Card>

        {/* Sentence Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Identify the Grammatical Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <SentenceDisplay
              sentence={currentSentence}
              wordsToIdentify={wordsToIdentify}
              selectedWord={selectedWord}
              answers={currentSentenceAnswers}
              grammaticalCases={grammaticalCases}
              onWordClick={handleWordClick}
            />
          </CardContent>
        </Card>

        {/* Case Selector */}
        {selectedWord && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                Select the case for: <span className="text-primary">{selectedWord.wordText}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CaseSelector cases={grammaticalCases} onSelect={handleCaseSelect} />
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isSubmitting}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {isCurrentSentenceComplete && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>

          {currentQuestionIndex < sentences.length - 1 ? (
            <Button onClick={handleNext} disabled={isSubmitting}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!isAllComplete || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Exercise
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}