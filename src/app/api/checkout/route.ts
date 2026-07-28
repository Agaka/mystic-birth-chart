import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getReadingOffer, isReadingTier } from "@/lib/orders";
import { siteConfig } from "@/lib/site";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const configuredOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url).origin;
  const requestOrigin = new URL(request.url).origin;
  const siteUrl =
    process.env.NODE_ENV === "development" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)
      ? requestOrigin
      : configuredOrigin;
  const body = (await request.json().catch(() => ({}))) as {
    tier?: string;
    name?: string;
    email?: string;
    birthDate?: string;
    birthTime?: string;
    birthCity?: string;
    focus?: string;
    notes?: string;
    partnerData?: string;
    annualCycleYear?: string;
    annualReturnCity?: string;
    newsletter?: boolean;
    promotekitReferral?: string;
  };

  if (!isReadingTier(body.tier)) {
    return NextResponse.json({ message: "Invalid reading tier." }, { status: 400 });
  }

  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 254);
  const birthDate = String(body.birthDate || "").trim().slice(0, 20);
  const birthTime = String(body.birthTime || "").trim().slice(0, 20);
  const birthCity = String(body.birthCity || "").trim().slice(0, 180);
  const focus = String(body.focus || "general").trim().slice(0, 60);
  const notes = String(body.notes || "").trim().slice(0, 450);
  const partnerData = String(body.partnerData || "").trim().slice(0, 450);
  const annualCycleYear = String(body.annualCycleYear || "").trim().slice(0, 4);
  const annualReturnCity = String(body.annualReturnCity || "").trim().slice(0, 180);
  const promotekitReferral =
    typeof body.promotekitReferral === "string"
      ? body.promotekitReferral.trim().slice(0, 500)
      : "";
  const annualTier = body.tier === "year-ahead" || body.tier === "dossier";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !birthDate || !birthCity || (body.tier === "basic" && !birthTime) || (annualTier && (!/^20\d{2}$/.test(annualCycleYear) || !annualReturnCity))) {
    return NextResponse.json(
      { message: "Enter a valid name and email before continuing." },
      { status: 400 },
    );
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
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/thank-you?tier=${offer.tier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}${offer.checkoutPath}`,
      client_reference_id: offer.tier,
      metadata: {
        reading_tier: offer.tier,
        reading_name: offer.product.name,
        customer_name: name,
        birth_date: birthDate,
        birth_time: birthTime,
        birth_city: birthCity,
        reading_focus: focus,
        customer_notes: notes,
        partner_data: partnerData,
        annual_cycle_year: annualCycleYear,
        annual_return_city: annualReturnCity,
        newsletter_opt_in: body.newsletter ? "yes" : "no",
        fulfillment_status: "pending",
        ...(promotekitReferral ? { promotekit_referral: promotekitReferral } : {}),
      },
      ...(isSubscription
        ? {
          subscription_data: {
            description: `${offer.product.name} - ${siteConfig.name}`,
            metadata: {
              reading_tier: offer.tier,
              customer_name: name,
              birth_date: birthDate,
              birth_time: birthTime,
              birth_city: birthCity,
              reading_focus: focus,
              customer_notes: notes,
              partner_data: partnerData,
              annual_cycle_year: annualCycleYear,
              annual_return_city: annualReturnCity,
            },
            },
          }
        : {
            payment_intent_data: {
              description: `${offer.product.name} - ${siteConfig.name}`,
              statement_descriptor: "MYSTICBIRTHCHART",
              receipt_email: email,
              metadata: {
                reading_tier: offer.tier,
                customer_name: name,
                birth_date: birthDate,
                birth_time: birthTime,
                birth_city: birthCity,
                ...(promotekitReferral ? { promotekit_referral: promotekitReferral } : {}),
              },
            },
          }),
      custom_text: {
        submit: {
          message: isSubscription
            ? `Your ${offer.product.name} will be delivered to your inbox every month. You can cancel your subscription at any time. Questions? hello@mysticbirthchart.com`
            : isEssential
            ? `Your ${offer.product.name} is generated automatically and delivered instantly by email after payment. It is not hand-prepared. Questions? hello@mysticbirthchart.com`
            : `${offer.product.name}: ${offer.product.delivery}. Format: ${offer.product.format}. ${offer.product.disclosure} Questions? hello@mysticbirthchart.com`,
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
    console.error("Stripe Checkout Error", {
      type: error instanceof Stripe.errors.StripeError ? error.type : "unknown",
    });
    return NextResponse.json(
      {
        message: "Unable to start the secure payment session. Please try again.",
      },
      { status: 500 }
    );
  }
}
