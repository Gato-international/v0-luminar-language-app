"use client"

import { Card } from "@/components/ui/card"
import { BookOpen, Trophy, Zap } from "lucide-react"

interface SetupStep1Props {
  value: "practice" | "test" | "challenge"
  onChange: (value: "practice" | "test" | "challenge") => void
}

export function SetupStep1({ value, onChange }: SetupStep1Props) {
  const types = [
    {
      id: "practice" as const,
      title: "Practice Mode",
      description: "Learn at your own pace with instant feedback",
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
    },
    {
      id: "test" as const,
      title: "Test Mode",
      description: "Challenge yourself with timed questions",
      icon: Trophy,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500",
    },
    {
      id: "challenge" as const,
      title: "Challenge Mode",
      description: "Advanced exercises for mastery",
      icon: Zap,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
    },
  ]

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {types.map((type) => {
        const Icon = type.icon
        const isSelected = value === type.id
        return (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? `border-2 ${type.borderColor} shadow-md` : "border"
            }`}
            onClick={() => onChange(type.id)}
          >
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className={`h-16 w-16 rounded-full ${type.bgColor} flex items-center justify-center`}>
                <Icon className={`h-8 w-8 ${type.color}`} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{type.title}</h3>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
