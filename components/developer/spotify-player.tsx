"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Music, X, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function SpotifyPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  // Default to a nice lofi playlist
  const [uri, setUri] = useState("spotify:playlist:37i9dQZF1DXcBWIGoYBM5M")
  const [inputValue, setInputValue] = useState("spotify:playlist:37i9dQZF1DXcBWIGoYBM5M")

  const handleLoad = () => {
    if (inputValue.startsWith("spotify:")) {
      setUri(inputValue)
      toast.success("Spotify content loaded!")
    } else {
      toast.error("Invalid Spotify URI", {
        description: "Please use the format 'spotify:track:...' or similar.",
      })
    }
  }

  const embedUrl = `https://open.spotify.com/embed/${uri.replace("spotify:", "").replace(/:/g, "/")}`

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg animate-pulse-glow"
        >
          <Music className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-80 shadow-2xl animate-in fade-in-50 slide-in-from-bottom-10 duration-300">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Music className="h-4 w-4" />
          Spotify Player
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={cn("px-4 pb-4 space-y-3", isCollapsed && "hidden")}>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Spotify URI (e.g., spotify:album:...)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="h-8 text-xs"
            />
            <Button size="sm" onClick={handleLoad} className="h-8">
              Load
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Paste a song, album, or playlist URI.</p>
        </div>
        <iframe
          title="Spotify Embed Player"
          style={{ borderRadius: "12px" }}
          src={embedUrl}
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen={false}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </CardContent>
    </Card>
  )
}