"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Article = {
  title: string;
  link: string;
  snippet: string;
  date: string;
  image: string;
};

export default function ArticleTeasers() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/rss");
      const data = await res.json();
      setArticles(data.items);
    }
    load();
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {articles.slice(0, 4).map((a, i) => (
        <a
          key={i}
          href={a.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group block overflow-hidden rounded-lg shadow hover:shadow-lg transition"
        >
          <div className="relative aspect-video">
            {a.image && (
              <Image
                unoptimized
                src={a.image}
                alt={a.title}
                fill
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold group-hover:underline">
              {a.title}
            </h3>
          </div>
        </a>
      ))}
    </div>
  );
}
