import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function GrammaticalCasesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "teacher") {
    redirect("/auth/login")
  }

  // Get all grammatical cases
  const { data: grammaticalCases } = await supabase.from("grammatical_cases").select("*").order("name")

  // Get usage counts for each case
  const usageCounts = await Promise.all(
    (grammaticalCases || []).map(async (grammaticalCase) => {
      const { count } = await supabase
        .from("word_annotations")
        .select("*", { count: "exact", head: true })
        .eq("grammatical_case_id", grammaticalCase.id)
      return { caseId: grammaticalCase.id, count: count || 0 }
    }),
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/teacher/content">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Content
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Grammatical Cases</h1>
            <p className="text-sm text-muted-foreground">View grammatical case types and their usage</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {grammaticalCases && grammaticalCases.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {grammaticalCases.map((grammaticalCase) => {
              const usageCount = usageCounts.find((c) => c.caseId === grammaticalCase.id)?.count || 0
              return (
                <Card key={grammaticalCase.id}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div
                        className="h-16 w-16 rounded-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                        style={{ backgroundColor: grammaticalCase.color }}
                      >
                        {grammaticalCase.abbreviation}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-1">{grammaticalCase.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{grammaticalCase.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: grammaticalCase.color,
                          color: grammaticalCase.color,
                        }}
                      >
                        {usageCount} annotations
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Color: {grammaticalCase.color.toUpperCase()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No grammatical cases found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
