import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Settings, Database, Code, Activity } from "lucide-react"
import Link from "next/link"
import { UserNav } from "@/components/student/user-nav"

export default async function DeveloperDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "developer") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Luminar</h1>
              <p className="text-sm text-muted-foreground">Developer Dashboard</p>
            </div>
          </div>
          <UserNav profile={profile} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, Developer!</h2>
          <p className="text-muted-foreground">Manage and monitor the application from here.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/developer/users">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle>User Management</CardTitle>
                </div>
                <CardDescription>View, edit, and manage all user accounts and roles.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/developer/student-data">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle>Student Data</CardTitle>
                </div>
                <CardDescription>Monitor exercises, attempts, and AI feedback logs.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Database className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Content Database</CardTitle>
              </div>
              <CardDescription>Raw access to all chapters, sentences, and flashcards. (Coming Soon)</CardDescription>
            </CardHeader>
          </Card>

          <Link href="/dashboard/teacher/settings">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-purple-500" />
                  </div>
                  <CardTitle>Platform Settings</CardTitle>
                </div>
                <CardDescription>Configure global application settings.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}