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
import { Plus } from "lucide-react"
import { createFlashcard } from "@/app/actions/flashcards"
import { useRouter } from "next/navigation"

interface FlashcardDialogProps {
  setId: string
}

export function FlashcardDialog({ setId }: FlashcardDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const term = formData.get("term") as string
    const definition = formData.get("definition") as string
    const example_sentence = formData.get("example_sentence") as string

    try {
      await createFlashcard({ set_id: setId, term, definition, example_sentence })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving flashcard:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Flashcard
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Flashcard</DialogTitle>
            <DialogDescription>Create a new flashcard for this set.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Input id="term" name="term" required placeholder="e.g., Hallo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="definition">Meaning(s)</Label>
              <Input id="definition" name="definition" required placeholder="e.g., Hello; Hi" />
              <p className="text-xs text-muted-foreground">Separate multiple correct meanings with a semicolon (;).</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="example_sentence">Example Sentence (Optional)</Label>
              <Textarea
                id="example_sentence"
                name="example_sentence"
                placeholder="e.g., Hallo, hoe gaat het?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}