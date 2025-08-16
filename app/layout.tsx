import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

const siteUrl = "https://példa.hu"; // ← IDE ÍRD A SAJÁT DOMAINED!

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bankszámlaszám kereső – MNB adatokkal",
    template: "%s | Bankszámlaszám kereső",
  },
  description:
    "A bankszámlaszám első 8 számjegye alapján megmondjuk a számlavezető bankot és fiókot. Forrás: MNB szűkített hitelesítő tábla.",
  keywords: [
    "bankszámlaszám kereső",
    "bankkód",
    "fiókkód",
    "MNB",
    "BIC",
    "SWIFT",
    "számlaszám első 8 számjegy",
  ],
  authors: [{ name: "Bankszámlaszám kereső" }],
  creator: "Bankszámlaszám kereső",
  publisher: "Bankszámlaszám kereső",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: siteUrl,
    siteName: "Bankszámlaszám kereső",
    title: "Bankszámlaszám kereső – MNB adatokkal",
    description:
      "Add meg az első 8 számjegyet, és kiírjuk a bankot, fiókot és BIC-et. Forrás: MNB.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bankszámlaszám kereső – MNB adatokkal",
    description:
      "A számlaszám első 8 számjegye alapján bank és fiók azonosítás.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  category: "finance",
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#4f46e5" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9221186825330437"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {/* JSON-LD: WebSite + SearchAction */}
        <Script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Bankszámlaszám kereső",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/api/lookup?prefix={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* JSON-LD: Organization */}
        <Script
          id="ld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Bankszámlaszám kereső",
              url: siteUrl,
              logo: `${siteUrl}/opengraph-image`,
              sameAs: [], // ha van közösségi oldal, ide linkek
            }),
          }}
        />

        {/* Központi container – nem lesz teljes szélességű a tartalom */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
