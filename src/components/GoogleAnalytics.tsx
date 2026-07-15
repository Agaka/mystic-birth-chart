"use client";

import Script from "next/script";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";
import {
  analyticsConsentChangedEvent,
  readAnalyticsConsent,
} from "@/lib/analyticsConsent";

interface GoogleAnalyticsProps {
  measurementId?: string;
}

function PageViewTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const safeSearchParams = new URLSearchParams();
    for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
      const value = searchParams.get(key);
      if (value) safeSearchParams.set(key, value);
    }
    const queryString = safeSearchParams.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;
    trackPageView(measurementId, pagePath, document.title);
  }, [measurementId, pathname, searchParams]);

  return null;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const syncConsent = () => setAnalyticsAllowed(readAnalyticsConsent() === "granted");
    syncConsent();
    window.addEventListener(analyticsConsentChangedEvent, syncConsent);
    return () => window.removeEventListener(analyticsConsentChangedEvent, syncConsent);
  }, []);

  if (!measurementId) return null;
  const safeMeasurementId = measurementId.trim();

  if (!analyticsAllowed || !/^[a-z0-9-]+$/i.test(safeMeasurementId)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${safeMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'analytics_storage': 'granted',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
          });
          gtag('js', new Date());
          gtag('config', '${safeMeasurementId}', { send_page_view: false });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker measurementId={safeMeasurementId} />
      </Suspense>
    </>
  );
}
