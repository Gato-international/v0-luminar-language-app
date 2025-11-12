import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Settings, Database, Code, Activity, Megaphone, FileText, Target, Package, Mail, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { UserNav } from "@/components/student/user-nav"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns"
import { ActivityChart } from "@/components/developer/activity-chart"
import { SpotifyPlayer } from "@/components/developer/spotify-player"

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

  // Fetch all metrics in parallel
  const [
    { count: usersCount },
    { count: exercisesCount },
    { data: allProgress },
    { count: chaptersCount },
    { count: sentencesCount },
    { count: flashcardSetsCount },
    { data: allUsers },
    { data: recentExercises },
    { data: recentCompletedExercises },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("exercises").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("student_progress").select("total_correct, total_attempts"),
    supabase.from("chapters").select("*", { count: "exact", head: true }),
    supabase.from("sentences").select("*", { count: "exact", head: true }),
    supabase.from("flashcard_sets").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase
      .from("exercises")
      .select("id, created_at, profiles(full_name), chapters(title)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("exercises")
      .select("completed_at")
      .eq("status", "completed")
      .gte("completed_at", subDays(new Date(), 30).toISOString()),
  ])

  // Calculate overall accuracy
  const totalCorrect = allProgress?.reduce((sum, p) => sum + p.total_correct, 0) || 0
  const totalAttempts = allProgress?.reduce((sum, p) => sum + p.total_attempts, 0) || 0
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  const totalContentCount = (chaptersCount || 0) + (sentencesCount || 0) + (flashcardSetsCount || 0)

  const userRoles = {
    student: allUsers?.filter((u) => u.role === "student").length || 0,
    teacher: allUsers?.filter((u) => u.role === "teacher").length || 0,
    developer: allUsers?.filter((u) => u.role === "developer").length || 0,
  }

  const recentUsers = allUsers?.slice(0, 5)

  // Process data for activity chart
  const activityData = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  }).map((day) => ({
    date: format(day, "yyyy-MM-dd"),
    count: 0,
  }))

  const activityMap = new Map(activityData.map((d) => [d.date, d.count]))

  recentCompletedExercises?.forEach((exercise) => {
    if (exercise.completed_at) {
      const date = format(startOfDay(new Date(exercise.completed_at)), "yyyy-MM-dd")
      if (activityMap.has(date)) {
        activityMap.set(date, (activityMap.get(date) || 0) + 1)
      }
    }
  })

  const chartData = Array.from(activityMap, ([date, count]) => ({ date, count }))

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
          <h2 className="text-3xl font-bold mb-2">Application Metrics</h2>
          <p className="text-muted-foreground">An overview of platform activity and content.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{usersCount || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exercises Completed</p>
                <p className="text-2xl font-bold">{exercisesCount || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                <p className="text-2xl font-bold">{overallAccuracy}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Package className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Content Items</p>
                <p className="text-2xl font-bold">{totalContentCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <div className="mb-8">
          <ActivityChart data={chartData} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* User Roles & Recent Signups */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
                <CardDescription>The last 5 users to join the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.role}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(u.created_at), "PPP")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Students</span>
                  <span className="font-bold">{userRoles.student}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Teachers</span>
                  <span className="font-bold">{userRoles.teacher}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Developers</span>
                  <span className="font-bold">{userRoles.developer}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Content Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Chapters</span>
                  <span className="font-bold">{chaptersCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sentences</span>
                  <span className="font-bold">{sentencesCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Flashcard Sets</span>
                  <span className="font-bold">{flashcardSetsCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Management Tools</h2>
          <p className="text-muted-foreground">Quick access to key management areas.</p>
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

          <Link href="/dashboard/developer/platform-status">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-yellow-500" />
                  </div>
                  <CardTitle>Platform Status</CardTitle>
                </div>
                <CardDescription>Control maintenance mode and other platform states.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/developer/announcements">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Megaphone className="h-6 w-6 text-teal-500" />
                  </div>
                  <CardTitle>Announcements</CardTitle>
                </div>
                <CardDescription>Create and manage global pop-up announcements.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/developer/content">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Database className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle>Content Database</CardTitle>
                </div>
                <CardDescription>Raw access to all chapters, sentences, and flashcards.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard/developer/emails">
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-red-500" />
                  </div>
                  <CardTitle>Email Management</CardTitle>
                </div>
                <CardDescription>Configure and manage automated emails.</CardDescription>
              </CardHeader>
            </Card>
          </Link>

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
      <SpotifyPlayer />
    </div>
  )
}