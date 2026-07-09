import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getReadingOffer, isReadingTier, readingTiers } from "@/lib/orders";
import { siteConfig } from "@/lib/site";

interface CheckoutPageProps {
  params: Promise<{ tier: string }>;
}

export function generateStaticParams() {
  return readingTiers.map((tier) => ({ tier }));
}

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { tier } = await params;
  if (!isReadingTier(tier)) {
    return {};
  }

  const offer = getReadingOffer(tier);

  return {
    title: `Checkout - ${offer.product.name}`,
    description: `Order the ${offer.product.name} from ${siteConfig.name}.`,
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { tier } = await params;

  if (!isReadingTier(tier)) {
    notFound();
  }

  const offer = getReadingOffer(tier);
  const isEssential = offer.tier === "basic";

  return (
    <>
      <section className="wood-panel py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 flex items-center justify-start border-b border-gold/15 pb-8 sm:justify-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-ink sm:h-6 sm:w-6 sm:text-xs">1</span>
              <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-light sm:text-xs">Details</span>
              <span className="mx-1 h-px w-6 bg-gold/30 sm:mx-2 sm:w-10"></span>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold/40 text-[10px] font-bold text-gold/40 sm:h-6 sm:w-6 sm:text-xs">2</span>
              <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-gold/40 sm:text-xs">Payment</span>
              <span className="mx-1 h-px w-6 bg-gold/15 sm:mx-2 sm:w-10"></span>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold/20 text-[10px] font-bold text-gold/20 sm:h-6 sm:w-6 sm:text-xs">3</span>
              <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.12em] text-gold/20 sm:text-xs">Reading</span>
            </div>
          </div>

          <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/75">
            Private reading checkout
          </p>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
                {isEssential
                  ? "Receive your automated Essential reading by email."
                  : "Secure your place in the hand-prepared reading queue."}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ivory/62">
                {isEssential
                  ? "Enter the birth details needed to generate your instant reading. The final card payment is handled securely by Stripe."
                  : "Enter the details needed for your written chart reading. The final card payment is handled securely by Stripe."}
              </p>
            </div>
            <aside className="border border-gold/24 bg-ink/45 p-6">
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold/70">
                Order summary
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold text-ivory">
                {offer.product.name}
              </h2>
              <div className="mt-4 font-ui text-4xl font-bold text-gold-light">
                {offer.product.price}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ivory/58">
                {offer.product.summary}
              </p>
              <p className="mt-3 font-ui text-xs uppercase tracking-[0.16em] text-gold/70">
                {offer.product.disclosure}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="reading-area py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_0.72fr] lg:items-start">
          <div className="border border-ink/10 bg-ivory-dark/70 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.12)] sm:p-8">
            <CheckoutForm
              tier={offer.tier}
              productName={offer.product.name}
              productPrice={offer.product.price}
            />
          </div>

          <aside className="space-y-5">
            <div className="border border-ink/10 bg-white/45 p-6">
              <h2 className="font-heading text-2xl font-semibold text-aubergine">
                Included in this reading
              </h2>
              <ul className="mt-5 space-y-3">
                {offer.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-relaxed text-ink/65">
                    <span className="font-ui text-gold-dark" aria-hidden="true">
                      +
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-ink/10 bg-white/45 p-6">
              <h2 className="font-heading text-2xl font-semibold text-aubergine">
                Delivery
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/62">
                {isEssential
                  ? `${offer.product.delivery}. It is generated automatically from your birth data, not hand-prepared. You receive a written email reading you can save and revisit.`
                  : `${offer.product.delivery}. ${siteConfig.capacity}. You receive a written PDF you can save, revisit, and study at your own pace.`}
              </p>
            </div>

            <div className="border border-ink/10 bg-white/45 p-6">
              <h2 className="font-heading text-2xl font-semibold text-aubergine">
                Refund policy
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/62">
                {isEssential
                  ? "Because the automated Essential reading is generated and delivered immediately, refunds are generally not offered after delivery unless there is a clear fulfillment issue."
                  : "Refunds are available before the reading work begins. Once a personalized reading is prepared or delivered, refunds are generally not offered unless there is a clear fulfillment issue."}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
