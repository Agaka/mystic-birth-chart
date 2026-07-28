import Stripe from "stripe";
import { NextResponse } from "next/server";
import { dispatchReportJob } from "@/lib/essential/dispatch";
import { buildFulfillmentJob, buildSubscriptionRenewalJob } from "@/lib/essential/job";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secretKey || !webhookSecret || !signature) {
    return NextResponse.json({ message: "Stripe webhook is not configured." }, { status: 503 });
  }
  let event: Stripe.Event;
  try {
    const stripe = new Stripe(secretKey);
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ message: "Invalid webhook signature." }, { status: 400 });
  }
  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const parent = invoice.parent as { subscription_details?: { subscription?: string | Stripe.Subscription } } | null;
    const subscriptionRef = parent?.subscription_details?.subscription;
    const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
    const email = String(invoice.customer_email || "").toLowerCase();
    if (!subscriptionId || !email) return NextResponse.json({ received: true, ignored: "invoice-without-subscription" });
    try {
      const stripe = new Stripe(secretKey);
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.metadata.reading_tier !== "almanac") return NextResponse.json({ received: true, ignored: "non-almanac-invoice" });
      await dispatchReportJob(buildSubscriptionRenewalJob(subscription, invoice.id, email));
      return NextResponse.json({ received: true, dispatched: true, tier: "almanac", renewal: true });
    } catch {
      return NextResponse.json({ message: "Almanac renewal dispatch failed and Stripe should retry." }, { status: 500 });
    }
  }

  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return NextResponse.json({ received: true });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata || {};
  const email = String(session.customer_details?.email || session.customer_email || "").toLowerCase();
  const tier = metadata.reading_tier || session.client_reference_id || "";
  // Stripe's invoice.paid event is the single delivery trigger for subscriptions,
  // including the first paid month. This prevents a duplicate first Almanac.
  if (tier === "almanac") return NextResponse.json({ received: true, awaitingInvoice: true });
  try {
    await dispatchReportJob(buildFulfillmentJob(session, email));
    return NextResponse.json({ received: true, dispatched: true, tier });
  } catch {
    return NextResponse.json({ message: "Report dispatch failed and Stripe should retry." }, { status: 500 });
  }
}
