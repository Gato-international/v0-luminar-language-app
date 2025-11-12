"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Music, X, ChevronDown, ChevronUp, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function SpotifyPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const defaultPlaylistUrl = "https://open.spotify.com/embed/playlist/6Q6ymtrtuHGqaGNrXewvW1"
  const [embedUrl, setEmbedUrl] = useState(defaultPlaylistUrl)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setEmbedUrl(`https://open.spotify.com/embed/search/${encodeURIComponent(searchQuery)}`)
      toast.success(`Searching for "${searchQuery}"...`)
    }
  }

  const handleReset = () => {
    setEmbedUrl(defaultPlaylistUrl)
    setSearchQuery("")
    toast.info("Player reset to default playlist.")
  }

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
          <Music className={cn("h-4 w-4", isCollapsed && "animate-music-pulse")} />
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
              placeholder="Search for a song or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button size="sm" onClick={handleSearch} className="h-8">
              Search
            </Button>
          </div>
          <Button variant="link" size="sm" className="text-xs h-auto p-0 text-muted-foreground" onClick={handleReset}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset to default playlist
          </Button>
        </div>
        <iframe
          key={embedUrl}
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