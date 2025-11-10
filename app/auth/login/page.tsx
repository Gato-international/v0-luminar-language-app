"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Brain } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        router.push("/dashboard")
      }
    }
    checkUser()
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-4xl grid md:grid-cols-2 shadow-2xl overflow-hidden rounded-2xl">
        {/* Left side: Login Form */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <div className="flex flex-col items-start gap-2 mb-8">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Luminar</span>
            </div>
            <p className="text-sm text-muted-foreground">Welcome back to your learning journey</p>
          </div>

          <h2 className="text-2xl font-bold">Sign In</h2>
          <p className="text-sm text-muted-foreground mb-6">Enter your credentials to access your account</p>

          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="underline underline-offset-4 text-primary">
                Sign up
              </Link>
            </div>
          </form>
        </div>

        {/* Right side: Image and Text */}
        <div className="hidden md:flex flex-col items-center justify-center bg-muted/50 p-10 text-center border-l">
          <img src="/placeholder.svg" alt="Language Learning" className="w-3/4" />
          <h3 className="mt-6 text-2xl font-bold">Unlock Your Potential</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Join our community and take your language skills to the next level with interactive exercises.
          </p>
        </div>
      </Card>
    </div>
  )
}