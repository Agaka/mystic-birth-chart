import type { EssentialJob } from "./contracts";

interface EssentialStripeSessionData {
  id: string;
  metadata?: Record<string, string> | null;
  customer_details?: {
    name?: string | null;
  } | null;
}

export function buildEssentialJob(session: EssentialStripeSessionData, email: string): EssentialJob {
  const metadata = session.metadata || {};
  return {
    orderId: session.id,
    mode: "live",
    customer: {
      name: metadata.customer_name || session.customer_details?.name || "",
      email,
    },
    birth: {
      date: metadata.birth_date || "",
      time: metadata.birth_time || "",
      city: metadata.birth_city || "",
    },
    focus: metadata.reading_focus || "general",
  };
}
