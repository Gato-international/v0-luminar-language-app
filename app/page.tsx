import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      {/* Hero Section */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Brain className="h-4 w-4" />
            Intelligent Language Learning
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            Master Dutch Grammar with <span className="text-primary">Luminar</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl">
            An intelligent platform for students and teachers to practice and master grammatical case analysis through
            interactive exercises.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild size="lg" className="text-base">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base bg-transparent">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}