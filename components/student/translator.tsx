"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Languages, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function Translator() {
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTranslate = async () => {
    if (!inputText.trim()) return
    setIsLoading(true)
    setError(null)
    setTranslatedText("")

    try {
      const supabase = createClient()
      const { data, error: invokeError } = await supabase.functions.invoke("translate-text", {
        body: { text: inputText },
      })

      if (invokeError) throw invokeError
      if (data.error) throw new Error(data.error)

      setTranslatedText(data.translatedText)
    } catch (e: any) {
      const errorMessage = e.message || "An unknown error occurred during translation."
      setError(errorMessage)
      toast.error("Translation Failed", { description: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Languages className="h-6 w-6 text-primary" />
            <span>Translate to Dutch</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text in any language..."
            rows={5}
            className="text-base"
          />
          <Button onClick={handleTranslate} disabled={isLoading || !inputText.trim()} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              "Translate"
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {translatedText && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Translation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base">{translatedText}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}