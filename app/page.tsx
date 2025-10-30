import { Button } from "@/components/ui/button"
import { BookOpen, Brain, Target, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
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

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          <div className="flex flex-col gap-3 p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-lg">Interactive Exercises</h3>
            <p className="text-sm text-muted-foreground">
              Select words and assign grammatical cases with instant color-coded feedback
            </p>
          </div>

          <div className="flex flex-col gap-3 p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="font-semibold text-lg">Personalized Learning</h3>
            <p className="text-sm text-muted-foreground">Track your progress across chapters and difficulty levels</p>
          </div>

          <div className="flex flex-col gap-3 p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-semibold text-lg">Detailed Analytics</h3>
            <p className="text-sm text-muted-foreground">
              View comprehensive statistics and identify areas for improvement
            </p>
          </div>

          <div className="flex flex-col gap-3 p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-orange-500" />
            </div>
            <h3 className="font-semibold text-lg">Teacher Tools</h3>
            <p className="text-sm text-muted-foreground">
              Manage content, track student progress, and generate custom exercises
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
