"use client";

import Script from "next/script";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

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
  if (!measurementId) return null;
  const safeMeasurementId = measurementId.trim();

  if (!/^[a-z0-9-]+$/i.test(safeMeasurementId)) return null;

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
