export default function robots() {
  const base = "https://példa.hu"; // ← domain
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}