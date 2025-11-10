"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil } from "lucide-react"
import { updateFlashcard, deleteFlashcard } from "@/app/actions/flashcards"
import { DeleteDialog } from "@/components/teacher/delete-dialog"

interface EditableFlashcardCardProps {
  flashcard: {
    id: string
    term: string
    definition: string
    example_sentence: string | null
  }
  setId: string
}

export function EditableFlashcardCard({ flashcard, setId }: EditableFlashcardCardProps) {
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
      await updateFlashcard(flashcard.id, setId, { term, definition, example_sentence })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating flashcard:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer relative group">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{flashcard.term}</CardTitle>
              <div
                className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <DeleteDialog
                  id={flashcard.id}
                  type="flashcard"
                  onDelete={async () => deleteFlashcard(flashcard.id, setId)}
                />
              </div>
            </div>
            <CardDescription>{flashcard.definition.replace(/;/g, ", ")}</CardDescription>
          </CardHeader>
          {flashcard.example_sentence && (
            <CardContent className="mt-auto">
              <p className="text-sm text-muted-foreground italic">&quot;{flashcard.example_sentence}&quot;</p>
            </CardContent>
          )}
          <div className="absolute bottom-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
            <DialogDescription>Update the details for this flashcard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Input id="term" name="term" defaultValue={flashcard.term} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="definition">Definition(s)</Label>
              <Input id="definition" name="definition" defaultValue={flashcard.definition} required />
              <p className="text-xs text-muted-foreground">Separate multiple correct meanings with a semicolon (;).</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="example_sentence">Example Sentence (Optional)</Label>
              <Textarea
                id="example_sentence"
                name="example_sentence"
                defaultValue={flashcard.example_sentence || ""}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}