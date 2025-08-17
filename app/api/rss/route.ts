import { NextResponse } from "next/server";
import Parser from "rss-parser";

type FeedItem = {
  title?: string;
  link?: string;
  contentSnippet?: string;
  isoDate?: string;
  enclosure?: { url?: string };
  "media:thumbnail"?: { $?: { url?: string } };
  "media:content"?: { $?: { url?: string } };
  "itunes:image"?: { href?: string };
  image?: { url?: string };
};

export async function GET() {
  try {
    const parser = new Parser<unknown, FeedItem>();
    const feed = await parser.parseURL("https://telex.hu/rss/");

    const items = feed.items.map((i) => {
      const imageUrl =
        i.enclosure?.url ||
        (i["media:thumbnail"] as { $?: { url?: string } } | undefined)?.$
          ?.url ||
        (i["media:content"] as { $?: { url?: string } } | undefined)?.$?.url ||
        (i["itunes:image"] as { href?: string } | undefined)?.href ||
        (i.image as { url?: string } | undefined)?.url;

      return {
        title: i.title ?? "",
        link: i.link ?? "",
        snippet: i.contentSnippet ?? "",
        date: i.isoDate ?? "",
        image: imageUrl ?? "",
      };
    });

    return NextResponse.json({ items });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error)?.message ?? "Ismeretlen hiba" },
      { status: 500 }
    );
  }
}
