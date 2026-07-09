"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface StickyMobileCTAProps {
  href: string;
  label?: string;
  price?: string;
  showAfterPx?: number;
}

export function StickyMobileCTA({
  href,
  label = "Get Your Reading",
  price = "$17",
  showAfterPx = 500,
}: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > showAfterPx);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfterPx]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-ink/96 px-4 pb-[env(safe-area-inset-bottom,8px)] pt-3 backdrop-blur-lg transition-all duration-400 lg:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <Link
        href={href}
        onClick={() =>
          trackEvent("sticky_cta_clicked", {
            cta_label: label,
            cta_location: "sticky_mobile_bar",
          })
        }
        className="flex w-full items-center justify-center gap-2 bg-gold px-6 py-3.5 font-[family-name:var(--font-ui)] text-sm font-semibold tracking-wide text-ink shadow-[0_8px_28px_rgba(201,164,92,0.28)] transition-all duration-300 hover:bg-gold-light active:scale-[0.98]"
      >
        {label}
        <span className="rounded-[3px] bg-ink/15 px-2 py-0.5 text-xs font-bold">
          {price}
        </span>
      </Link>
    </div>
  );
}
