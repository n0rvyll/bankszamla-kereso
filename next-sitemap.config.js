/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://bankkereso.nrv.hu",
  generateRobotsTxt: true,
  outDir: "public", // ide készíti a sitemap.xml-t + robots.txt-t
};
