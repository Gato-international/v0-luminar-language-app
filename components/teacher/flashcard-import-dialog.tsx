"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { importFlashcardsFromCSV } from "@/app/actions/flashcards"
import { toast } from "sonner"

interface FlashcardImportDialogProps {
  setId: string
}

export function FlashcardImportDialog({ setId }: FlashcardImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file to import.")
      return
    }
    setLoading(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const content = e.target?.result as string
      try {
        const result = await importFlashcardsFromCSV(setId, content)
        toast.success(`${result.count} flashcards have been successfully imported.`)
        setOpen(false)
        setFile(null)
        router.refresh()
      } catch (error: any) {
        toast.error("Import Failed", { description: error.message })
      } finally {
        setLoading(false)
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Flashcards from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple flashcards to this set at once. Make sure your file follows the correct format.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <Input id="file" type="file" accept=".csv" onChange={handleFileChange} />
          </div>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have a template?{" "}
            <a href="/voorbeeld.csv" download className="underline text-primary">
              Download the sample CSV file.
            </a>
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !file}>
            {loading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}