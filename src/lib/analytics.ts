export type AnalyticsItem = {
  item_id?: string;
  item_name?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
};

export type AnalyticsValue = string | number | boolean | null | undefined | AnalyticsItem[];

export type AnalyticsParams = Record<string, AnalyticsValue>;

const allowedParamKeys = new Set([
  "page",
  "product_id",
  "product_category",
  "funnel_step",
  "experiment_variant",
  "cta_location",
  "delivery_method",
  "value",
  "currency",
  "transaction_id",
  "items",
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

function cleanItems(value: AnalyticsValue): AnalyticsItem[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const items = value
    .map(({ item_id, item_name, item_category, price, quantity }) => ({
      ...(item_id ? { item_id } : {}),
      ...(item_name ? { item_name } : {}),
      ...(item_category ? { item_category } : {}),
      ...(typeof price === "number" ? { price } : {}),
      ...(typeof quantity === "number" ? { quantity } : {}),
    }))
    .filter((item) => item.item_id || item.item_name);

  return items.length > 0 ? items : undefined;
}

function cleanParams(params: AnalyticsParams): Record<string, string | number | boolean | AnalyticsItem[]> {
  const cleaned: Record<string, string | number | boolean | AnalyticsItem[]> = {};

  for (const [key, value] of Object.entries(params)) {
    if (!allowedParamKeys.has(key)) continue;

    if (key === "items") {
      const items = cleanItems(value);
      if (items) cleaned[key] = items;
      continue;
    }

    if (value === undefined || value === null || value === "" || Array.isArray(value)) continue;
    cleaned[key] = value;
  }

  return cleaned;
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
