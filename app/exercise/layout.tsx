import { TestModeBanner } from "@/components/shared/test-mode-banner"
import { headers } from "next/headers"

export default async function ExerciseLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const platformStatus = headersList.get("x-platform-status")

  return (
    <>
      {platformStatus === "test" && <TestModeBanner />}
      {children}
    </>
  )
}