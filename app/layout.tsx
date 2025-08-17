import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

const siteUrl = "https://sajatdomain.hu";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bankszámlaszám kereső – MNB adatokkal",
    template: "%s | Bankszámlaszám kereső",
  },
  // 🔑 Ez a legfontosabb a Lighthouse miatt
  description:
    "Bankszámlaszám kereső: az első 8 számjegy alapján megtudhatod, melyik bank és fiók vezeti a számlát. Forrás: MNB hivatalos adatok.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: siteUrl,
    siteName: "Bankszámlaszám kereső",
    title: "Bankszámlaszám kereső – MNB adatokkal",
    description:
      "Keresd meg könnyen a bankodat a számlaszám első 8 számjegye alapján. Forrás: MNB.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bankszámlaszám kereső – MNB adatokkal",
    description:
      "Gyors bank- és fiókazonosítás számlaszám alapján. Forrás: MNB.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
