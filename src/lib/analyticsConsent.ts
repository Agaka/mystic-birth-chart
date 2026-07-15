export type AnalyticsConsent = "granted" | "denied";

export const analyticsConsentStorageKey = "mysticAnalyticsConsent";
export const analyticsConsentChangedEvent = "mystic-analytics-consent-changed";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(analyticsConsentStorageKey);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function updateAnalyticsConsent(choice: AnalyticsConsent) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(analyticsConsentStorageKey, choice);
  } catch {
    // Consent storage is optional; the current-page choice still applies.
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));
  window.gtag("consent", "update", {
    analytics_storage: choice,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.dispatchEvent(new Event(analyticsConsentChangedEvent));
}
