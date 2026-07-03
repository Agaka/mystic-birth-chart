"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/Button";
import { siteConfig, getCheckoutUrl } from "@/lib/site";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gold/15 bg-ink/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link
          href="/"
          className="font-heading text-xl font-semibold text-ivory transition-colors hover:text-gold md:text-2xl"
        >
          Mystic Birth Chart
        </Link>

        <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
          {siteConfig.nav.header.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-ui text-sm text-ivory/68 transition-colors hover:text-ivory"
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
                cta_label: siteConfig.cta.primary,
                cta_location: "desktop_header",
              },
            }}
          >
            {siteConfig.cta.primary}
          </Button>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span
            className={`block h-0.5 w-6 bg-ivory transition-all duration-300 ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-ivory transition-all duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-ivory transition-all duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {mobileOpen && (
        <nav
          className="animate-fade-in border-t border-gold/15 bg-ink/96 backdrop-blur-md lg:hidden"
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
                    cta_label: siteConfig.cta.primary,
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
