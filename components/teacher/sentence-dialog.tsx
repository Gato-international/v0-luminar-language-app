"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, X } from "lucide-react"
import { createSentence, updateSentence } from "@/app/actions/sentences"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface SentenceDialogProps {
  sentence?: {
    id: string
    text: string
    chapter_id: string
    difficulty: string
  }
  chapters: Array<{ id: string; title: string }>
  grammaticalCases: Array<{ id: string; name: string; abbreviation: string; color: string }>
}

interface Annotation {
  wordIndex: number
  wordText: string
  caseId: string
  explanation: string
}

export function SentenceDialog({ sentence, chapters, grammaticalCases }: SentenceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sentenceText, setSentenceText] = useState(sentence?.text || "")
  const [selectedChapter, setSelectedChapter] = useState(sentence?.chapter_id || "")
  const [difficulty, setDifficulty] = useState(sentence?.difficulty || "medium")
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null)
  const router = useRouter()

  // Split sentence into words
  const words = sentenceText.trim().split(/\s+/)

  const handleWordClick = (index: number) => {
    setSelectedWordIndex(index)
  }

  const handleAddAnnotation = (caseId: string) => {
    if (selectedWordIndex === null) return

    const wordText = words[selectedWordIndex]
    const existingIndex = annotations.findIndex((a) => a.wordIndex === selectedWordIndex)

    if (existingIndex >= 0) {
      // Update existing annotation
      const newAnnotations = [...annotations]
      newAnnotations[existingIndex] = {
        ...newAnnotations[existingIndex],
        caseId,
      }
      setAnnotations(newAnnotations)
    } else {
      // Add new annotation
      setAnnotations([
        ...annotations,
        {
          wordIndex: selectedWordIndex,
          wordText,
          caseId,
          explanation: "",
        },
      ])
    }
    setSelectedWordIndex(null)
  }

  const handleRemoveAnnotation = (wordIndex: number) => {
    setAnnotations(annotations.filter((a) => a.wordIndex !== wordIndex))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (sentence) {
        await updateSentence(sentence.id, {
          text: sentenceText,
          chapter_id: selectedChapter,
          difficulty,
          annotations,
        })
      } else {
        await createSentence({
          text: sentenceText,
          chapter_id: selectedChapter,
          difficulty,
          annotations,
        })
      }
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving sentence:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAnnotationForWord = (index: number) => {
    return annotations.find((a) => a.wordIndex === index)
  }

  const getCaseColor = (caseId: string) => {
    return grammaticalCases.find((c) => c.id === caseId)?.color || "#gray"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {sentence ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Sentence
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{sentence ? "Edit Sentence" : "Add New Sentence"}</DialogTitle>
            <DialogDescription>
              {sentence
                ? "Update the sentence and its word annotations."
                : "Create a new practice sentence with word annotations."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="text">Sentence Text</Label>
              <Textarea
                id="text"
                name="text"
                value={sentenceText}
                onChange={(e) => setSentenceText(e.target.value)}
                required
                placeholder="Enter the sentence in Dutch..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter</Label>
                <Select value={selectedChapter} onValueChange={setSelectedChapter} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={chapter.id}>
                        {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {sentenceText.trim() && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Word Annotations</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click on words below to annotate them with grammatical cases
                  </p>
                </div>

                {/* Word Display */}
                <Card className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {words.map((word, index) => {
                      const annotation = getAnnotationForWord(index)
                      const isSelected = selectedWordIndex === index
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleWordClick(index)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            isSelected
                              ? "ring-2 ring-primary bg-primary/10"
                              : annotation
                                ? "shadow-sm"
                                : "bg-muted hover:bg-muted/80"
                          }`}
                          style={{
                            backgroundColor: annotation ? `${getCaseColor(annotation.caseId)}20` : undefined,
                            borderColor: annotation ? getCaseColor(annotation.caseId) : undefined,
                            borderWidth: annotation ? "2px" : undefined,
                          }}
                        >
                          {word}
                        </button>
                      )
                    })}
                  </div>
                </Card>

                {/* Case Selector */}
                {selectedWordIndex !== null && (
                  <Card className="p-4 bg-muted/50">
                    <Label className="text-sm font-medium mb-3 block">
                      Select case for: <span className="text-primary">{words[selectedWordIndex]}</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {grammaticalCases.map((grammaticalCase) => (
                        <Button
                          key={grammaticalCase.id}
                          type="button"
                          variant="outline"
                          onClick={() => handleAddAnnotation(grammaticalCase.id)}
                          className="justify-start"
                          style={{
                            borderColor: grammaticalCase.color,
                            borderWidth: "2px",
                          }}
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: grammaticalCase.color }}
                          />
                          {grammaticalCase.name} ({grammaticalCase.abbreviation})
                        </Button>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Annotations List */}
                {annotations.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Annotated Words ({annotations.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {annotations.map((annotation) => {
                        const grammaticalCase = grammaticalCases.find((c) => c.id === annotation.caseId)
                        return (
                          <Badge
                            key={annotation.wordIndex}
                            variant="secondary"
                            className="px-3 py-1"
                            style={{
                              backgroundColor: `${grammaticalCase?.color}20`,
                              borderColor: grammaticalCase?.color,
                              borderWidth: "1px",
                            }}
                          >
                            {annotation.wordText} → {grammaticalCase?.abbreviation}
                            <button
                              type="button"
                              onClick={() => handleRemoveAnnotation(annotation.wordIndex)}
                              className="ml-2 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedChapter || annotations.length === 0}>
              {loading ? "Saving..." : sentence ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
