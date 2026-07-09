import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getReadingOffer, isReadingTier } from "@/lib/orders";
import { siteConfig } from "@/lib/site";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  // Use the request origin so Stripe redirects back to localhost during dev.
  const origin = request.headers.get("origin") || "";
  const siteUrl = origin || process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;
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
  const isEssential = offer.tier === "basic";

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

  try {
    const stripe = new Stripe(secretKey);
    const isSubscription = offer.isSubscription;

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: isSubscription ? "subscription" : "payment",
      customer_email: body.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/thank-you?tier=${offer.tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}${offer.checkoutPath}`,
      client_reference_id: offer.tier,
      metadata: {
        reading_tier: offer.tier,
        reading_name: offer.product.name,
        customer_name: body.name || "",
      },
      ...(isSubscription
        ? {
            subscription_data: {
              description: `${offer.product.name} - ${siteConfig.name}`,
            },
          }
        : {
            payment_intent_data: {
              description: `${offer.product.name} - ${siteConfig.name}`,
              statement_descriptor: "MYSTICBIRTHCHART",
              receipt_email: body.email,
            },
          }),
      custom_text: {
        submit: {
          message: isSubscription
            ? `Your ${offer.product.name} will be delivered to your inbox every month. You can cancel your subscription at any time. Questions? hello@mysticbirthchart.com`
            : isEssential
            ? `Your ${offer.product.name} is generated automatically and delivered instantly by email after payment. It is not hand-prepared. Questions? hello@mysticbirthchart.com`
            : `Your ${offer.product.name} is hand-prepared and delivered as a personalized PDF to your email within 72 hours. Questions? hello@mysticbirthchart.com`,
        },
        after_submit: {
          message: isSubscription
            ? "Thank you! Your first month's almanac will be delivered soon."
            : isEssential
            ? "Thank you! Your birth details will be sent automatically so your instant email reading can be generated."
            : "Thank you! Your birth details will be sent automatically. You'll see a confirmation on the next page.",
        },
      },
      allow_promotion_codes: true,
    };

    const session = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session.",
      },
      { status: 500 }
    );
  }
}
