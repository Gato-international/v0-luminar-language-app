"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface MaintenanceUpdateProps {
  text: string
}

export function MaintenanceUpdate({ text }: MaintenanceUpdateProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    setDisplayedText("") // Reset on text change
    let i = 0
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i))
        i++
      } else {
        clearInterval(typingInterval)
      }
    }, 50) // Typing speed

    return () => clearInterval(typingInterval)
  }, [text])

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  return (
    <div className="w-full max-w-2xl p-6 bg-gray-900/80 dark:bg-black/50 rounded-lg border border-gray-700/50 shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-3 w-3 rounded-full bg-red-500"></span>
        <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
        <span className="h-3 w-3 rounded-full bg-green-500"></span>
      </div>
      <code className="text-left text-green-400 font-mono text-sm whitespace-pre-wrap">
        <span className="text-blue-400">$</span> <span className="text-gray-300">cat ./dev_log.txt</span>
        <br />
        {displayedText}
        <span className={cn("bg-green-400 w-2 h-4 inline-block ml-1", { "opacity-0": !showCursor })}></span>
      </code>
    </div>
  )
}