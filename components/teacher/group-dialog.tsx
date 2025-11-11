"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil } from "lucide-react"
import { createGroup, updateGroup } from "@/app/actions/groups"
import { useRouter } from "next/navigation"

interface GroupDialogProps {
  group?: { id: string; name: string }
}

export function GroupDialog({ group }: GroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    try {
      if (group) {
        await updateGroup(group.id, name)
      } else {
        await createGroup(name)
      }
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving group:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {group ? (
          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="h-4 w-4 mr-2" /> Groep Toevoegen</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{group ? "Groep Bewerken" : "Nieuwe Groep Toevoegen"}</DialogTitle>
            <DialogDescription>{group ? "Werk de naam van de groep bij." : "Voeg een nieuwe groep toe (bv. Groep 1, Groep 2)."}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name">Naam</Label>
            <Input id="name" name="name" defaultValue={group?.name} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annuleren</Button>
            <Button type="submit" disabled={loading}>{loading ? "Opslaan..." : group ? "Bijwerken" : "Aanmaken"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}