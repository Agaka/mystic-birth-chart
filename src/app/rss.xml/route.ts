import { getAllArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/site";

export const revalidate = 900;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = getAllArticles();
  const items = articles
    .map(
      (article) => `
        <item>
          <title>${escapeXml(article.title)}</title>
          <link>${siteConfig.url}/blog/${article.slug}</link>
          <guid isPermaLink="true">${siteConfig.url}/blog/${article.slug}</guid>
          <description>${escapeXml(article.excerpt)}</description>
          <category>${escapeXml(article.category)}</category>
          <dc:creator>${escapeXml(siteConfig.editorialName)}</dc:creator>
          <pubDate>${new Date(article.publishAt).toUTCString()}</pubDate>
        </item>
      `,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <channel>
        <title>${escapeXml(siteConfig.name)} - The Reading Room</title>
        <link>${siteConfig.url}/blog</link>
        <description>${escapeXml(siteConfig.description)}</description>
        <language>en-US</language>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
