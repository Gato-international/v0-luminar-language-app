"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { SetupStep1 } from "@/components/exercise/setup-step-1"
import { SetupStep2 } from "@/components/exercise/setup-step-2"
import { SetupStep3 } from "@/components/exercise/setup-step-3"
import type { Chapter } from "@/lib/types"

export default function ExerciseSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedChapterId = searchParams.get("chapterId")

  const [currentStep, setCurrentStep] = useState(preSelectedChapterId ? 2 : 1)
  const [exerciseType, setExerciseType] = useState<"practice" | "test" | "challenge">("practice")
  const [selectedChapterId, setSelectedChapterId] = useState<string>(preSelectedChapterId || "")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [questionCount, setQuestionCount] = useState(10)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    async function loadChapters() {
      const supabase = createClient()
      const { data } = await supabase.from("chapters").select("*").order("order_index")
      if (data) setChapters(data)
    }
    loadChapters()
  }, [])

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStartExercise = async () => {
    setIsCreating(true)
    const supabase = createClient()

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create exercise
      const { data: exercise, error } = await supabase
        .from("exercises")
        .insert({
          student_id: user.id,
          chapter_id: selectedChapterId,
          exercise_type: exerciseType,
          difficulty: difficulty,
          total_questions: questionCount,
          status: "in_progress",
        })
        .select()
        .single()

      if (error) throw error

      // Redirect to exercise interface
      router.push(`/exercise/${exercise.id}`)
    } catch (error) {
      console.error("[v0] Error creating exercise:", error)
      alert("Failed to create exercise. Please try again.")
      setIsCreating(false)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return true
    if (currentStep === 2) return selectedChapterId !== ""
    if (currentStep === 3) return questionCount > 0
    return false
  }

  const progressPercentage = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard/student")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Setup Your Exercise</h1>
          <p className="text-muted-foreground">Follow the steps to customize your learning experience</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of 3</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Choose Exercise Type"}
              {currentStep === 2 && "Select Chapter"}
              {currentStep === 3 && "Configure Settings"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Select the type of exercise you want to practice"}
              {currentStep === 2 && "Choose which chapter you want to work on"}
              {currentStep === 3 && "Set difficulty and number of questions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && <SetupStep1 value={exerciseType} onChange={setExerciseType} />}
            {currentStep === 2 && (
              <SetupStep2 chapters={chapters} value={selectedChapterId} onChange={setSelectedChapterId} />
            )}
            {currentStep === 3 && (
              <SetupStep3
                difficulty={difficulty}
                questionCount={questionCount}
                onDifficultyChange={setDifficulty}
                onQuestionCountChange={setQuestionCount}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isCreating}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext} disabled={!canProceed() || isCreating}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleStartExercise} disabled={!canProceed() || isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Start Exercise"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}