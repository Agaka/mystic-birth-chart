import type { EssentialJob, FulfillmentJob, ReadingJobTier } from "./contracts";

interface EssentialStripeSessionData {
  id: string;
  subscription?: string | { id?: string } | null;
  metadata?: Record<string, string> | null;
  customer_details?: {
    name?: string | null;
  } | null;
}

function asTier(value: string | undefined): ReadingJobTier {
  const tiers: ReadingJobTier[] = ["basic", "love", "career", "year-ahead", "synastry", "complete", "kabbalah", "dossier", "almanac"];
  return tiers.includes(value as ReadingJobTier) ? value as ReadingJobTier : "basic";
}

interface SubscriptionRenewalData {
  id: string;
  metadata?: Record<string, string> | null;
}

export function buildFulfillmentJob(session: EssentialStripeSessionData, email: string): FulfillmentJob {
  const metadata = session.metadata || {};
  return {
    orderId: session.id,
    mode: "live",
    tier: asTier(metadata.reading_tier),
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
    notes: metadata.customer_notes || "",
    partnerData: metadata.partner_data || "",
    annual: {
      cycleYear: Number(metadata.annual_cycle_year) || undefined,
      returnCity: metadata.annual_return_city || "",
    },
    forecast: {
      startDate: metadata.forecast_start_date || "",
      presentationTimezone: metadata.presentation_timezone || "",
    },
    subscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id || "",
  };
}

/** Retained for the existing Essential test endpoint and its callers. */
export function buildEssentialJob(session: EssentialStripeSessionData, email: string): EssentialJob {
  const job = buildFulfillmentJob(session, email);
  return { orderId: job.orderId, mode: job.mode, customer: job.customer, birth: job.birth, focus: job.focus };
}

export function buildSubscriptionRenewalJob(subscription: SubscriptionRenewalData, invoiceId: string, email: string): FulfillmentJob {
  const metadata = subscription.metadata || {};
  return {
    orderId: invoiceId,
    mode: "live",
    tier: asTier(metadata.reading_tier),
    customer: { name: metadata.customer_name || "", email },
    birth: { date: metadata.birth_date || "", time: metadata.birth_time || "", city: metadata.birth_city || "" },
    focus: metadata.reading_focus || "general",
    notes: metadata.customer_notes || "",
    partnerData: metadata.partner_data || "",
    annual: { cycleYear: Number(metadata.annual_cycle_year) || undefined, returnCity: metadata.annual_return_city || "" },
    forecast: { startDate: metadata.forecast_start_date || "", presentationTimezone: metadata.presentation_timezone || "" },
    subscriptionId: subscription.id,
  };
}
