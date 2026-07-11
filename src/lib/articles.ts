import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { categories } from "@/lib/categories";
import { siteConfig } from "@/lib/site";

const CONTENT_DIR = path.join(process.cwd(), "src/content/articles");

export interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  date: string;
  updatedDate: string;
  author: string;
  readingTime: string;
  featured: boolean;
}

export interface Article extends ArticleMeta {
  content: string;
}

function normalizedArticleData(data: Record<string, unknown>) {
  const rawCategory = String(data.category || "Chart Basics");
  const matchingCategory = categories.find(
    (category) =>
      category.slug === String(data.categorySlug || rawCategory).toLowerCase() ||
      category.name.toLowerCase() === rawCategory.toLowerCase(),
  );
  const date = String(data.date || "2026-07-10");

  return {
    title: String(data.title || ""),
    excerpt: String(data.excerpt || data.description || ""),
    category: matchingCategory?.name || rawCategory,
    categorySlug:
      matchingCategory?.slug || String(data.categorySlug || "chart-basics"),
    date,
    updatedDate: String(data.updated || data.dateModified || date),
    author: siteConfig.editorialName,
    featured: Boolean(data.featured),
  };
}

export function getAllArticles(): ArticleMeta[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));

  const articles = files.map((filename) => {
    const filePath = path.join(CONTENT_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const stats = readingTime(content);
    const normalized = normalizedArticleData(data);

    return {
      slug: filename.replace(/\.md$/, ""),
      ...normalized,
      readingTime: stats.text,
    } as ArticleMeta;
  });

  return articles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);
  const normalized = normalizedArticleData(data);

  return {
    slug,
    ...normalized,
    readingTime: stats.text,
    content,
  };
}

export function getArticlesByCategory(categorySlug: string): ArticleMeta[] {
  return getAllArticles().filter((a) => a.categorySlug === categorySlug);
}

export function getFeaturedArticles(): ArticleMeta[] {
  return getAllArticles().filter((a) => a.featured);
}

export function getRelatedArticles(
  currentSlug: string,
  categorySlug: string,
  limit = 3
): ArticleMeta[] {
  return getAllArticles()
    .filter((a) => a.slug !== currentSlug)
    .sort((a, b) => {
      if (a.categorySlug === categorySlug && b.categorySlug !== categorySlug)
        return -1;
      if (b.categorySlug === categorySlug && a.categorySlug !== categorySlug)
        return 1;
      return 0;
    })
    .slice(0, limit);
}
