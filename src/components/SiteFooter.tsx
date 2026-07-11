"use client";

import {
  IconBrandInstagram,
  IconBrandPinterest,
  IconBrandYoutube,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/checkout/") || pathname === "/thank-you") {
    return null;
  }

  const socialLinks = [
    {
      label: "Instagram",
      href: siteConfig.social.instagram,
      icon: IconBrandInstagram,
    },
    {
      label: "Pinterest",
      href: siteConfig.social.pinterest,
      icon: IconBrandPinterest,
    },
    {
      label: "YouTube",
      href: siteConfig.social.youtube,
      icon: IconBrandYoutube,
    },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="border-t border-gold/15 bg-ink">
      <div className="gold-divider" />

      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center font-heading text-2xl font-semibold text-ivory transition-colors hover:text-gold"
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
                    className="inline-flex min-h-6 items-center font-ui text-sm text-ivory/60 transition-colors hover:text-ivory"
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
                    className="inline-flex min-h-6 items-center font-ui text-sm text-ivory/60 transition-colors hover:text-ivory"
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
              Essential readings are generated automatically and delivered by
              email. Complete readings are individually prepared and reviewed
              in a limited daily queue.
            </p>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="mt-4 inline-flex min-h-6 items-center font-ui text-sm text-ivory/60 underline decoration-gold/45 underline-offset-4 transition-colors hover:text-ivory"
            >
              {siteConfig.supportEmail}
            </a>
            <ul className="mt-5 space-y-3">
              {siteConfig.nav.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-6 items-center font-ui text-sm text-ivory/60 transition-colors hover:text-ivory"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            {siteConfig.nav.tools.length > 0 && (
              <ul className="mt-5 space-y-3 border-t border-ivory/10 pt-5">
                {siteConfig.nav.tools.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="inline-flex min-h-6 items-center font-ui text-sm text-ivory/60 transition-colors hover:text-ivory"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {socialLinks.length > 0 && (
              <div className="mt-6 flex items-center gap-2" aria-label="Social profiles">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Mystic Birth Chart on ${label}`}
                    className="flex h-11 w-11 items-center justify-center border border-ivory/12 text-ivory/55 transition-colors hover:border-gold/35 hover:text-gold"
                  >
                    <Icon aria-hidden="true" className="h-5 w-5" stroke={1.7} />
                  </a>
                ))}
              </div>
            )}
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
