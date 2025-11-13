import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
import Link from "next/link"
import { ShaderAnimation } from "@/components/ui/shader-animation"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Shader Animation as background */}
      <div className="absolute inset-0 z-0 opacity-70">
        <ShaderAnimation />
      </div>

      {/* Hero Section (on top) */}
      <div className="container mx-auto px-4 z-10">
        <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm border border-white/20">
            <Brain className="h-4 w-4" />
            Intelligent Language Learning
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance text-white">
            Master Grammar
            <span className="block">
              with <span className="text-white/80">Luminar</span>
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild size="lg" className="text-base bg-white text-black hover:bg-white/90">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base text-white border-white/50 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}