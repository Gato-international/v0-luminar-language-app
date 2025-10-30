import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Target, Clock, TrendingUp } from "lucide-react"

interface ResultsSummaryProps {
  accuracy: number
  correctAttempts: number
  totalAttempts: number
  timeSpent: number
  exerciseType: string
  difficulty: string
}

export function ResultsSummary({
  accuracy,
  correctAttempts,
  totalAttempts,
  timeSpent,
  exerciseType,
  difficulty,
}: ResultsSummaryProps) {
  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return "text-green-500"
    if (acc >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getAccuracyBgColor = (acc: number) => {
    if (acc >= 80) return "bg-green-500/10"
    if (acc >= 60) return "bg-yellow-500/10"
    return "bg-red-500/10"
  }

  const getMessage = (acc: number) => {
    if (acc >= 90) return "Excellent work!"
    if (acc >= 80) return "Great job!"
    if (acc >= 70) return "Good effort!"
    if (acc >= 60) return "Keep practicing!"
    return "Don't give up!"
  }

  const minutes = Math.floor(timeSpent / 60)
  const seconds = timeSpent % 60

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card className={`${getAccuracyBgColor(accuracy)} border-2`}>
        <CardContent className="p-8 text-center">
          <div className="mb-4">
            <div className={`text-6xl font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</div>
            <p className="text-xl font-semibold mt-2">{getMessage(accuracy)}</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline" className="capitalize">
              {exerciseType}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {difficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Award className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Correct Answers</p>
                <p className="text-2xl font-bold">
                  {correctAttempts}/{totalAttempts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">{accuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold">{totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
