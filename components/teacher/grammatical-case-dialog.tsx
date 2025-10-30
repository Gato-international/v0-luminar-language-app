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
import { Plus, Pencil } from "lucide-react"
import { createGrammaticalCase, updateGrammaticalCase } from "@/app/actions/grammatical-cases"
import { useRouter } from "next/navigation"
import type { GrammaticalCase } from "@/lib/types"

interface GrammaticalCaseDialogProps {
  grammaticalCase?: GrammaticalCase
}

export function GrammaticalCaseDialog({ grammaticalCase }: GrammaticalCaseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const abbreviation = formData.get("abbreviation") as string
    const color = formData.get("color") as string
    const description = formData.get("description") as string

    try {
      if (grammaticalCase) {
        await updateGrammaticalCase(grammaticalCase.id, { name, abbreviation, color, description })
      } else {
        await createGrammaticalCase({ name, abbreviation, color, description })
      }
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving grammatical case:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {grammaticalCase ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Case
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{grammaticalCase ? "Edit Grammatical Case" : "Add New Grammatical Case"}</DialogTitle>
            <DialogDescription>
              {grammaticalCase
                ? "Update the details of this grammatical case."
                : "Define a new grammatical case for use in sentences."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={grammaticalCase?.name}
                required
                placeholder="e.g., Nominative"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abbreviation">Abbreviation</Label>
              <Input
                id="abbreviation"
                name="abbreviation"
                defaultValue={grammaticalCase?.abbreviation}
                required
                placeholder="e.g., NOM"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color (Hex Code)</Label>
              <Input
                id="color"
                name="color"
                type="color"
                defaultValue={grammaticalCase?.color || "#000000"}
                required
                className="h-10 w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={grammaticalCase?.description || ""}
                placeholder="Brief description of this case..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : grammaticalCase ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}