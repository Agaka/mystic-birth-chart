export type AnalyticsValue = string | number | boolean | null | undefined;

export type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function cleanParams(params: AnalyticsParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ) as Record<string, string | number | boolean>;
}

function getGtag() {
  if (typeof window === "undefined") return null;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });

  return window.gtag;
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  const gtag = getGtag();
  if (!gtag) return;

  gtag("event", eventName, cleanParams(params));
}

export function trackPageView(measurementId: string, pagePath: string, pageTitle: string) {
  const gtag = getGtag();
  if (!gtag) return;

  gtag("config", measurementId, {
    page_path: pagePath,
    page_title: pageTitle,
  });
}
