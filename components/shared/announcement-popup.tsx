"use client"

import { useState, useEffect } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AnnouncementPopupProps {
  announcement: {
    id: string
    title: string
    content: string
    cta_text: string | null
    cta_link: string | null
  } | null
}

export function AnnouncementPopup({ announcement }: AnnouncementPopupProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (announcement) {
      const hasSeen = localStorage.getItem(`seen_announcement_${announcement.id}`)
      if (!hasSeen) {
        setIsOpen(true)
      }
    }
  }, [announcement])

  const handleClose = () => {
    if (announcement) {
      localStorage.setItem(`seen_announcement_${announcement.id}`, "true")
    }
    setIsOpen(false)
  }

  if (!announcement) {
    return null
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{announcement.title}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-wrap">{announcement.content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose}>Got it!</AlertDialogAction>
          {announcement.cta_text && announcement.cta_link && (
            <Button asChild variant="outline">
              <Link href={announcement.cta_link}>{announcement.cta_text}</Link>
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}