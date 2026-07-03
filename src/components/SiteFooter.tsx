import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-gold/15 bg-ink">
      <div className="gold-divider" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="font-heading text-2xl font-semibold text-ivory transition-colors hover:text-gold"
            >
              Mystic Birth Chart
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/50">
              A traditional-first astrology journal and reading studio for
              people who want their natal chart interpreted with depth,
              restraint, and practical synthesis.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-ui text-xs font-semibold uppercase tracking-widest text-gold/80">
              Navigation
            </h4>
            <ul className="space-y-3">
              {siteConfig.nav.header.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-ui text-sm text-ivory/60 transition-colors hover:text-ivory"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-ui text-xs font-semibold uppercase tracking-widest text-gold/80">
              Study Topics
            </h4>
            <ul className="space-y-3">
              {siteConfig.nav.categories.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-ui text-sm text-ivory/60 transition-colors hover:text-ivory"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-ui text-xs font-semibold uppercase tracking-widest text-gold/80">
              Studio Notes
            </h4>
            <p className="text-sm leading-relaxed text-ivory/50">
              Readings are prepared in a limited daily queue so each chart can
              be synthesized carefully.
            </p>
            <ul className="mt-5 space-y-3">
              {siteConfig.nav.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-ui text-sm text-ivory/60 transition-colors hover:text-ivory"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-ivory/10 pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-ivory/35">
            {siteConfig.disclaimer}
          </p>
        </div>

        <div className="mt-6">
          <p className="font-ui text-xs text-ivory/25">
            Copyright {new Date().getFullYear()} Mystic Birth Chart. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
