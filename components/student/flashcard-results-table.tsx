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
            <TableHead className="font-semibold">Woord</TableHead>
            {fields.map((field) => (
              <TableHead key={field.key} className="text-center font-semibold">
                {field.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.card.id}>
              <TableCell className="font-medium">{result.card.term}</TableCell>
              {fields.map((field) => (
                <TableCell key={field.key} className="text-center">
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