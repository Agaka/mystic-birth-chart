import { ArticleCard } from "@/components/ArticleCard";

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  readingTime: string;
}

interface BlogGridProps {
  articles: Article[];
  featured?: boolean;
}

export function BlogGrid({ articles, featured = false }: BlogGridProps) {
  if (articles.length === 0) {
    return (
      <p className="text-center text-ivory/40 py-12 font-ui">
        No articles found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, i) => (
        <ArticleCard
          key={article.slug}
          {...article}
          featured={featured && i === 0}
        />
      ))}
    </div>
  );
}
