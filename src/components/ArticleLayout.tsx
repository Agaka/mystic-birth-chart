import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { Button } from "@/components/Button";
import { ProductCTA } from "@/components/ProductCTA";
import { getBasicCheckoutUrl } from "@/lib/site";
import type { ArticleMeta } from "@/lib/articles";

interface ArticleLayoutProps {
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  readingTime: string;
  author: string;
  content: string;
  relatedArticles: ArticleMeta[];
}

function renderMarkdown(content: string): string {
  let html = content
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^---$/gm, "<hr />")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, " ");

  html = html.replace(/(<li>.*?<\/li>(?:\s*<\/p><p>\s*<li>.*?<\/li>)*)/g, (match) => {
    return "<ul>" + match.replace(/<\/p><p>/g, "") + "</ul>";
  });

  html = "<p>" + html + "</p>";
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p>\s*(<h[23]>)/g, "$1");
  html = html.replace(/(<\/h[23]>)\s*<\/p>/g, "$1");
  html = html.replace(/<p>\s*(<ul>)/g, "$1");
  html = html.replace(/(<\/ul>)\s*<\/p>/g, "$1");
  html = html.replace(/<p>\s*(<blockquote>)/g, "$1");
  html = html.replace(/(<\/blockquote>)\s*<\/p>/g, "$1");
  html = html.replace(/<p>\s*(<hr \/>)/g, "$1");
  html = html.replace(/(<hr \/>)\s*<\/p>/g, "$1");

  return html;
}

function splitContentForCTA(content: string): [string, string] {
  const lines = content.split("\n");
  const totalLines = lines.length;
  const splitPoint = Math.floor(totalLines * 0.4);

  let actualSplit = splitPoint;
  for (let i = splitPoint; i < totalLines; i++) {
    if (lines[i].trim() === "") {
      actualSplit = i;
      break;
    }
  }

  return [
    lines.slice(0, actualSplit).join("\n"),
    lines.slice(actualSplit).join("\n"),
  ];
}

export function ArticleLayout({
  title,
  excerpt,
  category,
  categorySlug,
  readingTime,
  author,
  content,
  relatedArticles,
}: ArticleLayoutProps) {
  const [firstPart, secondPart] = splitContentForCTA(content);

  return (
    <article>
      <header className="wood-panel py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Link
            href={`/blog/category/${categorySlug}`}
            className="mb-6 inline-block font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold/70 transition-colors hover:text-gold"
          >
            {category}
          </Link>
          <h1 className="font-heading text-3xl font-semibold leading-tight text-ivory md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ivory/55">
            {excerpt}
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 font-ui text-sm text-ivory/35">
            <span>{author}</span>
            <span>/</span>
            <span>{readingTime}</span>
          </div>
        </div>
      </header>

      <div className="reading-area">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <div
            className="article-prose mx-auto"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(firstPart) }}
          />

          <div className="my-10 border border-gold/25 bg-white/28 p-5 md:p-6">
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark/80">
              Reader path
            </p>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <Link
                href="/free-birth-chart"
                className="border border-gold/22 px-4 py-3 font-ui font-semibold text-aubergine transition-colors hover:border-gold hover:bg-gold/10"
              >
                Calculate your free snapshot
              </Link>
              <Link
                href="/sample-report"
                className="border border-gold/22 px-4 py-3 font-ui font-semibold text-aubergine transition-colors hover:border-gold hover:bg-gold/10"
              >
                Read a sample report
              </Link>
              <Link
                href="/birth-chart-report"
                className="border border-gold/22 px-4 py-3 font-ui font-semibold text-aubergine transition-colors hover:border-gold hover:bg-gold/10"
              >
                Compare readings
              </Link>
            </div>
          </div>

          <div className="my-12 md:my-16">
            <ProductCTA compact />
          </div>

          <div
            className="article-prose mx-auto"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(secondPart) }}
          />

          <div className="mt-16 border-t border-gold/20 pt-12 text-center">
            <h3 className="font-heading text-2xl font-medium text-aubergine md:text-3xl">
              Ready to read your own chart?
            </h3>
            <p className="mt-4 leading-relaxed text-ink/55">
              Order a natal reading that connects your placements into one
              coherent story.
            </p>
            <div className="mt-8">
              <Button
                href={getBasicCheckoutUrl()}
                size="lg"
                analytics={{
                  event: "cta_click",
                  params: {
                    cta_label: "Order Your Birth Chart Reading",
                    cta_location: "article_final_cta",
                    offer_tier: "basic",
                  },
                }}
              >
                Order Your Birth Chart Reading
              </Button>
            </div>
          </div>
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <section className="bg-midnight py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-12 text-center font-heading text-2xl font-medium text-ivory md:text-3xl">
              Continue studying
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((article) => (
                <ArticleCard key={article.slug} {...article} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
