import { SpotifyPlayer } from "@/components/developer/spotify-player"

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SpotifyPlayer />
    </>
  )
}