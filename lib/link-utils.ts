const DEFAULT_PREVIEW =
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&h=225&auto=format&fit=crop";

const INSTAGRAM_FALLBACK =
  "https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=400&h=225&auto=format&fit=crop";

const TIKTOK_FALLBACK =
  "https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=400&h=225&auto=format&fit=crop";

function getInstagramFallback(parsedUrl: URL) {
  const cleanPath = parsedUrl.pathname.replace(/\/+$/, "");
  const segments = cleanPath.split("/").filter(Boolean);
  const firstSegment = segments[0] || "";

  if (firstSegment.startsWith("@")) {
    const username = firstSegment.slice(1);
    if (username) {
      return `https://unavatar.io/instagram/${username}?fallback=${encodeURIComponent(INSTAGRAM_FALLBACK)}`;
    }
  }

  return INSTAGRAM_FALLBACK;
}

export function getThumbnailUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();

    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      let videoId = "";
      if (hostname.includes("youtu.be")) {
        videoId = parsedUrl.pathname.slice(1);
      } else if (parsedUrl.searchParams.has("v")) {
        videoId = parsedUrl.searchParams.get("v") || "";
      } else if (parsedUrl.pathname.includes("/shorts/")) {
        videoId = parsedUrl.pathname.split("/shorts/")[1].split("?")[0];
      } else if (parsedUrl.pathname.includes("/embed/")) {
        videoId = parsedUrl.pathname.split("/embed/")[1].split("?")[0];
      }

      if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    if (hostname.includes("instagram.com")) {
      return getInstagramFallback(parsedUrl);
    }

    if (hostname.includes("tiktok.com")) {
      const username = parsedUrl.pathname.split("@")[1]?.split("/")[0] || "tiktok";
      return `https://unavatar.io/tiktok/${username}?fallback=${encodeURIComponent(TIKTOK_FALLBACK)}`;
    }

    return `https://unavatar.io/${hostname}?fallback=${encodeURIComponent(DEFAULT_PREVIEW)}`;
  } catch {
    return DEFAULT_PREVIEW;
  }
}
