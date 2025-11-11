"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle } from "lucide-react"

interface ResultsTableProps {
  results: any[]
  groups: Array<{ id: string; name: string }>
  genders: Array<{ id: string; name: string }>
}

export function FlashcardResultsTable({ results, groups, genders }: ResultsTableProps) {
  const fields = [
    { key: "meaning", label: "Betekenis" },
    { key: "stem", label: "Stam" },
    { key: "gender", label: "Geslacht" },
    { key: "group", label: "Groep" },
  ]

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Onderdeel</TableHead>
            {results.map((result) => (
              <TableHead key={result.card.id} className="text-center font-semibold">
                {result.card.term}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field) => (
            <TableRow key={field.key}>
              <TableCell className="font-medium">{field.label}</TableCell>
              {results.map((result) => (
                <TableCell key={result.card.id} className="text-center">
                  <div className="flex justify-center">
                    {result.feedback[field.key] === "correct" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}