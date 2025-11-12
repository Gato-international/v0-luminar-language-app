"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SignInPage, type Testimonial } from "@/components/ui/sign-in"
import { toast } from "sonner"

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80",
    name: "Alex Johnson",
    handle: "@alexj",
    text: "Luminar has completely changed how I approach learning grammar. It's intuitive and effective!",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
    name: "Maria Garcia",
    handle: "@mariag",
    text: "The exercises are fantastic. I can finally see my progress and understand complex rules.",
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&q=80",
    name: "Chen Wei",
    handle: "@chenw",
    text: "As a teacher, this platform is a dream. The AI feedback for students is incredibly insightful.",
  },
]

export default function NewLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const toastId = toast.loading("Signing in...")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error("Sign In Failed", { id: toastId, description: error.message })
    } else {
      toast.success("Signed in successfully!", { id: toastId })
      router.push("/dashboard")
      router.refresh()
    }
  }

  const handleGoogleSignIn = () => {
    toast.info("Google Sign-In is not yet implemented.")
  }

  const handleResetPassword = () => {
    toast.info("Password reset functionality is not yet implemented.")
  }

  const handleCreateAccount = () => {
    router.push("/auth/sign-up")
  }

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        title={
          <>
            Welcome back to <span className="text-primary">Luminar</span>
          </>
        }
        heroImageSrc="https://images.unsplash.com/photo-1534349578988-9b6a744061b1?w=2160&q=80"
        testimonials={sampleTestimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  )
}