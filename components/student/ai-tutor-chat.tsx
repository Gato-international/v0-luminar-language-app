"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BrainCircuit, AlertTriangle, Send, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AITutorChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Effect to fetch the initial greeting from the AI
  useEffect(() => {
    const getInitialMessage = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const supabase = createClient()
        const { data, error: invokeError } = await supabase.functions.invoke("ai-tutor-chat", {
          body: { messages: [] },
        })

        if (invokeError) throw invokeError

        // The edge function itself might return an error object in its body
        if (data.error) throw new Error(data.error)

        setMessages([{ role: "assistant", content: data.reply }])
      } catch (e: any) {
        setError(e.message || "An unknown error occurred.")
      } finally {
        setIsLoading(false)
      }
    }
    getInitialMessage()
  }, [])

  // Effect to scroll to the bottom of the chat on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: invokeError } = await supabase.functions.invoke("ai-tutor-chat", {
        body: { messages: newMessages },
      })

      if (invokeError) throw invokeError
      if (data.error) throw new Error(data.error)

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.")
      // Optionally add an error message to the chat
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm sorry, but I ran into a problem. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestionPrompts = [
    "Explain the accusative case",
    "Give me a practice sentence",
    "What's the difference between 'de' and 'het'?",
  ]

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span>Chat with Lumi</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-4">
        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "")}>
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary"><BrainCircuit className="h-5 w-5" /></AvatarFallback>
                </Avatar>
              )}
              <div className={cn("max-w-xl rounded-lg px-4 py-2 text-sm whitespace-pre-wrap", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {message.content}
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0"><AvatarFallback className="bg-primary/10 text-primary relative"><BrainCircuit className="h-5 w-5" /><span className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping" /></AvatarFallback></Avatar>
              <div className="bg-muted rounded-lg px-4 py-2 text-sm"><span className="animate-pulse">Lumi is thinking...</span></div>
            </div>
          )}
        </div>

        {messages.length <= 1 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
            {suggestionPrompts.map((prompt) => (
              <Button key={prompt} variant="outline" size="sm" className="text-xs h-auto py-2" onClick={() => setInput(prompt)}>
                <Sparkles className="h-3 w-3 mr-2" />{prompt}
              </Button>
            ))}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Error: {error}</span>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Lumi anything about grammar..." disabled={isLoading} />
          <Button type="submit" disabled={isLoading || !input.trim()}><Send className="h-4 w-4" /></Button>
        </form>
      </CardContent>
    </Card>
  )
}