// app/api/rss/route.ts
import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const revalidate = 480; // 8 perc

type FeedItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;

  content?: string;
  contentSnippet?: string;
  summary?: string;

  enclosure?: { url?: string; type?: string };
  image?: string | { url?: string };

  // extra mezők
  ["media:content"]?: { $?: { url?: string } } | any;
  ["media:thumbnail"]?: { $?: { url?: string } } | any;
  ["content:encoded"]?: string;
  ["itunes:image"]?: { href?: string } | any;
};

type OutItem = {
  title: string;
  url: string;
  source: string;
  published?: string;
  excerpt?: string;
  image?: string;
};

const DEFAULT_FEEDS = [
  "https://hvg.hu/rss/",
  "https://444.hu/feed",
  "https://telex.hu/rss",
  "https://24.hu/rss",
  "https://gsplus.hu/rss",
];

// --- utilok ---
function absolutize(url: string | undefined, base?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url, base);
    if (u.protocol === "http:") u.protocol = "https:"; // upgrade
    return u.toString();
  } catch {
    return undefined;
  }
}

function firstImgFromHtml(html?: string, base?: string): string | undefined {
  if (!html) return undefined;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m?.[1]) return absolutize(m[1], base);
  return undefined;
}

function pickImageFromFeed(i: FeedItem, base?: string): string | undefined {
  // 1) media:thumbnail
  const t = (i["media:thumbnail"] as any)?.$?.url;
  if (typeof t === "string") return absolutize(t, base);

  // 2) media:content
  const c = (i["media:content"] as any)?.$?.url;
  if (typeof c === "string") return absolutize(c, base);

  // 3) enclosure (image/*)
  if (i.enclosure?.url && (!i.enclosure.type || i.enclosure.type.startsWith("image/"))) {
    const enc = absolutize(i.enclosure.url, base);
    if (enc) return enc;
  }

  // 4) itunes:image
  const it = (i["itunes:image"] as any)?.href;
  if (typeof it === "string") return absolutize(it, base);

  // 5) image / image.url
  if (typeof i.image === "string") return absolutize(i.image, base);
  if (typeof (i.image as any)?.url === "string") return absolutize((i.image as any).url, base);

  // 6) content:encoded / content / summary első <img>
  const fromEncoded = firstImgFromHtml(i["content:encoded"], base);
  if (fromEncoded) return fromEncoded;

  const fromContent = firstImgFromHtml(i.content, base);
  if (fromContent) return fromContent;

  const fromSummary =
    firstImgFromHtml(i.summary, base) || firstImgFromHtml(i.contentSnippet, base);
  if (fromSummary) return fromSummary;

  return undefined;
}

// Naiv OG:image kinyerés HTML-ből (regex-szel, gyors és dependency-mentes)
async function fetchOgImage(pageUrl: string, timeoutMs = 3000): Promise<string | undefined> {
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(pageUrl, {
      signal: ctrl.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; RSS-Preview/1.0; +https://example.com)",
        accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });
    clearTimeout(to);
    if (!res.ok) return undefined;
    const html = await res.text();

    const m1 = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (m1?.[1]) return m1[1];

    const m2 = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (m2?.[1]) return m2[1];

    const m3 = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m3?.[1]) return m3[1];

    return undefined;
  } catch {
    return undefined;
  }
}

export async function GET(req: Request) {
  // --- dinamikus limit: ?limit=4 (alap: 4, max: 12)
  const { searchParams } = new URL(req.url);
  const limitParam = Number(searchParams.get("limit") || "");
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 12) : 4;

  const parser = new Parser<any, FeedItem>({
    customFields: {
      item: [
        ["media:content", "media:content"],
        ["media:thumbnail", "media:thumbnail"],
        ["content:encoded", "content:encoded"],
        ["itunes:image", "itunes:image"],
        "image",
      ],
      feed: ["link", "title"],
    },
  });

  const feedsEnv = process.env.RSS_FEEDS?.split(",").map((s) => s.trim()).filter(Boolean);
  const feeds = feedsEnv?.length ? feedsEnv : DEFAULT_FEEDS;

  const useOg = process.env.RSS_FETCH_OG === "1";
  const ogTimeout = Number(process.env.RSS_FETCH_OG_TIMEOUT || 3000);

  try {
    const results = await Promise.allSettled(
      feeds.map(async (feedUrl) => {
        const feed = await parser.parseURL(feedUrl);
        const base = feed.link || feedUrl;
        const source = feed.title || new URL(feedUrl).host;

        // Először a feedből próbálunk képet (gyors)
        const items0: OutItem[] = (feed.items || []).slice(0, 10).map((i: FeedItem) => ({
          title: i.title || "(nincs cím)",
          url: absolutize(i.link, base) || feedUrl,
          source,
          published: i.isoDate || i.pubDate,
          excerpt: i.contentSnippet || i.summary,
          image: pickImageFromFeed(i, base),
        }));

        // Ha kell, OG fallback – CSAK azoknál, ahol nincs kép
        if (useOg) {
          await Promise.all(
            items0.map(async (it) => {
              if (it.image) return;
              const og = await fetchOgImage(it.url, ogTimeout);
              const abs = absolutize(og, it.url);
              if (abs) it.image = abs;
            })
          );
        }

        return items0;
      })
    );

    const flat: OutItem[] = results
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .sort((a, b) => {
        const ta = a.published ? Date.parse(a.published) : 0;
        const tb = b.published ? Date.parse(b.published) : 0;
        return tb - ta;
      })
      .slice(0, limit); // ⟵ VÉGSŐ LIMIT ITT

    return NextResponse.json({ items: flat, sourceCount: feeds.length, limit });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "RSS hiba" }, { status: 500 });
  }
}
