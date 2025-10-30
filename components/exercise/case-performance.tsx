import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { GrammaticalCase } from "@/lib/types"

interface CasePerformanceItem {
  case: GrammaticalCase
  correct: number
  total: number
  accuracy: number
}

interface CasePerformanceProps {
  performance: CasePerformanceItem[]
}

export function CasePerformance({ performance }: CasePerformanceProps) {
  // Filter out cases with no attempts
  const relevantPerformance = performance.filter((p) => p.total > 0)

  if (relevantPerformance.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">No case data available</CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {relevantPerformance.map((item) => (
        <Card key={item.case.id}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ backgroundColor: item.case.color }}
              >
                {item.case.abbreviation}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">{item.case.name}</h3>
                <p className="text-sm text-muted-foreground">{item.case.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Accuracy</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.accuracy}%</span>
                  <Badge variant="outline" className="text-xs">
                    {item.correct}/{item.total}
                  </Badge>
                </div>
              </div>
              <Progress value={item.accuracy} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
