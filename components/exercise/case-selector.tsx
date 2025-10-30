"use client"

import { Button } from "@/components/ui/button"
import type { GrammaticalCase } from "@/lib/types"

interface CaseSelectorProps {
  cases: GrammaticalCase[]
  onSelect: (caseId: string) => void
}

export function CaseSelector({ cases, onSelect }: CaseSelectorProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {cases.map((grammaticalCase) => (
        <Button
          key={grammaticalCase.id}
          onClick={() => onSelect(grammaticalCase.id)}
          variant="outline"
          className="h-auto py-4 justify-start text-left hover:scale-105 transition-transform"
          style={{
            borderColor: grammaticalCase.color,
            borderWidth: "2px",
          }}
        >
          <div className="flex items-center gap-3 w-full">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: grammaticalCase.color }}
            >
              {grammaticalCase.abbreviation}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{grammaticalCase.name}</p>
              {grammaticalCase.description && (
                <p className="text-xs text-muted-foreground truncate">{grammaticalCase.description}</p>
              )}
            </div>
          </div>
        </Button>
      ))}
    </div>
  )
}
