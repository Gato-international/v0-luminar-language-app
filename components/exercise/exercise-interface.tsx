"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { SentenceDisplay } from "@/components/exercise/sentence-display"
import { CaseSelector } from "@/components/exercise/case-selector"
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Loader2, BrainCircuit, ShieldAlert } from "lucide-react"
import type { Exercise, Sentence, WordAnnotation, GrammaticalCase, ExerciseAttempt } from "@/lib/types"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ExerciseInterfaceProps {
  exercise: Exercise & { chapters: { id: string; title: string; description: string | null } }
  sentences: Sentence[]
  annotations: (WordAnnotation & { grammatical_cases: GrammaticalCase })[]
  grammaticalCases: GrammaticalCase[]
  existingAttempts: ExerciseAttempt[]
  enforceFocusMode: boolean
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
  enforceFocusMode,
}: ExerciseInterfaceProps) {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedWord, setSelectedWord] = useState<WordSelection | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [startTime, setStartTime] = useState(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [exitCode, setExitCode] = useState("")
  const [exitCodeError, setExitCodeError] = useState<string | null>(null)
  const [isFocusLost, setIsFocusLost] = useState(false)
  const [feedbackMode, setFeedbackMode] = useState(false)

  const isTestMode = exercise.exercise_type === "test" && enforceFocusMode
  const [testStarted, setTestStarted] = useState(!isTestMode)

  useEffect(() => {
    if (testStarted) {
      toast("Lumi is watching your progress!", {
        description: "Complete the exercise to get personalized AI feedback.",
        icon: <BrainCircuit className="h-5 w-5 text-primary" />,
      })
    }
  }, [testStarted])

  useEffect(() => {
    if (!isTestMode || isExiting || !testStarted) return

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isExiting) {
        setIsFocusLost(true)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    }
  }, [isTestMode, isExiting, testStarted])

  const handleStartTest = () => {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
    })
    setTestStarted(true)
    setStartTime(Date.now())
  }

  const handleResumeTest = () => {
    document.documentElement
      .requestFullscreen()
      .then(() => {
        setIsFocusLost(false)
      })
      .catch((err) => {
        console.error(`Could not re-enter fullscreen: ${err.message}`)
        toast.error("Could not re-enter fullscreen. Please click the button again.")
      })
  }

  const handleExitAttempt = () => {
    if (exitCode === "1100") {
      setExitCodeError(null)
      setIsExiting(true)
      if (document.exitFullscreen) {
        document.exitFullscreen().finally(() => router.push("/dashboard/student"))
      } else {
        router.push("/dashboard/student")
      }
    } else {
      setExitCodeError("Incorrect code. Please ask your teacher.")
    }
  }

  const currentSentence = sentences[currentQuestionIndex]
  const currentAnnotations = annotations.filter((a) => a.sentence_id === currentSentence?.id)

  const wordsToIdentify = currentAnnotations.map((a) => ({
    wordIndex: a.word_index,
    wordText: a.word_text,
    correctCaseId: a.grammatical_case_id,
  }))

  const currentSentenceAnswers = answers.filter((a) => a.sentenceId === currentSentence?.id)

  const handleWordClick = (wordIndex: number, wordText: string) => {
    const shouldIdentify = wordsToIdentify.some((w) => w.wordIndex === wordIndex)
    if (!shouldIdentify) return
    setSelectedWord({ wordIndex, wordText })
  }

  const handleCaseSelect = (caseId: string) => {
    if (!selectedWord || !currentSentence) return
    const wordToIdentify = wordsToIdentify.find((w) => w.wordIndex === selectedWord.wordIndex)
    if (!wordToIdentify) return
    const isCorrect = wordToIdentify.correctCaseId === caseId
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

  const handleCheckAnswer = () => {
    setFeedbackMode(true)
    setSelectedWord(null)
  }

  const handleContinue = () => {
    if (currentQuestionIndex < sentences.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setFeedbackMode(false)
      setSelectedWord(null)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setIsExiting(true)
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000)
      const attemptsToSave = answers.map((answer) => ({
        exercise_id: exercise.id,
        sentence_id: answer.sentenceId,
        word_index: answer.wordIndex,
        selected_case_id: answer.selectedCaseId,
        correct_case_id: answer.correctCaseId,
        is_correct: answer.isCorrect,
        time_spent_seconds: Math.floor(timeSpentSeconds / answers.length),
      }))
      await supabase.from("exercise_attempts").insert(attemptsToSave)
      await supabase.from("exercises").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", exercise.id)
      const { data: existingProgress } = await supabase.from("student_progress").select("*").eq("student_id", exercise.student_id).eq("chapter_id", exercise.chapter_id).single()
      const totalCorrect = answers.filter((a) => a.isCorrect).length
      const totalAttempts = answers.length
      const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0
      if (existingProgress) {
        const newTotalCorrect = existingProgress.total_correct + totalCorrect
        const newTotalAttempts = existingProgress.total_attempts + totalAttempts
        const newAccuracy = (newTotalCorrect / newTotalAttempts) * 100
        await supabase.from("student_progress").update({
          total_exercises: existingProgress.total_exercises + 1,
          completed_exercises: existingProgress.completed_exercises + 1,
          total_correct: newTotalCorrect,
          total_attempts: newTotalAttempts,
          accuracy_percentage: newAccuracy,
          last_practiced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", existingProgress.id)
      } else {
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
      supabase.functions.invoke("analyze-exercise", { body: { exercise_id: exercise.id } })
      router.push(`/exercise/${exercise.id}/results`)
    } catch (error) {
      console.error("[v0] Error submitting exercise:", error)
      alert("Failed to submit exercise. Please try again.")
      setIsSubmitting(false)
    }
  }

  const isCurrentSentenceComplete = wordsToIdentify.every((w) =>
    currentSentenceAnswers.some((a) => a.wordIndex === w.wordIndex),
  )
  const totalWordsToIdentify = sentences.reduce((count, sentence) => {
    const words = sentence.text.trim().split(/\s+/)
    return count + annotations.filter((a) => a.sentence_id === sentence.id && a.word_index < words.length).length
  }, 0)
  const isAllComplete = answers.length >= totalWordsToIdentify
  const progressPercentage = totalWordsToIdentify > 0 ? (answers.length / totalWordsToIdentify) * 100 : 0

  if (isTestMode && !testStarted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Focus Mode Enabled</CardTitle>
            <CardDescription>
              This is a test. To ensure a fair and focused environment, this session will be in fullscreen mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You will not be able to exit fullscreen until you complete the test or use the teacher's exit code.
            </p>
            <Button onClick={handleStartTest} size="lg" className="w-full">
              Begin Test
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isFocusLost) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Focus Mode Required</CardTitle>
            <CardDescription>You have exited fullscreen. Please resume to continue the test.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleResumeTest} size="lg" className="w-full">
              Resume Test
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentSentence) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No sentences available for this exercise.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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
              {isTestMode && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Exit Test
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Exit Confirmation</AlertDialogTitle>
                      <AlertDialogDescription>
                        This is a test. To exit, please enter the code provided by your teacher.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4 space-y-2">
                      <Label htmlFor="exit-code">Teacher's Code</Label>
                      <Input
                        id="exit-code"
                        value={exitCode}
                        onChange={(e) => setExitCode(e.target.value)}
                        placeholder="Enter code..."
                      />
                      {exitCodeError && <p className="text-sm text-destructive">{exitCodeError}</p>}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setExitCodeError(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleExitAttempt}>Confirm Exit</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
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
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-sm">
              <strong>Instructions:</strong> Click on the highlighted words in the sentence below, then select the
              correct grammatical case from the color-coded buttons.
            </p>
          </CardContent>
        </Card>

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
              showFeedback={feedbackMode}
            />
          </CardContent>
        </Card>

        {selectedWord && !feedbackMode && (
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

        <div className="flex items-center justify-end">
          {/* Action Button */}
          {!feedbackMode ? (
            <Button 
                onClick={handleCheckAnswer} 
                disabled={!isCurrentSentenceComplete || isSubmitting}
                size="lg"
            >
              Check Answer
            </Button>
          ) : (
             <Button 
                onClick={handleContinue} 
                disabled={isSubmitting}
                size="lg"
             >
                {currentQuestionIndex < sentences.length - 1 ? (
                    <>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                ) : (
                    <>
                    Finish Exercise <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                )}
             </Button>
          )}
        </div>
      </div>
    </div>
  )
}