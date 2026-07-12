import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy",
  description: "How Mystic Birth Chart handles birth data, checkout information, analytics, email delivery, and privacy requests.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <section className="reading-area">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <h1 className="mb-8 font-heading text-4xl font-medium text-aubergine md:text-5xl">
          Privacy Policy
        </h1>
        <div className="article-prose">
          <p>
            <em>Last updated: July 2026</em>
          </p>

          <h2>Introduction</h2>
          <p>
            Mystic Birth Chart respects your privacy and is committed to
            protecting your personal data. This privacy policy explains how we
            collect, use, and protect your information when you visit our
            website or purchase a reading.
          </p>

          <h2>Information We Collect</h2>
          <p>We may collect the following information:</p>
          <ul>
            <li>
              <strong>Free Chart details:</strong> birth date, birth time or an
              unknown-time choice, birth city/country, and selected focus. The
              browser preview does not require a name, account, or email
            </li>
            <li>
              <strong>Checkout and order details:</strong> name, email, birth
              details, selected focus, optional notes, and partner details when
              a two-chart product requires them
            </li>
            <li>
              <strong>Payment information:</strong> processed through our
              payment provider. We do not store your credit card details
            </li>
            <li>
              <strong>Usage data:</strong> analytics data about how visitors use
              the website
            </li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and deliver your personalized birth chart reading</li>
            <li>Communicate with you about your order</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>Free Chart and Session Storage</h2>
          <p>
            The Free Chart does not require an account or email. When you choose
            to continue to checkout, birth date, time, city, and focus may be
            kept temporarily in your browser&apos;s session storage so you do not
            need to enter them again. Session storage is cleared after confirmed
            fulfillment or when you use Start Over.
          </p>
          <p>
            City-search text is sent to the configured geocoding provider so the
            browser can resolve coordinates and timezone. After a city is selected,
            the Free Chart calculation and preview run in the browser. Coordinates
            and chart results are not included in GA4 events.
          </p>
          <p>
            If you request the optional PDF, the chart details are sent securely
            to our server only to calculate and generate that document. You may
            download it without giving an email address. If you choose email
            delivery, we use the address only to send the PDF unless you separately
            select the newsletter checkbox.
          </p>

          <h2>Data Storage and Security</h2>
          <p>
            Your birth details are used for the purpose of preparing your
            reading. We do not sell or rent your personal data. We share data
            with third parties only as necessary to provide our services, such
            as payment processing or email delivery.
          </p>

          <h2>Cookies</h2>
          <p>
            Our website may use cookies for analytics and service operation. GA4
            events are designed not to include names, email addresses, birth
            dates, birth times, birth cities, coordinates, notes, or report text.
            You can control cookies through your browser settings.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We use or may configure third-party services for Stripe payment
            processing, Open-Meteo city lookup, GA4 analytics, newsletter signup,
            and email delivery. Each provider has its own privacy policy. Birth
            details required for fulfillment may be attached to the Stripe Checkout
            Session as private order metadata and are processed only after payment
            is verified. They are never sent to GA4 as analytics parameters.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request access to your personal data</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent for data processing where applicable</li>
            <li>Lodge a complaint with a data protection authority</li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            We retain birth details and reading data for a reasonable period to
            allow for delivery, support, and re-delivery. You may request
            deletion at any time.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy-related questions or requests, contact us at{" "}
            <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
