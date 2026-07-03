import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Mystic Birth Chart privacy policy.",
};

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
              <strong>Birth details:</strong> name, email, birth date, birth
              time, and birth city/country, provided by you when ordering a
              personalized reading
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

          <h2>Data Storage and Security</h2>
          <p>
            Your birth details are used for the purpose of preparing your
            reading. We do not sell or rent your personal data. We share data
            with third parties only as necessary to provide our services, such
            as payment processing or email delivery.
          </p>

          <h2>Cookies</h2>
          <p>
            Our website may use cookies for analytics and to improve browsing.
            You can control cookies through your browser settings.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We may use third-party services for payment processing, analytics,
            forms, and email communication. These providers have their own
            privacy policies.
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
            For privacy-related questions or requests, contact us at
            {siteConfig.supportEmail}.
          </p>
        </div>
      </div>
    </section>
  );
}
