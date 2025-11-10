"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, CheckCircle2, AlertTriangle, Lightbulb, Search } from "lucide-react"

interface AIFeedback {
  summary: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string
  suggested_topics: string[]
}

interface AIFeedbackDisplayProps {
  exerciseId: string
}

export function AIFeedbackDisplay({ exerciseId }: AIFeedbackDisplayProps) {
  const [feedback, setFeedback] = useState<AIFeedback | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeedback = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("ai_exercise_feedback")
        .select("*")
        .eq("exercise_id", exerciseId)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows found, which is not an error in this polling scenario
        setError("Could not load AI feedback.")
        setIsLoading(false)
        return null
      }
      return data
    }

    const pollForFeedback = async (retries = 5, delay = 2000) => {
      for (let i = 0; i < retries; i++) {
        const data = await fetchFeedback()
        if (data) {
          setFeedback(data)
          setIsLoading(false)
          return
        }
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
      setError("AI feedback is taking longer than usual to generate. Please check back later.")
      setIsLoading(false)
    }

    pollForFeedback()
  }, [exerciseId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span>Lumi's Feedback</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Lumi is analyzing your performance...</span>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <span>Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!feedback) {
    return null // Should be handled by error state after polling
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span>Lumi's Feedback</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Summary</h3>
          <p className="text-sm text-muted-foreground">{feedback.summary}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              What Went Well
            </h3>
            <div className="flex flex-wrap gap-2">
              {feedback.strengths.map((strength, i) => (
                <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-700">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Areas to Improve
            </h3>
            <div className="flex flex-wrap gap-2">
              {feedback.weaknesses.map((weakness, i) => (
                <Badge key={i} variant="secondary" className="bg-yellow-500/10 text-yellow-700">
                  {weakness}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            Suggestions
          </h3>
          <p className="text-sm text-muted-foreground">{feedback.suggestions}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Search className="h-5 w-5 text-purple-500" />
            Topics to Explore
          </h3>
          <div className="flex flex-wrap gap-2">
            {feedback.suggested_topics.map((topic, i) => (
              <Badge key={i} variant="outline">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}