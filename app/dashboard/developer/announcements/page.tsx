import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { AnnouncementDialog } from "@/components/developer/announcement-dialog"
import { DeleteDialog } from "@/components/teacher/delete-dialog"
import { deleteAnnouncement } from "@/app/actions/announcements"

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (!profile || profile.role !== "developer") redirect("/dashboard")

  const { data: announcements } = await supabase.from("announcements").select("*").order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" className="mb-2">
            <Link href="/dashboard/developer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Developer Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Announcements</h1>
              <p className="text-sm text-muted-foreground">Manage popups for students and teachers.</p>
            </div>
            <AnnouncementDialog />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements?.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium">{announcement.title}</TableCell>
                  <TableCell><Badge variant="secondary">{announcement.target_role}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={announcement.is_active ? "default" : "outline"}>
                      {announcement.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {announcement.expires_at ? format(new Date(announcement.expires_at), "PPP") : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <AnnouncementDialog announcement={announcement} />
                      <DeleteDialog id={announcement.id} type="announcement" onDelete={deleteAnnouncement} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}