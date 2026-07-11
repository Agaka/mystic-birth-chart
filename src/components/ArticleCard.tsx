import Link from "next/link";

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  readingTime: string;
  featured?: boolean;
}

export function ArticleCard({
  slug,
  title,
  excerpt,
  category,
  categorySlug,
  readingTime,
  featured = false,
}: ArticleCardProps) {
  return (
    <article
      className={`wood-grain group relative border border-gold/18 p-6 transition-all duration-300 hover:border-gold/36 hover:shadow-[0_16px_38px_rgba(0,0,0,0.22)] md:p-8 ${
        featured ? "md:col-span-2 lg:col-span-3" : ""
      }`}
    >
      <Link
        href={`/blog/category/${categorySlug}`}
        className="mb-3 inline-flex min-h-6 items-center font-ui text-xs font-semibold uppercase tracking-widest text-gold-light transition-colors hover:text-gold"
      >
        {category}
      </Link>

      <h3
        className={`font-heading font-semibold leading-tight text-ivory transition-colors group-hover:text-gold ${
          featured ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
        }`}
      >
        <Link href={`/blog/${slug}`} className="after:absolute after:inset-0">
          {title}
        </Link>
      </h3>

      <p
        className={`mt-3 leading-relaxed text-ivory/68 ${
          featured ? "max-w-2xl text-base md:text-lg" : "text-sm md:text-base"
        }`}
      >
        {excerpt}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <span className="font-ui text-xs text-ivory/35">{readingTime}</span>
        <span className="text-ivory/25">/</span>
        <span className="font-ui text-xs text-ivory/35">
          Mystic Birth Chart
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/0 to-transparent transition-all duration-500 group-hover:via-gold/30" />
    </article>
  );
}
