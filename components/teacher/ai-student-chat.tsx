"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BrainCircuit, AlertTriangle, Send, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIStudentChatProps {
  studentId: string
}

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AIStudentChat({ studentId }: AIStudentChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial message from AI
    const fetchInitialMessage = async () => {
      setIsLoading(true)
      setError(null)
      const supabase = createClient()
      const { data, error } = await supabase.functions.invoke("chat-with-student-ai", {
        body: { student_id: studentId, messages: [] },
      })
      if (error) {
        const detailedError = (error as any).error || error.message
        setError(detailedError)
      } else {
        setMessages([{ role: "assistant", content: data.reply }])
      }
      setIsLoading(false)
    }
    fetchInitialMessage()
  }, [studentId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessages: Message[] = [...messages, { role: "user", content: input }]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error } = await supabase.functions.invoke("chat-with-student-ai", {
      body: { student_id: studentId, messages: newMessages },
    })

    if (error) {
      const detailedError = (error as any).error || error.message
      setError(detailedError)
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error." }])
    } else {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
    }
    setIsLoading(false)
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span>Chat with Lumi AI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <BrainCircuit className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-md rounded-lg px-4 py-2 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && messages.length === 0 && (
             <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary relative">
                    <BrainCircuit className="h-5 w-5" />
                    <span className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2 text-sm">
                    <span className="animate-pulse">Lumi is preparing your summary...</span>
                </div>
            </div>
          )}
        </div>
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this student's progress..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}