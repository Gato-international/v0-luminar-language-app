"use client"

import type React from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, LayoutGrid, List, Trash2 } from "lucide-react"
import Link from "next/link"
import { FlashcardDialog } from "@/components/teacher/flashcard-dialog"
import { EditableFlashcardCard } from "@/components/teacher/editable-flashcard-card"
import { FlashcardImportDialog } from "@/components/teacher/flashcard-import-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { bulkDeleteFlashcards } from "@/app/actions/flashcards"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// This is now a client component to handle state
export default function FlashcardSetDetailPage({ params }: { params: { id: string } }) {
  const setId = params.id
  const router = useRouter()
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [set, setSet] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [genders, setGenders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [view, setView] = useState<"grid" | "list">("grid")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  useState(() => {
    const supabase = createClient()
    const fetchData = async () => {
      const { data: setData } = await supabase.from("flashcard_sets").select("*").eq("id", setId).single()
      if (!setData) router.push("/dashboard/teacher/content/flashcards")

      const { data: flashcardsData } = await supabase.from("flashcards").select("*, groups(name), genders(name)").eq("set_id", setId).order("created_at")
      const { data: groupsData } = await supabase.from("groups").select("*")
      const { data: gendersData } = await supabase.from("genders").select("*")

      setSet(setData)
      setFlashcards(flashcardsData || [])
      setGroups(groupsData || [])
      setGenders(gendersData || [])
      setLoading(false)
    }
    fetchData()
  })

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? flashcards.map((f) => f.id) : [])
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)))
  }

  const handleBulkDelete = () => {
    startTransition(async () => {
      try {
        await bulkDeleteFlashcards(selectedIds, setId)
        toast.success(`${selectedIds.length} flashcard(s) deleted.`)
        // Manually filter out deleted cards from state to avoid full reload
        setFlashcards(flashcards.filter(f => !selectedIds.includes(f.id)))
        setSelectedIds([])
      } catch (error: any) {
        toast.error("Delete failed", { description: error.message })
      }
    })
  }

  if (loading || !set) {
    return <div>Loading...</div> // Or a proper skeleton loader
  }

  const areAllSelected = selectedIds.length === flashcards.length && flashcards.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/teacher/content/flashcards">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sets
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{set.title}</h1>
              <p className="text-sm text-muted-foreground">{set.description || "Manage the flashcards in this set."}</p>
            </div>
            <div className="flex items-center gap-2">
              <FlashcardImportDialog setId={setId} />
              <FlashcardDialog setId={setId} groups={groups} genders={genders} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')}><LayoutGrid className="h-4 w-4" /></Button>
              <Button variant={view === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setView('list')}><List className="h-4 w-4" /></Button>
              <div className="flex items-center gap-2 ml-4">
                <Checkbox id="select-all" checked={areAllSelected} onCheckedChange={handleSelectAll} />
                <label htmlFor="select-all" className="text-sm font-medium">Select All</label>
              </div>
            </div>
            {selectedIds.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isPending}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedIds.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {selectedIds.length} flashcard(s). This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {flashcards && flashcards.length > 0 ? (
          view === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcards.map((flashcard) => (
                <EditableFlashcardCard
                  key={flashcard.id}
                  flashcard={flashcard}
                  setId={setId}
                  groups={groups}
                  genders={genders}
                  isSelected={selectedIds.includes(flashcard.id)}
                  onSelectChange={handleSelectOne}
                />
              ))}
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Definition</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flashcards.map((flashcard) => (
                    <TableRow key={flashcard.id}>
                      <TableCell>
                        <Checkbox checked={selectedIds.includes(flashcard.id)} onCheckedChange={(checked) => handleSelectOne(flashcard.id, !!checked)} />
                      </TableCell>
                      <TableCell className="font-medium">{flashcard.term}</TableCell>
                      <TableCell>{flashcard.definition}</TableCell>
                      <TableCell><Badge variant="outline">{flashcard.groups?.name}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{flashcard.genders?.name}</Badge></TableCell>
                      <TableCell className="text-right">
                        {/* Placeholder for single edit/delete in list view */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No flashcards in this set yet.</p>
              <FlashcardDialog setId={setId} groups={groups} genders={genders} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}