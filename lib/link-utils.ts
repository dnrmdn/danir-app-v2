export function getThumbnailUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname.toLowerCase()

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      let videoId = ""
      if (hostname.includes("youtu.be")) {
        videoId = parsedUrl.pathname.slice(1)
      } else if (parsedUrl.searchParams.has("v")) {
        videoId = parsedUrl.searchParams.get("v") || ""
      } else if (parsedUrl.pathname.includes("/shorts/")) {
        videoId = parsedUrl.pathname.split("/shorts/")[1].split("?")[0]
      } else if (parsedUrl.pathname.includes("/embed/")) {
        videoId = parsedUrl.pathname.split("/embed/")[1].split("?")[0]
      }

      if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }

    if (hostname.includes("instagram.com")) {
      const cleanUrl = url.split("?")[0]
      return `${cleanUrl.endsWith("/") ? cleanUrl : cleanUrl + "/"}media/?size=l`
    }

    if (hostname.includes("tiktok.com")) {
      return `https://unavatar.io/tiktok/${parsedUrl.pathname.split("@")[1]?.split("/")[0] || "tiktok"}?fallback=https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=400&h=225&auto=format&fit=crop`
    }

    return `https://unavatar.io/${hostname}?fallback=https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=225&auto=format&fit=crop`
  } catch {
    return "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=225&auto=format&fit=crop"
  }
}
