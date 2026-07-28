import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getAlmanacSubscription } from "@/lib/essential/dispatch";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() || "";
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!token || !secretKey) {
    return NextResponse.json({ message: "Subscription management is unavailable." }, { status: 400 });
  }

  try {
    const { subscriptionId } = await getAlmanacSubscription(token);
    const stripe = new Stripe(secretKey);
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customer = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    const portal = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `https://worker.mysticbirthchart.com/library/${encodeURIComponent(token)}`,
    });
    return NextResponse.redirect(portal.url, 303);
  } catch {
    return NextResponse.redirect(`${siteConfig.url}/readings?subscription=unavailable`, 303);
  }
}
