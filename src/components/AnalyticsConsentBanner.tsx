"use client";

import { useSyncExternalStore } from "react";
import {
  analyticsConsentChangedEvent,
  readAnalyticsConsent,
  updateAnalyticsConsent,
} from "@/lib/analyticsConsent";

function subscribeToAnalyticsConsent(callback: () => void) {
  window.addEventListener(analyticsConsentChangedEvent, callback);
  return () => window.removeEventListener(analyticsConsentChangedEvent, callback);
}

function getServerAnalyticsConsent() {
  return null;
}

export function AnalyticsConsentBanner() {
  const consent = useSyncExternalStore(
    subscribeToAnalyticsConsent,
    readAnalyticsConsent,
    getServerAnalyticsConsent,
  );

  if (consent !== null) return null;

  return (
    <aside
      className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-xl border border-gold/30 bg-ink p-5 text-ivory shadow-[0_20px_65px_rgba(0,0,0,0.45)] sm:inset-x-6"
      aria-label="Analytics privacy choice"
    >
      <p className="font-heading text-2xl font-semibold">A quieter way to measure the study.</p>
      <p className="mt-2 text-sm leading-relaxed text-ivory/68">
        Allow anonymous analytics so we can improve the reading experience. Payments and essential site functions work either way. Read our{" "}
        <a href="/privacy" className="text-gold-light underline underline-offset-4">privacy policy</a>.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="min-h-11 border border-ivory/22 px-4 py-2 font-ui text-sm font-semibold text-ivory hover:border-gold/60"
          onClick={() => {
            updateAnalyticsConsent("denied");
          }}
        >
          Essential only
        </button>
        <button
          type="button"
          className="min-h-11 bg-gold px-4 py-2 font-ui text-sm font-semibold text-ink hover:bg-gold-light"
          onClick={() => {
            updateAnalyticsConsent("granted");
          }}
        >
          Allow analytics
        </button>
      </div>
    </aside>
  );
}
