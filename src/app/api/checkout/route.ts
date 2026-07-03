import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getReadingOffer, isReadingTier } from "@/lib/orders";
import { siteConfig } from "@/lib/site";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
  const body = (await request.json().catch(() => ({}))) as {
    tier?: string;
    name?: string;
    email?: string;
  };

  if (!isReadingTier(body.tier)) {
    return NextResponse.json({ message: "Invalid reading tier." }, { status: 400 });
  }

  const offer = getReadingOffer(body.tier);
  const priceId = offer.priceId;

  if (!secretKey || !priceId) {
    return NextResponse.json(
      {
        message:
          "Stripe is not configured. Set STRIPE_SECRET_KEY and the reading price IDs in Vercel.",
        redirectUrl: `${siteUrl}/checkout/pending?tier=${offer.tier}`,
      },
      { status: 200 }
    );
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/thank-you?tier=${offer.tier}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}${offer.checkoutPath}`,
    client_reference_id: offer.tier,
    metadata: {
      reading_tier: offer.tier,
      reading_name: offer.product.name,
    },
    branding_settings: {
      display_name: siteConfig.name,
      button_color: "#b88a3a",
      border_style: "rectangular",
      font_family: "lora",
    },
  });

  return NextResponse.json({ url: session.url });
}
