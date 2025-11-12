import { TestModeBanner } from "@/components/shared/test-mode-banner"
import { headers } from "next/headers"

export default async function ExerciseLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  let platformStatus = null

  if (typeof headersList.get === "function") {
    platformStatus = headersList.get("x-platform-status")
  } else {
    platformStatus = (headersList as any)["x-platform-status"]
  }

  return (
    <>
      {platformStatus === "test" && <TestModeBanner />}
      {children}
    </>
  )
}