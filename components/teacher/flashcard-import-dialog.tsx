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
      toast.error("Selecteer een bestand om te importeren.")
      return
    }
    setLoading(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const content = e.target?.result as string
      try {
        // Client-side validation of the CSV header
        const lines = content.split("\n")
        if (lines.length < 1) {
          throw new Error("CSV-bestand is leeg.")
        }
        const header = lines[0].trim().split(",").map(h => h.trim().replace(/"/g, ''))
        const expectedHeaders = ["term", "definition", "stem", "group_name", "gender_name", "example_sentence"]

        if (header.length !== expectedHeaders.length || !expectedHeaders.every((h, i) => h === header[i])) {
          throw new Error(`Ongeldige CSV-headers. Verwacht: ${expectedHeaders.join(", ")}`)
        }

        // If validation passes, call the server action
        const result = await importFlashcardsFromCSV(setId, content)
        toast.success(`${result.count} flashcards zijn succesvol geïmporteerd.`)
        setOpen(false)
        setFile(null)
        router.refresh()
      } catch (error: any) {
        toast.error("Importeren Mislukt", { description: error.message })
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
          Importeer CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flashcards Importeren via CSV</DialogTitle>
          <DialogDescription>
            Upload een CSV-bestand om meerdere flashcards tegelijk aan deze set toe te voegen. Zorg ervoor dat je bestand de juiste indeling heeft.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">CSV-bestand</Label>
            <Input id="file" type="file" accept=".csv" onChange={handleFileChange} />
          </div>
          <p className="text-sm text-muted-foreground">
            Heb je geen sjabloon?{" "}
            <a href="/voorbeeld.csv" download className="underline text-primary">
              Download het voorbeeld-CSV-bestand.
            </a>
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Annuleren
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !file}>
            {loading ? "Importeren..." : "Importeren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}