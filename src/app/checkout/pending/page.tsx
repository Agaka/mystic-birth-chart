import type { Metadata } from "next";
import Link from "next/link";
import { getReadingOffer, isReadingTier } from "@/lib/orders";

interface PendingCheckoutPageProps {
  searchParams: Promise<{ tier?: string }>;
}

export const metadata: Metadata = {
  title: "Payment Setup Pending",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PendingCheckoutPage({
  searchParams,
}: PendingCheckoutPageProps) {
  const { tier } = await searchParams;
  const offer = isReadingTier(tier) ? getReadingOffer(tier) : null;

  return (
    <section className="reading-area py-20 md:py-28">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark/80">
          Payment connection pending
        </p>
        <h1 className="font-heading text-4xl font-semibold leading-tight text-aubergine md:text-6xl">
          This checkout is ready, but Stripe is not connected yet.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink/62">
          {offer
            ? `The ${offer.product.name} checkout page is configured. Add the Stripe secret key and price ID in Vercel to turn on payment.`
            : "Add the Stripe secret key and price IDs in Vercel to turn on payment."}
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          {offer && (
            <Link
              href={offer.checkoutPath}
              className="inline-flex min-h-11 items-center justify-center rounded-[4px] bg-gold px-6 py-3 font-ui text-sm font-semibold tracking-wide text-ink"
            >
              Return to Checkout
            </Link>
          )}
          <Link
            href="/birth-chart-report"
            className="inline-flex min-h-11 items-center justify-center rounded-[4px] border border-ink/25 px-6 py-3 font-ui text-sm font-semibold tracking-wide text-ink"
          >
            View Reading Options
          </Link>
        </div>
      </div>
    </section>
  );
}
