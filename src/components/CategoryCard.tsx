import Link from "next/link";

interface CategoryCardProps {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export function CategoryCard({
  name,
  slug,
  description,
  icon,
}: CategoryCardProps) {
  return (
    <Link
      href={`/blog/category/${slug}`}
      className="wood-grain block group relative border border-gold/18 p-7 transition-all duration-300 hover:border-gold/34 hover:shadow-[0_16px_38px_rgba(0,0,0,0.22)]"
    >
      <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
        Study {icon}
      </span>

      <h3 className="mt-4 font-heading text-2xl font-semibold leading-tight text-ivory transition-colors group-hover:text-gold">
        {name}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-ivory/68">
        {description}
      </p>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/0 to-transparent transition-all duration-500 group-hover:via-gold/30" />
    </Link>
  );
}
