import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Mystic Birth Chart terms of service.",
};

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
            Mystic Birth Chart offers personalized natal chart readings based on
            birth data supplied by the customer. Readings are delivered as PDF
            documents and may include optional supporting materials when stated
            on the product page.
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
            After completing your purchase, you will be asked to submit your
            birth date, birth time, birth city/country, and optional focus area.
            Your personalized reading will be delivered within the delivery
            window listed for your selected option after complete birth details
            are received.
          </p>

          <h2>Payment</h2>
          <p>
            Payments are processed through Stripe or another listed payment
            provider. Prices are listed in USD unless otherwise stated.
          </p>

          <h2>Refund Policy</h2>
          <p>
            Because each reading is personalized and created specifically for
            your birth data, refunds are generally not offered after the reading
            has been delivered. If there is a significant issue, such as
            incorrect birth data being used, contact us and we will work to
            address it.
          </p>
          <p>
            If your reading has not yet been prepared, you may request a refund
            by contacting hello@mysticbirthchart.com.
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
            For questions about these terms, contact us at
            hello@mysticbirthchart.com.
          </p>
        </div>
      </div>
    </section>
  );
}
