import { TestModeBanner } from "@/components/shared/test-mode-banner"
import { headers } from "next/headers"

export default async function ExerciseLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  // In some environments, the headers object might not have a .get() method.
  // Access it as a plain object property, ensuring the key is lowercase.
  const platformStatus = (headersList as any)["x-platform-status"]

  return (
    <>
      {platformStatus === "test" && <TestModeBanner />}
      {children}
    </>
  )
}