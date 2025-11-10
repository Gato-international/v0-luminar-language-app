"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrainCircuit, Loader2, AlertTriangle } from "lucide-react"

interface AIAnalysisProps {
  studentId: string
}

interface Analysis {
  strengths: string
  weaknesses: string
  suggestions: string
}

export function AIAnalysis({ studentId }: AIAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)
    setAnalysis(null)

    const supabase = createClient()
    const { data, error } = await supabase.functions.invoke("analyze-student", {
      body: { student_id: studentId },
    })

    if (error) {
      setError(error.message)
    } else {
      setAnalysis(data)
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="relative">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <span>AI-Powered Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis && !isLoading && (
          <>
            <p className="text-sm text-muted-foreground">
              Generate an AI-powered summary of this student's performance, including strengths, weaknesses, and
              actionable suggestions for improvement.
            </p>
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Generate Insights"
              )}
            </Button>
          </>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-4">
              <BrainCircuit className="h-12 w-12 text-primary" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" />
            </div>
            <p className="font-semibold">Analyzing student data...</p>
            <p className="text-sm text-muted-foreground">This may take a moment.</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Strengths</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">{analysis.strengths}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Weaknesses</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">{analysis.weaknesses}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Suggestions</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">{analysis.suggestions}</p>
            </div>
            <Button variant="outline" onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Re-analyzing...
                </>
              ) : (
                "Regenerate Analysis"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}