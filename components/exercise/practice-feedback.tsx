import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Clock, Zap } from "lucide-react"
import type { GrammaticalCase } from "@/lib/types"

interface CasePerformanceItem {
  case: GrammaticalCase
  correct: number
  total: number
  accuracy: number
}

interface PracticeFeedbackProps {
  casePerformance: CasePerformanceItem[]
  accuracy: number
  totalQuestions?: number
}

export function PracticeFeedback({ casePerformance, accuracy, totalQuestions = 10 }: PracticeFeedbackProps) {
  const strugglingCases = casePerformance
    .filter((p) => p.total > 0 && p.accuracy < 75)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 2) // Focus on the top 2 struggling cases

  // Calculate recommended time
  const missedQuestions = Math.round(totalQuestions * (1 - accuracy / 100))
  const baseTimePerMissed = 2 // 2 minutes per missed question
  const minimumTime = 5
  const maximumTime = 30
  
  let recommendedMinutes = Math.max(minimumTime, missedQuestions * baseTimePerMissed)
  recommendedMinutes = Math.min(recommendedMinutes, maximumTime)

  const getPracticeTimeSuggestion = () => {
    if (accuracy === 100) {
        return "Perfect score! A quick 2-minute refresher tomorrow is all you need to keep this fresh."
    }
    return `Based on your performance, we recommend dedicating about ${recommendedMinutes} minutes to practice this topic to master the concepts.`
  }

  const getGeneralSuggestions = () => {
    const suggestions = [
      "Review the chapter materials before your next practice session.",
      "Try to create your own sentences using the cases you found difficult.",
      "Pay close attention to the context of the sentence, as it often provides clues.",
      "Don't be afraid to make mistakes! Each one is a learning opportunity.",
    ]
    // Return 2 random suggestions
    return suggestions.sort(() => 0.5 - Math.random()).slice(0, 2)
  }

  return (
    <Card className="bg-blue-500/5 border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-blue-500" />
          <span>Personalized Feedback</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {strugglingCases.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Areas to Focus On</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {strugglingCases.map((item) => (
                <div key={item.case.id} className="p-4 rounded-lg bg-background/50 border">
                  <h5 className="font-semibold text-base mb-1">{item.case.name}</h5>
                  <p className="text-sm text-muted-foreground">{item.case.description}</p>
                  <p className="text-sm mt-2">
                    <strong>Your Accuracy:</strong> {item.accuracy.toFixed(1)}% ({item.correct}/{item.total})
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              These are the areas where you had the most trouble. Reviewing the rules for these cases will be very
              helpful.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Practice Suggestion</span>
            </h4>
            <p className="text-sm text-muted-foreground">{getPracticeTimeSuggestion()}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span>Tips for Improvement</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {getGeneralSuggestions().map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}