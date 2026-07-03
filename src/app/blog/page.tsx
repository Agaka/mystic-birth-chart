import type { Metadata } from "next";
import Link from "next/link";
import { BlogGrid } from "@/components/BlogGrid";
import { SidebarCTA } from "@/components/SidebarCTA";
import { getAllArticles, getFeaturedArticles } from "@/lib/articles";
import { categories } from "@/lib/categories";

export const metadata: Metadata = {
  title: "The Astrology Reading Room",
  description:
    "Traditional-first astrology essays on natal charts, houses, rulers, Venus, Saturn, emotional patterns, vocation, and chart synthesis.",
};

export default function BlogPage() {
  const allArticles = getAllArticles();
  const featuredArticle = getFeaturedArticles()[0];

  return (
    <>
      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
            The reading room
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            Essays from the chart table.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ivory/58">
            Astrology writing for readers who want the chart treated as a whole:
            planets, houses, rulers, aspects, temperament, and lived patterns.
          </p>
        </div>
      </section>

      <section className="border-b border-ivory/8 bg-ink py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/blog"
              className="border border-gold/30 bg-gold/12 px-4 py-2 font-ui text-sm text-gold transition-colors hover:bg-gold/18"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className="border border-ivory/12 px-4 py-2 font-ui text-sm text-ivory/55 transition-colors hover:border-gold/25 hover:text-gold"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-midnight py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-12">
            <div>
              {featuredArticle && (
                <div className="mb-12">
                  <p className="mb-6 font-ui text-xs uppercase tracking-[0.2em] text-gold/60">
                    Featured study
                  </p>
                  <Link
                    href={`/blog/${featuredArticle.slug}`}
                    className="group block border border-ivory/10 bg-midnight-light/55 p-8 transition-all hover:border-gold/30 hover:bg-aubergine/25 md:p-10"
                  >
                    <span className="font-ui text-xs uppercase tracking-widest text-gold/60">
                      {featuredArticle.category}
                    </span>
                    <h2 className="mt-3 font-heading text-2xl font-semibold text-ivory transition-colors group-hover:text-gold md:text-3xl lg:text-4xl">
                      {featuredArticle.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ivory/52">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="mt-6 flex items-center gap-3 font-ui text-sm text-ivory/35">
                      <span>{featuredArticle.readingTime}</span>
                      <span>/</span>
                      <span>{featuredArticle.author}</span>
                    </div>
                  </Link>
                </div>
              )}

              <BlogGrid articles={allArticles} />
            </div>

            <aside className="mt-12 hidden lg:mt-0 lg:block">
              <SidebarCTA />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
