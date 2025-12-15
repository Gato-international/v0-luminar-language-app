import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ScannerInterface } from "@/components/teacher/scanner-interface"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ScannerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "teacher") {
    redirect("/auth/login")
  }

  // Fetch necessary data
  const { data: chapters } = await supabase.from("chapters").select("id, title").order("order_index")
  const { data: cases } = await supabase.from("grammatical_cases").select("id, name").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/teacher/content/sentences">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sentences
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-xl">📜</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Document Scanner (MLC)</h1>
              <p className="text-sm text-muted-foreground">Mass Learning Creator: Paste Latin text to automatically analyze and import.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <ScannerInterface 
          chapters={chapters || []} 
          cases={cases || []} 
        />
      </div>
    </div>
  )
}
