"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, ArrowRight, Save, Wand2, Check, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { scanLatinText, saveScannedSentences, type ScannedSentence } from "@/app/actions/scanner"
import { useRouter } from "next/navigation"

interface ScannerInterfaceProps {
  chapters: { id: string; title: string }[]
  cases: { id: string; name: string; color?: string }[]
}

export function ScannerInterface({ chapters, cases }: ScannerInterfaceProps) {
  const [step, setStep] = useState<"input" | "review">("input")
  const [text, setText] = useState("")
  const [selectedChapter, setSelectedChapter] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState<ScannedSentence[]>([])
  const router = useRouter()

  const handleScan = () => {
    if (!text.trim()) {
      toast.error("Please enter some text first")
      return
    }
    if (!selectedChapter) {
      toast.error("Please select a target chapter")
      return
    }

    startTransition(async () => {
      try {
        const data = await scanLatinText(text)
        setResults(data)
        setStep("review")
        toast.success("Scan complete!", { description: `Found ${data.length} sentences.` })
      } catch (error: any) {
        toast.error("Scan failed", { description: error.message })
      }
    })
  }

  const handleSave = () => {
    if (results.length === 0) return

    startTransition(async () => {
      try {
        await saveScannedSentences(selectedChapter, results)
        toast.success("Import successful!", { description: "Sentences have been added to the database." })
        router.push("/dashboard/teacher/content/sentences")
      } catch (error: any) {
        toast.error("Import failed", { description: error.message })
      }
    })
  }

  const updateWordCase = (sentenceIndex: number, wordIndex: number, newCaseId: string | null) => {
    const newResults = [...results]
    const word = newResults[sentenceIndex].words[wordIndex]
    
    word.case_id = newCaseId
    // Update explanation if case changed manually
    if (newCaseId) {
      const caseName = cases.find(c => c.id === newCaseId)?.name
      word.explanation = `Manually set to ${caseName}`
    } else {
      word.explanation = undefined
    }
    
    setResults(newResults)
  }

  const getCaseName = (id: string | null) => {
    if (!id) return null
    return cases.find(c => c.id === id)?.name || "Unknown"
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <Select value={selectedChapter} onValueChange={setSelectedChapter}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select Target Chapter" />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((chapter) => (
                <SelectItem key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={step === "input" ? "font-bold text-primary" : ""}>1. Input</span>
            <ArrowRight className="h-4 w-4" />
            <span className={step === "review" ? "font-bold text-primary" : ""}>2. Review & Save</span>
          </div>
        </div>

        <div className="flex gap-2">
          {step === "review" && (
            <Button variant="outline" onClick={() => setStep("input")}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
          
          {step === "input" ? (
            <Button onClick={handleScan} disabled={isPending || !selectedChapter}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Start AI Scan
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Import All Sentences
            </Button>
          )}
        </div>
      </div>

      {step === "input" ? (
        <Card className="min-h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle>Document Canvas</CardTitle>
            <CardDescription>Paste your Latin text here. The AI will analyze it, identifying sentences and grammatical cases automatically.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Textarea
              placeholder="Paste Latin text here (e.g. Gallia est omnis divisa in partes tres...)"
              className="h-full min-h-[400px] text-lg font-serif leading-relaxed resize-none p-6"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {results.map((sentence, sIdx) => (
            <Card key={sIdx} className="overflow-visible">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={sentence.difficulty === "easy" ? "secondary" : sentence.difficulty === "medium" ? "default" : "destructive"}>
                    {sentence.difficulty}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => {
                    const newResults = [...results]
                    newResults.splice(sIdx, 1)
                    setResults(newResults)
                  }}>
                    Remove
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-lg font-serif leading-relaxed">
                  {sentence.words.map((word, wIdx) => {
                    const caseName = getCaseName(word.case_id)
                    
                    return (
                      <DropdownMenu key={wIdx}>
                        <DropdownMenuTrigger asChild>
                          <span 
                            className={`
                              px-1 rounded cursor-pointer transition-colors border-b-2 outline-none
                              ${word.case_id 
                                ? "border-primary/50 hover:bg-primary/10" 
                                : "border-transparent hover:bg-muted"
                              }
                            `}
                          >
                            {word.text}
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 max-h-[300px] overflow-y-auto">
                          <DropdownMenuLabel>
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-base">{word.text}</span>
                              <span className="text-xs font-normal text-muted-foreground">{word.explanation || "No explanation"}</span>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <div className="p-1 grid grid-cols-2 gap-1">
                            {cases.map((c) => (
                              <div
                                key={c.id}
                                className={`
                                  flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground
                                  ${word.case_id === c.id ? "bg-accent/50 text-accent-foreground font-medium" : ""}
                                `}
                                onClick={(e) => {
                                  e.preventDefault()
                                  updateWordCase(sIdx, wIdx, c.id)
                                }}
                              >
                                {word.case_id === c.id && <Check className="mr-2 h-3 w-3" />}
                                {c.name}
                              </div>
                            ))}
                            <div
                              className={`
                                flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground col-span-2
                                ${word.case_id === null ? "bg-accent/50 text-accent-foreground font-medium" : ""}
                              `}
                              onClick={(e) => {
                                e.preventDefault()
                                updateWordCase(sIdx, wIdx, null)
                              }}
                            >
                              {word.case_id === null && <Check className="mr-2 h-3 w-3" />}
                              None / Punctuation
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
