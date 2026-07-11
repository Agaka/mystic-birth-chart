"use client";

import { useEffect, useRef } from "react";
import { trackEvent, type AnalyticsParams } from "@/lib/analytics";

export function AnalyticsEvent({
  name,
  params = {},
}: {
  name: string;
  params?: AnalyticsParams;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(name, params);
  }, [name, params]);

  return null;
}
