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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"
import { updateFlashcard, deleteFlashcard } from "@/app/actions/flashcards"
import { DeleteDialog } from "@/components/teacher/delete-dialog"
import { Badge } from "@/components/ui/badge"

interface EditableFlashcardCardProps {
  flashcard: {
    id: string
    term: string
    definition: string
    stem: string | null
    group_id: string | null
    gender_id: string | null
    example_sentence: string | null
    groups: { name: string } | null
    genders: { name: string } | null
  }
  setId: string
  groups: Array<{ id: string; name: string }>
  genders: Array<{ id: string; name: string }>
}

export function EditableFlashcardCard({ flashcard, setId, groups, genders }: EditableFlashcardCardProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      term: formData.get("term") as string,
      definition: formData.get("definition") as string,
      stem: formData.get("stem") as string,
      group_id: formData.get("group_id") as string,
      gender_id: formData.get("gender_id") as string,
      example_sentence: formData.get("example_sentence") as string,
    }

    try {
      await updateFlashcard(flashcard.id, setId, data)
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
              <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <DeleteDialog id={flashcard.id} type="flashcard" onDelete={async () => deleteFlashcard(flashcard.id, setId)} />
              </div>
            </div>
            <CardDescription>{flashcard.definition.replace(/;/g, ", ")}</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto space-y-2">
            <div className="flex flex-wrap gap-2">
              {flashcard.groups && <Badge variant="outline">{flashcard.groups.name}</Badge>}
              {flashcard.genders && <Badge variant="outline">{flashcard.genders.name}</Badge>}
            </div>
            {flashcard.example_sentence && <p className="text-sm text-muted-foreground italic">&quot;{flashcard.example_sentence}&quot;</p>}
          </CardContent>
          <div className="absolute bottom-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Flashcard Bewerken</DialogTitle>
            <DialogDescription>Werk de details van deze flashcard bij.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="term">Woord</Label>
              <Input id="term" name="term" defaultValue={flashcard.term} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="definition">Betekenis</Label>
              <Input id="definition" name="definition" defaultValue={flashcard.definition} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stem">Stam</Label>
              <Input id="stem" name="stem" defaultValue={flashcard.stem || ""} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="group_id">Groep</Label>
                <Select name="group_id" defaultValue={flashcard.group_id || ""} required>
                  <SelectTrigger><SelectValue placeholder="Kies een groep" /></SelectTrigger>
                  <SelectContent>{groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender_id">Geslacht</Label>
                <Select name="gender_id" defaultValue={flashcard.gender_id || ""} required>
                  <SelectTrigger><SelectValue placeholder="Kies een geslacht" /></SelectTrigger>
                  <SelectContent>{genders.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="example_sentence">Voorbeeldzin (Optioneel)</Label>
              <Textarea id="example_sentence" name="example_sentence" defaultValue={flashcard.example_sentence || ""} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annuleren</Button>
            <Button type="submit" disabled={loading}>{loading ? "Opslaan..." : "Bijwerken"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}