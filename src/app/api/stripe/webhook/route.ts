import Stripe from "stripe";
import { NextResponse } from "next/server";
import { POST as fulfillOrder } from "@/app/api/email/route";
import { dispatchEssentialJob } from "@/lib/essential/dispatch";
import { buildEssentialJob } from "@/lib/essential/job";

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
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return NextResponse.json({ received: true });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata || {};
  const email = String(session.customer_details?.email || session.customer_email || "").toLowerCase();
  const tier = metadata.reading_tier || session.client_reference_id || "";
  if (tier === "basic") {
    try {
      await dispatchEssentialJob(buildEssentialJob(session, email));
      return NextResponse.json({ received: true, dispatched: true });
    } catch {
      return NextResponse.json({ message: "Essential dispatch failed and Stripe should retry." }, { status: 500 });
    }
  }
  const fulfillmentRequest = new Request("http://internal/api/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: session.id,
      tier,
      name: metadata.customer_name || session.customer_details?.name || "",
      email,
      birthDate: metadata.birth_date || "",
      birthTime: metadata.birth_time || "",
      birthCity: metadata.birth_city || "",
      focus: metadata.reading_focus || "general",
      notes: metadata.customer_notes || "",
      partnerData: metadata.partner_data || "",
    }),
  });
  const response = await fulfillOrder(fulfillmentRequest);
  if (!response.ok) {
    return NextResponse.json({ message: "Fulfillment failed and Stripe should retry." }, { status: 500 });
  }
  return NextResponse.json({ received: true, fulfilled: true });
}
