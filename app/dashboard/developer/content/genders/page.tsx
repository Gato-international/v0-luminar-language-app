import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GenderDialog } from "@/components/teacher/gender-dialog"
import { DeleteDialog } from "@/components/teacher/delete-dialog"
import { deleteGender } from "@/app/actions/genders"

export default async function DeveloperGendersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") redirect("/dashboard")

  const { data: genders } = await supabase.from("genders").select("*").order("name")

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/developer/content"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Content Database</Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Genders</h1>
              <p className="text-sm text-muted-foreground">Manage word genders</p>
            </div>
            <GenderDialog />
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        {genders && genders.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {genders.map((gender) => (
              <Card key={gender.id}>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>{gender.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <GenderDialog gender={gender} />
                    <DeleteDialog id={gender.id} type="gender" onDelete={deleteGender} />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground">No genders created yet.</p></CardContent></Card>
        )}
      </div>
    </div>
  )
}