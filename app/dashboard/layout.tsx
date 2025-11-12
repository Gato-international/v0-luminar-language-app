import { createClient } from "@/lib/supabase/server"
import { AnnouncementPopup } from "@/components/shared/announcement-popup"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let announcement = null
  if (user) {
    // The RLS policy will automatically filter to the correct announcement for the user's role
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .limit(1)
      .single()
    announcement = data
  }

  return (
    <>
      <AnnouncementPopup announcement={announcement} />
      {children}
    </>
  )
}