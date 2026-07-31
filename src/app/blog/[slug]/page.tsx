import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLayout } from "@/components/ArticleLayout";
import {
  getAllArticles,
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/articles";
import { socialImage } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const revalidate = 900;

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
      publishedTime: article.publishAt,
      modifiedTime: article.updatedDate,
      authors: [article.author],
      images: [{ ...socialImage, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [socialImage.url],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const relatedArticles = getRelatedArticles(slug, article.categorySlug, 3);

  const articleUrl = `${siteConfig.url}/blog/${slug}`;
  const imageUrl = `${siteConfig.url}/images/birth-chart-reading-hero.webp`;

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
    datePublished: article.publishAt,
    dateModified: article.updatedDate,
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
        slug={article.slug}
        title={article.title}
        excerpt={article.excerpt}
        category={article.category}
        categorySlug={article.categorySlug}
        readingTime={article.readingTime}
        author={article.author}
        date={article.date}
        updatedDate={article.updatedDate}
        content={article.content}
        relatedArticles={relatedArticles}
      />
    </>
  );
}
