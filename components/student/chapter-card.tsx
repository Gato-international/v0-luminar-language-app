import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { Chapter, StudentProgress } from "@/lib/types"

interface ChapterCardProps {
  chapter: Chapter
  progress?: StudentProgress | null
}

export function ChapterCard({ chapter, progress }: ChapterCardProps) {
  const completionRate = progress
    ? Math.round((progress.completed_exercises / Math.max(progress.total_exercises, 1)) * 100)
    : 0

  const accuracy = progress?.accuracy_percentage || 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{chapter.title}</CardTitle>
            <CardDescription className="text-sm">{chapter.description || "Practice grammatical cases"}</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {progress ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Accuracy:</span>
              <span className="font-medium">{accuracy.toFixed(1)}%</span>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href={`/exercise/setup?chapterId=${chapter.id}`}>Continue</Link>
              </Button>
            </div>
          </>
        ) : (
          <Button asChild className="w-full">
            <Link href={`/exercise/setup?chapterId=${chapter.id}`}>Start Chapter</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
