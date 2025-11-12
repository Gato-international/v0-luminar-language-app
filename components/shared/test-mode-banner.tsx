import { AlertTriangle } from "lucide-react"

export function TestModeBanner() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-yellow-500/20 p-3 text-center text-sm text-yellow-800 border-b border-yellow-500/30">
      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
      <p>
        The platform is currently in <strong>Test Mode</strong>. Functionality may be limited or experimental.
      </p>
    </div>
  )
}