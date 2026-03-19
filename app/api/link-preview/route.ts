import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const META_GRAPH_BASE_URL = "https://graph.facebook.com/v23.0/instagram_oembed";

function isMetaUrl(hostname: string) {
  return hostname.includes("instagram.com") || hostname.includes("facebook.com") || hostname.includes("fb.watch");
}

async function getMicrolinkPreview(targetUrl: string) {
  const params = new URLSearchParams({
    url: targetUrl,
  });

  const response = await fetch(`https://api.microlink.io/?${params.toString()}`, {
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.status !== "success") {
    throw new Error("Microlink fetch failed");
  }

  return {
    image: data.data?.image?.url || data.data?.logo?.url || null,
    title: typeof data.data?.title === "string" ? data.data?.title : null,
    description: typeof data.data?.description === "string" ? data.data?.description : null,
    source: "microlink",
  };
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractMeta(content: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escapeRegExp(key)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escapeRegExp(key)}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${escapeRegExp(key)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escapeRegExp(key)}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }

  return null;
}

async function getGenericPreview(targetUrl: string) {
  const response = await fetch(targetUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
      Referer: "https://www.google.com/",
      "Cache-Control": "no-cache",
    },
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Preview fetch failed (${response.status})`);
  }

  const html = await response.text();
  return {
    image: extractMeta(html, "og:image") || extractMeta(html, "twitter:image"),
    title: extractMeta(html, "og:title") || extractMeta(html, "twitter:title") || extractMeta(html, "title"),
    description: extractMeta(html, "og:description") || extractMeta(html, "twitter:description"),
    source: "html",
  };
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url")?.trim();

    if (!targetUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    try {
      const metaPreview = isMetaUrl(hostname) ? await getMicrolinkPreview(targetUrl) : null;
      if (metaPreview?.image || metaPreview?.title || metaPreview?.description) {
        return NextResponse.json({ success: true, data: metaPreview });
      }
    } catch (error) {
      console.error("Microlink preview failed:", error);
    }

    const genericPreview = await getGenericPreview(targetUrl);

    return NextResponse.json({
      success: true,
      data: genericPreview,
    });
  } catch (error) {
    console.error("Error fetching link preview:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
  }
}
