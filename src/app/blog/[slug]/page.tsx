import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/ArticleLayout";
import {
  getAllArticles,
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/articles";
import { siteConfig } from "@/lib/site";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      url: `/blog/${slug}`,
      publishedTime: article.date,
      authors: [article.author],
      images: [
        {
          url: "/images/birth-chart-reading-hero.png",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const relatedArticles = getRelatedArticles(slug, article.categorySlug, 3);

  const articleUrl = `${siteConfig.url}/blog/${slug}`;
  const imageUrl = `${siteConfig.url}/images/birth-chart-reading-hero.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: [imageUrl],
    author: {
      "@type": "Organization",
      name: article.author,
      url: `${siteConfig.url}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: articleUrl,
    url: articleUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ArticleLayout
        title={article.title}
        excerpt={article.excerpt}
        category={article.category}
        categorySlug={article.categorySlug}
        readingTime={article.readingTime}
        author={article.author}
        content={article.content}
        relatedArticles={relatedArticles}
      />
    </>
  );
}
