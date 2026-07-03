import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const CONTENT_DIR = path.join(process.cwd(), "src/content/articles");

export interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  date: string;
  author: string;
  readingTime: string;
  featured: boolean;
}

export interface Article extends ArticleMeta {
  content: string;
}

export function getAllArticles(): ArticleMeta[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));

  const articles = files.map((filename) => {
    const filePath = path.join(CONTENT_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const stats = readingTime(content);

    return {
      slug: filename.replace(/\.md$/, ""),
      title: data.title || "",
      excerpt: data.excerpt || "",
      category: data.category || "",
      categorySlug: data.categorySlug || "",
      date: data.date || "",
      author: data.author || "Mystic Birth Chart",
      readingTime: stats.text,
      featured: data.featured || false,
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

  return {
    slug,
    title: data.title || "",
    excerpt: data.excerpt || "",
    category: data.category || "",
    categorySlug: data.categorySlug || "",
    date: data.date || "",
    author: data.author || "Mystic Birth Chart",
    readingTime: stats.text,
    featured: data.featured || false,
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
