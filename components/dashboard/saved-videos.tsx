"use client"

import { Play, BookmarkPlus } from "lucide-react"

const videos = [
  { id: 1, title: "Morning Motivation", duration: "8:45", category: "Motivation" },
  { id: 2, title: "Productivity Tips", duration: "12:30", category: "Education" },
  { id: 3, title: "Yoga Relaxation", duration: "15:00", category: "Wellness" },
]

export function SavedVideos() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-card-foreground mb-2">Saved Videos</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Store your favorite motivational, inspirational, or educational videos.
      </p>

      <div className="space-y-3">
        {videos.map((video) => (
          <div
            key={video.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors group"
          >
            <div className="relative w-16 h-12 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Play size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-card-foreground text-sm">{video.title}</p>
              <p className="text-xs text-muted-foreground">
                {video.category} • {video.duration}
              </p>
            </div>
            <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
              <BookmarkPlus size={16} className="text-primary" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
