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
          setLinks(data.data.slice(0, 3))
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
    <div className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-950/10 backdrop-blur-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            <Link2 className="h-3.5 w-3.5" />
            Knowledge vault
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Saved Links</h3>
          <p className="text-sm text-slate-300">Save useful videos, references, and content you want to revisit fast.</p>
        </div>
        <Link href="/saved-links" className="inline-flex items-center gap-1 text-xs font-medium text-cyan-200 hover:text-white">
          View all <ExternalLink size={12} />
        </Link>
      </div>

      <div className="space-y-3 flex-1">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : links.length > 0 ? (
          links.map((link) => (
            <div
              key={link.id}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-3 transition hover:border-cyan-400/20 hover:bg-white/5"
            >
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-white/5">
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
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{link.title}</p>
                <div className="flex gap-1 overflow-hidden mt-1">
                  {link.label ? link.label.split(",").map((l, i) => (
                    <span key={i} className="max-w-[68px] truncate rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-200">
                      {l.trim()}
                    </span>
                  )) : <span className="text-[10px] text-slate-500">No label</span>}
                </div>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl p-2 transition hover:bg-cyan-400/10"
              >
                <ExternalLink size={16} className="text-cyan-200" />
              </a>
            </div>
          ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 py-8 text-center">
            <Link2 size={24} className="mb-2 text-slate-500" />
            <p className="text-xs text-slate-400">No links saved yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
