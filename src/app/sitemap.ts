import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { categories } from "@/lib/categories";
import { siteConfig } from "@/lib/site";

const STATIC_LAST_MODIFIED = "2026-07-10";

const publicRoutes = [
  "",
  "/about",
  "/blog",
  "/birth-chart-report",
  "/free-birth-chart",
  "/sample-report",
  "/planetary-hours",
  "/editorial-method",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/complete-natal-chart-reading",
  "/love-astrology-reading",
  "/career-astrology-reading",
  "/year-ahead-astrology-reading",
  "/synastry-compatibility-reading",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const staticEntries: MetadataRoute.Sitemap = publicRoutes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency:
      path === "/blog" ? "weekly" : path === "" || path === "/free-birth-chart" ? "weekly" : "monthly",
    priority:
      path === "" ? 1 : path === "/free-birth-chart" ? 0.95 : path === "/birth-chart-report" ? 0.9 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => {
    const latestArticleDate = articles
      .filter((article) => article.categorySlug === category.slug)
      .map((article) => article.updatedDate || article.date)
      .sort()
      .at(-1);

    return {
      url: `${siteConfig.url}/blog/category/${category.slug}`,
      lastModified: latestArticleDate || STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteConfig.url}/blog/${article.slug}`,
    lastModified: article.updatedDate || article.date,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
