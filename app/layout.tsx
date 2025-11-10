import type React from "react"
import type { Metadata } from "next"
import "@fontsource/inter" // Imports the Inter font
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Luminar - Language Learning Platform",
  description: "Master Dutch grammar with intelligent exercises",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}