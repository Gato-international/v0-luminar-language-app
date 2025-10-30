"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"

interface SetupStep3Props {
  difficulty: "easy" | "medium" | "hard"
  questionCount: number
  onDifficultyChange: (value: "easy" | "medium" | "hard") => void
  onQuestionCountChange: (value: number) => void
}

export function SetupStep3({ difficulty, questionCount, onDifficultyChange, onQuestionCountChange }: SetupStep3Props) {
  return (
    <div className="space-y-8">
      {/* Difficulty Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Difficulty Level</Label>
        <RadioGroup value={difficulty} onValueChange={(v) => onDifficultyChange(v as any)}>
          <Card className="p-4 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="easy" id="easy" />
              <Label htmlFor="easy" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Easy</p>
                  <p className="text-sm text-muted-foreground">Simple sentences with basic grammar</p>
                </div>
              </Label>
            </div>
          </Card>
          <Card className="p-4 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Medium</p>
                  <p className="text-sm text-muted-foreground">Moderate complexity with mixed cases</p>
                </div>
              </Label>
            </div>
          </Card>
          <Card className="p-4 cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="hard" id="hard" />
              <Label htmlFor="hard" className="flex-1 cursor-pointer">
                <div>
                  <p className="font-medium">Hard</p>
                  <p className="text-sm text-muted-foreground">Complex sentences requiring deep analysis</p>
                </div>
              </Label>
            </div>
          </Card>
        </RadioGroup>
      </div>

      {/* Question Count */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Number of Questions</Label>
          <span className="text-2xl font-bold text-primary">{questionCount}</span>
        </div>
        <Slider
          value={[questionCount]}
          onValueChange={(values) => onQuestionCountChange(values[0])}
          min={5}
          max={30}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 questions</span>
          <span>30 questions</span>
        </div>
      </div>

      {/* Summary */}
      <Card className="p-4 bg-muted/50">
        <h4 className="font-semibold mb-2">Exercise Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Difficulty:</span>
            <span className="font-medium capitalize">{difficulty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Questions:</span>
            <span className="font-medium">{questionCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated time:</span>
            <span className="font-medium">{Math.ceil(questionCount * 1.5)} minutes</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
