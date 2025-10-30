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
import { createChapter, updateChapter } from "@/app/actions/chapters"
import { useRouter } from "next/navigation"

interface ChapterDialogProps {
  chapter?: {
    id: string
    title: string
    description: string | null
    order_index: number
  }
  nextOrderIndex?: number
}

export function ChapterDialog({ chapter, nextOrderIndex = 1 }: ChapterDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const orderIndex = Number.parseInt(formData.get("order_index") as string)

    try {
      if (chapter) {
        await updateChapter(chapter.id, { title, description, order_index: orderIndex })
      } else {
        await createChapter({ title, description, order_index: orderIndex })
      }
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error saving chapter:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {chapter ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Chapter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{chapter ? "Edit Chapter" : "Add New Chapter"}</DialogTitle>
            <DialogDescription>
              {chapter ? "Update the chapter details below." : "Create a new chapter for students to practice."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={chapter?.title}
                required
                placeholder="e.g., Chapter 1: Basics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={chapter?.description || ""}
                placeholder="Brief description of what this chapter covers..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order_index">Order</Label>
              <Input
                id="order_index"
                name="order_index"
                type="number"
                min="1"
                defaultValue={chapter?.order_index || nextOrderIndex}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : chapter ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
