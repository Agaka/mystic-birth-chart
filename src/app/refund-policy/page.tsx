import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Refund Policy",
  description:
    "Refund and correction terms for the automated Essential Birth Chart Reading and individually prepared astrology readings.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <section className="reading-area">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <h1 className="mb-8 font-heading text-4xl font-medium text-aubergine md:text-5xl">
          Refund Policy
        </h1>
        <div className="article-prose">
          <p><em>Last updated: July 2026</em></p>

          <h2>Essential Birth Chart Reading</h2>
          <p>
            The Essential Reading is an automated digital service generated from
            the birth data entered at checkout and delivered immediately by email
            after payment confirmation. Because fulfillment begins immediately,
            refunds are generally not offered after delivery.
          </p>
          <p>
            Contact the studio if the reading was not delivered, the system could
            not match the submitted city, or a clear technical fulfillment error
            occurred.
          </p>

          <h2>Individually Prepared Readings</h2>
          <p>
            A refund may be requested before preparation begins. Once individual
            analysis or preparation has started, or after the written reading has
            been delivered, refunds are generally not offered unless there is a
            clear fulfillment issue.
          </p>

          <h2>Birth Data Corrections</h2>
          <p>
            Customers are responsible for checking the submitted birth date,
            time, and city. If the studio used data different from what was
            submitted, contact us so the order can be reviewed. Corrections after
            customer-entered data changes may require a new order when substantial
            recalculation or rewriting is necessary.
          </p>

          <h2>Requesting Help</h2>
          <p>
            Email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>{" "}
            with the Stripe receipt email, product name, and a short description
            of the issue. Do not send payment card details by email.
          </p>

          <p>
            This page summarizes the studio&apos;s current fulfillment policy and is
            not a substitute for jurisdiction-specific legal advice.
          </p>
        </div>
      </div>
    </section>
  );
}
