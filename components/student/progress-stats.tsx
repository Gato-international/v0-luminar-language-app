import { Card, CardContent } from "@/components/ui/card"
import { Award, Target, TrendingUp, BookOpen } from "lucide-react"

interface ProgressStatsProps {
  totalCompleted: number
  overallAccuracy: number
  totalAttempts: number
  chaptersStarted: number
}

export function ProgressStats({ totalCompleted, overallAccuracy, totalAttempts, chaptersStarted }: ProgressStatsProps) {
  const stats = [
    {
      label: "Exercises Completed",
      value: totalCompleted,
      icon: Award,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Overall Accuracy",
      value: `${overallAccuracy}%`,
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Total Attempts",
      value: totalAttempts,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Chapters Started",
      value: chaptersStarted,
      icon: BookOpen,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
