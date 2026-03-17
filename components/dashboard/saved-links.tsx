"use client"

import { Link2, ExternalLink } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useUserSession } from "@/hooks/useUserSession"
import { getThumbnailUrl } from "@/lib/link-utils"

interface SavedLink {
  id: number
  url: string
  title: string
  label: string | null
  previewImage: string | null
}

export function SavedLinks() {
  const [links, setLinks] = useState<SavedLink[]>([])
  const [loading, setLoading] = useState(true)
  const { session } = useUserSession()

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await fetch("/api/links")
        const data = await res.json()
        if (data.success) {
          setLinks(data.data.slice(0, 3)) // Tampilkan 3 link terbaru
        }
      } catch (error) {
        console.error("Failed to fetch links:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchLinks()
    } else {
      setLoading(false)
    }
  }, [session])

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-card-foreground">Saved Links</h3>
        <Link 
          href="/saved-links" 
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
        >
          View all <ExternalLink size={12} />
        </Link>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Quickly access your recently saved video links.
      </p>

      <div className="space-y-3 flex-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : links.length > 0 ? (
          links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors group"
            >
              <div className="relative w-16 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src={link.previewImage || getThumbnailUrl(link.url) || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=225&auto=format&fit=crop"}
                  alt=""
                  fill
                  sizes="64px"
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-card-foreground text-sm truncate">{link.title}</p>
                <div className="flex gap-1 overflow-hidden">
                  {link.label ? link.label.split(',').map((l, i) => (
                    <span key={i} className="text-[10px] bg-primary/10 text-primary px-1 rounded truncate max-w-[60px]">
                      {l.trim()}
                    </span>
                  )) : <span className="text-[10px] text-muted-foreground">No label</span>}
                </div>
              </div>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <ExternalLink size={16} className="text-primary" />
              </a>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 border-2 border-dashed border-primary/10 rounded-xl">
            <Link2 size={24} className="text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No links saved yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
