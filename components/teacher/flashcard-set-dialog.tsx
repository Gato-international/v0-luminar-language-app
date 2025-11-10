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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil } from "lucide-react"
import { createFlashcardSet, updateFlashcardSet } from "@/app/actions/flashcards"
import { useRouter } from "next/navigation"
import type { Chapter } from "@/lib/types"

interface FlashcardSetDialogProps {
  set?: {
    id: string
    title: string
    description: string | null
    chapter_id: string | null
  }
  chapters: Chapter[]
}

export function FlashcardSetDialog({ set, chapters }: FlashcardSetDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState(set?.chapter_id || "")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    try {
      if (set) {
        await updateFlashcardSet(set.id, { title, description, chapter_id: selectedChapter || null })
      } else {
        await createFlashcardSet({ title, description, chapter_id: selectedChapter || null })
      }
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving flashcard set:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {set ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Set
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{set ? "Edit Flashcard Set" : "Add New Flashcard Set"}</DialogTitle>
            <DialogDescription>
              {set ? "Update the details for this set." : "Create a new set of flashcards for students."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={set?.title} required placeholder="e.g., Basic Greetings" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={set?.description || ""}
                placeholder="Brief description of this vocabulary set..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter">Associated Chapter (Optional)</Label>
              <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a chapter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : set ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}