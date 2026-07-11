import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogGrid } from "@/components/BlogGrid";
import { SidebarCTA } from "@/components/SidebarCTA";
import { getArticlesByCategory } from "@/lib/articles";
import { categories, getCategoryBySlug } from "@/lib/categories";
import { createPageMetadata } from "@/lib/metadata";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return {};

  return createPageMetadata({
    title: category.name,
    description: category.description,
    path: `/blog/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) notFound();

  const articles = getArticlesByCategory(categorySlug);

  return (
    <>
      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="mb-4 block font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
            Study {category.icon}
          </span>
          <h1 className="font-heading text-4xl font-semibold text-ivory md:text-6xl">
            {category.name}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ivory/58">
            {category.description}
          </p>
        </div>
      </section>

      <section className="bg-midnight py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-12">
            <div>
              {articles.length > 0 ? (
                <BlogGrid articles={articles} />
              ) : (
                <p className="py-12 text-center font-ui text-ivory/40">
                  Articles coming soon.
                </p>
              )}
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
