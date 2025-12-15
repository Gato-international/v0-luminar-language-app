import { SignUpForm } from "@/components/auth/sign-up-form"
import { createClient } from "@supabase/supabase-js"
import { Brain, Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SignUpPage() {
  // Use admin client to bypass RLS for this public check to ensure we can read the setting
  // Fallback to true if key is missing (dev environment) or if setting is not found
  let registrationEnabled = true
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "registration_enabled")
      .single()

    if (data !== null && data.value !== undefined) {
      registrationEnabled = data.value
    }
  }

  if (!registrationEnabled) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-b from-background to-muted/20">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">Luminar</span>
              </div>
              <p className="text-sm text-muted-foreground">Language Learning Platform</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-xl">Registration Closed</CardTitle>
                </div>
                <CardDescription>
                  New account registration is currently disabled by the administrator.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If you already have an account, you can still sign in to access your dashboard.
                </p>
                <Button asChild className="w-full">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-b from-background to-muted/20">
      <SignUpForm />
    </div>
  )
}
