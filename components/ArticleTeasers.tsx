// components/ArticleTeasers.tsx
"use client";

import { useEffect, useState } from "react";

type Item = {
  title: string;
  url: string;
  source: string;
  published?: string;
  excerpt?: string;
  image?: string;
};

export default function ArticleTeasers() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/rss", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setItems(data.items || []);
      })
      .catch(() => {
        if (!alive) return;
        setErr("Nem sikerült betölteni a cikkajánlókat.");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="glass rounded-2xl border border-white/30 dark:border-white/10 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold">Cikkajánló</h2>
        <span className="text-xs text-slate-500 dark:text-slate-400">RSS forrásokból</span>
      </div>

      {/* Skeleton */}
      {!items && !err && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-28 rounded skeleton" />
          <div className="h-28 rounded skeleton" />
          <div className="h-28 rounded skeleton" />
          <div className="h-28 rounded skeleton" />
        </div>
      )}

      {/* Hiba */}
      {err && (
        <div className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300/40 dark:border-amber-900/30 rounded p-3">
          {err}
        </div>
      )}

      {/* Lista – nagyobb kártyák felső, 16:9 borítóképpel */}
      {items && items.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((it, idx) => (
            <li
              key={idx}
              className="rounded-xl border border-white/40 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 overflow-hidden hover:shadow transition"
            >
              <a href={it.url} target="_blank" rel="noopener nofollow" className="block">
                {/* KÉPBLOKK — 16:9, no-referrer, placeholder hibánál */}
                <div className="relative w-full aspect-[16/9] bg-white/40 dark:bg-slate-800/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {it.image ? (
                    <img
                      src={it.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/placeholder-news.jpg";
                      }}
                    />
                  ) : (
                    // ha eleve nincs image
                    <img
                      src="/placeholder-news.jpg"
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Szöveges rész */}
                <div className="p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">{it.source}</div>
                  <div className="mt-1 font-medium leading-snug line-clamp-2">{it.title}</div>
                  {it.published && (
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {new Intl.DateTimeFormat("hu-HU", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(it.published))}
                    </div>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
