import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
import { siteConfig } from "@/lib/site";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${siteConfig.url}${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="font-ui text-xs text-ivory/50">
        <ol className="flex flex-wrap items-center justify-center gap-2">
          {items.map((item, index) => {
            const current = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-2">
                {current ? (
                  <span aria-current="page" className="text-ivory/70">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                )}
                {!current && (
                  <IconChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-gold/45" stroke={1.7} />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
