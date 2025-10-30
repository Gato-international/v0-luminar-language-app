import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, Circle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RecentActivityProps {
  exercises: any[]
}

export function RecentActivity({ exercises }: RecentActivityProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  exercise.status === "completed" ? "bg-green-500/10" : "bg-blue-500/10"
                }`}
              >
                {exercise.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{exercise.chapters?.title || "Exercise"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {exercise.exercise_type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {exercise.difficulty}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {formatDistanceToNow(new Date(exercise.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
