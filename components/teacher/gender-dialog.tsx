"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil } from "lucide-react"
import { createGender, updateGender } from "@/app/actions/genders"
import { useRouter } from "next/navigation"

interface GenderDialogProps {
  gender?: { id: string; name: string }
}

export function GenderDialog({ gender }: GenderDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    try {
      if (gender) {
        await updateGender(gender.id, name)
      } else {
        await createGender(name)
      }
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving gender:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {gender ? (
          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" /> Geslacht Toevoegen</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{gender ? "Geslacht Bewerken" : "Nieuw Geslacht Toevoegen"}</DialogTitle>
            <DialogDescription>{gender ? "Werk de naam van het geslacht bij." : "Voeg een nieuw geslacht toe (bv. mannelijk, vrouwelijk)."}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name">Naam</Label>
            <Input id="name" name="name" defaultValue={gender?.name} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annuleren</Button>
            <Button type="submit" disabled={loading}>{loading ? "Opslaan..." : gender ? "Bijwerken" : "Aanmaken"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}