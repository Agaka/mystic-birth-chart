import { NextResponse } from "next/server";

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!secretKey || !priceId) {
    return NextResponse.json(
      {
        message:
          "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID environment variables.",
        redirectUrl: `${siteUrl}/thank-you`,
      },
      { status: 200 }
    );
  }

  // When Stripe is configured, install the stripe package and enable this block.
  //
  // const Stripe = (await import("stripe")).default;
  // const stripe = new Stripe(secretKey);
  //
  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ["card"],
  //   line_items: [{ price: priceId, quantity: 1 }],
  //   mode: "payment",
  //   success_url: `${siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
  //   cancel_url: `${siteUrl}/birth-chart-report`,
  // });
  //
  // return NextResponse.json({ url: session.url });

  return NextResponse.json({
    message:
      "Stripe integration ready. Install stripe package and uncomment the checkout code.",
    redirectUrl: `${siteUrl}/thank-you`,
  });
}
