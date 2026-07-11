export type AnalyticsValue = string | number | boolean | null | undefined;

export type AnalyticsParams = Record<string, AnalyticsValue>;

const allowedParamKeys = new Set([
  "page",
  "product_id",
  "product_category",
  "funnel_step",
  "experiment_variant",
  "cta_location",
  "utm_source",
  "utm_medium",
  "utm_campaign",
]);

const attributionStorageKey = "mysticBirthChartAttribution";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function cleanParams(params: AnalyticsParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([key, value]) =>
        allowedParamKeys.has(key) &&
        value !== undefined &&
        value !== null &&
        value !== "",
    ),
  ) as Record<string, string | number | boolean>;
}

function getAttribution(): AnalyticsParams {
  if (typeof window === "undefined") return {};

  const current = new URLSearchParams(window.location.search);
  const attribution = {
    utm_source: current.get("utm_source") || undefined,
    utm_medium: current.get("utm_medium") || undefined,
    utm_campaign: current.get("utm_campaign") || undefined,
  };

  if (attribution.utm_source || attribution.utm_medium || attribution.utm_campaign) {
    try {
      window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(attribution));
    } catch {
      // Analytics attribution is optional and must never block the page.
    }
    return attribution;
  }

  try {
    const stored = window.sessionStorage.getItem(attributionStorageKey);
    return stored ? (JSON.parse(stored) as AnalyticsParams) : {};
  } catch {
    return {};
  }
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

  gtag(
    "event",
    eventName,
    cleanParams({
      page: window.location.pathname,
      ...getAttribution(),
      ...params,
    }),
  );
}

export function trackPageView(measurementId: string, pagePath: string, pageTitle: string) {
  const gtag = getGtag();
  if (!gtag) return;

  gtag("config", measurementId, {
    page_path: pagePath,
    page_title: pageTitle,
  });
}
