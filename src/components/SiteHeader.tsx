"use client";

import Link from "next/link";
import { IconArrowLeft, IconLock, IconMenu2, IconX } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { siteConfig, getCheckoutUrl } from "@/lib/site";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isCheckout = pathname.startsWith("/checkout/") || pathname === "/thank-you";

  if (isCheckout) {
    return (
      <header className="sticky top-0 z-50 border-b border-gold/15 bg-ink/96 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 md:px-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-heading text-xl font-semibold text-ivory transition-colors hover:text-gold md:text-2xl"
          >
            Mystic Birth Chart
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/birth-chart-report"
              className="inline-flex min-h-11 items-center gap-2 px-2 font-ui text-xs font-semibold text-ivory/65 transition-colors hover:text-ivory sm:text-sm"
            >
              <IconArrowLeft aria-hidden="true" className="h-4 w-4" stroke={1.8} />
              <span className="hidden sm:inline">Back to readings</span>
              <span className="sm:hidden">Readings</span>
            </Link>
            <span className="hidden items-center gap-2 border-l border-ivory/12 pl-4 font-ui text-xs uppercase tracking-[0.12em] text-gold/70 md:inline-flex">
              <IconLock aria-hidden="true" className="h-4 w-4" stroke={1.8} />
              Secure checkout
            </span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gold/15 bg-ink/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-heading text-xl font-semibold text-ivory transition-colors hover:text-gold md:text-2xl"
        >
          Mystic Birth Chart
        </Link>

        <nav className="hidden xl:flex items-center gap-6" aria-label="Main navigation">
          {siteConfig.nav.header.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center font-ui text-sm text-ivory/68 transition-colors hover:text-ivory"
            >
              {item.label}
            </Link>
          ))}
          <Button
            href={getCheckoutUrl()}
            size="sm"
            analytics={{
              event: "cta_click",
              params: {
                cta_location: "desktop_header",
              },
            }}
          >
            {siteConfig.cta.primary}
          </Button>
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-11 w-11 items-center justify-center text-ivory transition-colors hover:text-gold xl:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? (
            <IconX aria-hidden="true" className="h-7 w-7" stroke={1.6} />
          ) : (
            <IconMenu2 aria-hidden="true" className="h-7 w-7" stroke={1.6} />
          )}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          className="animate-fade-in border-t border-gold/15 bg-ink/96 backdrop-blur-md xl:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col gap-4">
            {siteConfig.nav.header.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 font-ui text-base text-ivory/80 transition-colors hover:text-ivory"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2">
              <Button
                href={getCheckoutUrl()}
                size="md"
                className="w-full"
                analytics={{
                  event: "cta_click",
                  params: {
                    cta_location: "mobile_header",
                  },
                }}
              >
                {siteConfig.cta.primary}
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
