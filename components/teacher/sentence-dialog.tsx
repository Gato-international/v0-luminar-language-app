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
import { Plus, Pencil } from "lucide-react"
import { createSentence, updateSentence } from "@/app/actions/sentences"
import { useRouter } from "next/navigation"

interface SentenceDialogProps {
  sentence?: {
    id: string
    text: string
    chapter_id: string
    difficulty: string
  }
  chapters: Array<{ id: string; title: string }>
}

export function SentenceDialog({ sentence, chapters }: SentenceDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState(sentence?.chapter_id || "")
  const [difficulty, setDifficulty] = useState(sentence?.difficulty || "medium")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const text = formData.get("text") as string

    try {
      if (sentence) {
        await updateSentence(sentence.id, { text, chapter_id: selectedChapter, difficulty })
      } else {
        await createSentence({ text, chapter_id: selectedChapter, difficulty })
      }
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving sentence:", error)
    } finally {
      setLoading(false)
    }
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
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{sentence ? "Edit Sentence" : "Add New Sentence"}</DialogTitle>
            <DialogDescription>
              {sentence ? "Update the sentence details below." : "Create a new practice sentence."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text">Sentence Text</Label>
              <Textarea
                id="text"
                name="text"
                defaultValue={sentence?.text}
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedChapter}>
              {loading ? "Saving..." : sentence ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
