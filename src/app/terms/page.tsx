import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description: "Terms for automated Essential readings, individually prepared readings, payment, delivery, and personal use.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <section className="reading-area">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <h1 className="mb-8 font-heading text-4xl font-medium text-aubergine md:text-5xl">
          Terms of Service
        </h1>
        <div className="article-prose">
          <p>
            <em>Last updated: July 2026</em>
          </p>

          <h2>Overview</h2>
          <p>
            By using the Mystic Birth Chart website and purchasing a reading,
            you agree to the following terms. Please read them carefully.
          </p>

          <h2>Products and Services</h2>
          <p>
            Mystic Birth Chart offers written astrology products based on birth
            data supplied by the customer. The Essential Birth Chart Reading is
            generated automatically and delivered by email. Individually prepared
            readings, including the Complete Natal Reading, are delivered in the
            format and delivery window stated on their product page, generally as
            written PDF documents.
          </p>

          <h2>Disclaimer</h2>
          <p>
            <strong>
              Mystic Birth Chart readings are for self-reflection and
              educational purposes only.
            </strong>{" "}
            They do not provide medical, legal, financial, psychological, or
            guaranteed predictive advice.
          </p>
          <p>
            Our readings offer symbolic insight and are designed to support
            self-understanding. They should not replace professional guidance or
            be used as the basis for high-stakes decisions.
          </p>

          <h2>Ordering and Delivery</h2>
          <p>
            Birth date, birth time, birth city/country, and an optional focus are
            requested on the custom checkout before card payment. The card payment
            itself is completed through Stripe. The Essential reading is generated
            and emailed after payment is confirmed. Individually prepared products
            enter the stated preparation queue after payment and complete birth
            details are received.
          </p>

          <h2>Payment</h2>
          <p>
            Payments are processed through Stripe or another listed payment
            provider. Prices are listed in USD unless otherwise stated.
          </p>

          <h2>Refund Policy</h2>
          <p>
            Because the automated Essential reading is generated and delivered
            immediately, refunds are generally not offered after delivery unless
            there is a clear fulfillment issue. Individually prepared readings may
            be refunded before preparation begins.
          </p>
          <p>
            Once an individually prepared reading has begun or been delivered,
            refunds are generally not offered unless there is a clear fulfillment
            issue. If incorrect customer data was used, contact{" "}
            <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>{" "}
            so the studio can review whether a correction is possible. See the
            separate Refund Policy for the product-specific summary.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content on the Mystic Birth Chart website, including articles,
            readings, design elements, and brand materials, is the intellectual
            property of Mystic Birth Chart. You may not reproduce, distribute,
            or commercially use this content without written permission.
          </p>
          <p>
            Your personalized reading is licensed to you for personal use only.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            Mystic Birth Chart is not liable for decisions made based on the
            content of our readings or website. Our content is symbolic and
            interpretive in nature.
          </p>

          <h2>Changes to These Terms</h2>
          <p>
            We may update these terms from time to time. Changes will be posted
            on this page with an updated date. Continued use of the website
            after changes are posted constitutes acceptance of the new terms.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these terms, contact us at{" "}
            <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
