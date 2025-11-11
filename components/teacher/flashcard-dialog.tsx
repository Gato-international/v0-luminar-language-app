"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createFlashcard } from "@/app/actions/flashcards"
import { useRouter } from "next/navigation"

interface FlashcardDialogProps {
  setId: string
  groups: Array<{ id: string; name: string }>
  genders: Array<{ id: string; name: string }>
}

export function FlashcardDialog({ setId, groups, genders }: FlashcardDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      set_id: setId,
      term: formData.get("term") as string,
      definition: formData.get("definition") as string,
      stem: formData.get("stem") as string,
      group_id: formData.get("group_id") as string,
      gender_id: formData.get("gender_id") as string,
      example_sentence: formData.get("example_sentence") as string,
    }

    try {
      await createFlashcard(data)
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
          Flashcard Toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nieuwe Flashcard Toevoegen</DialogTitle>
            <DialogDescription>Maak een nieuwe flashcard voor deze set.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="term">Woord</Label>
              <Input id="term" name="term" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="definition">Betekenis</Label>
              <Input id="definition" name="definition" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stem">Stam</Label>
              <Input id="stem" name="stem" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group_id">Groep</Label>
                <Select name="group_id" required>
                  <SelectTrigger><SelectValue placeholder="Kies een groep" /></SelectTrigger>
                  <SelectContent>{groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender_id">Geslacht</Label>
                <Select name="gender_id" required>
                  <SelectTrigger><SelectValue placeholder="Kies een geslacht" /></SelectTrigger>
                  <SelectContent>{genders.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="example_sentence">Voorbeeldzin (Optioneel)</Label>
              <Textarea id="example_sentence" name="example_sentence" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annuleren</Button>
            <Button type="submit" disabled={loading}>{loading ? "Opslaan..." : "Aanmaken"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}