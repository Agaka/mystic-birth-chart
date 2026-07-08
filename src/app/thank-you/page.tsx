"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";

interface CheckoutDraft {
  tier?: string;
  name?: string;
  email?: string;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  focus?: string;
  notes?: string;
  newsletter?: string;
}

const draftStorageKey = "mysticBirthChartCheckoutDraft";

type SendStatus = "loading" | "sent" | "error" | "no-draft";

export default function ThankYouPage() {
  const supportEmail = siteConfig.supportEmail;
  const [status, setStatus] = useState<SendStatus>("loading");
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const stored = window.localStorage.getItem(draftStorageKey);
        if (!stored) {
          setStatus("no-draft");
          return;
        }

        const parsed = JSON.parse(stored) as CheckoutDraft;
        setDraft(parsed);

        // Auto-send the birth details email
        trackEvent("birth_details_auto_send", {
          tier: parsed.tier || "unknown",
        });

        const res = await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tier: parsed.tier || "",
            name: parsed.name || "",
            email: parsed.email || "",
            birthDate: parsed.birthDate || "",
            birthTime: parsed.birthTime || "",
            birthCity: parsed.birthCity || "",
            focus: parsed.focus || "",
            notes: parsed.notes || "",
          }),
        });

        if (res.ok) {
          setStatus("sent");
          // Clear the draft after successful send
          window.localStorage.removeItem(draftStorageKey);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
            {status === "loading" ? "Processing..." : "Order confirmed"}
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            {status === "loading"
              ? "Finalizing your order..."
              : "Thank you for your order."}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ivory/58">
            {status === "loading"
              ? "We're sending your birth details now..."
              : status === "sent"
                ? "Your birth details have been received. Your personalized reading is now in the queue."
                : status === "error"
                  ? "Your payment was successful, but we had trouble sending your details automatically."
                  : "Your payment was successful."}
          </p>
        </div>
      </section>

      <section className="reading-area py-16 md:py-24">
        <div className="mx-auto max-w-xl px-6">
          {status === "loading" && (
            <div className="border border-gold/20 bg-ivory-dark p-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
              <p className="text-ink/60">
                Sending your birth details...
              </p>
            </div>
          )}

          {status === "sent" && draft && (
            <div className="space-y-8">
              <div className="border border-gold/20 bg-ivory-dark p-8 text-center">
                <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                  ✓ Details received
                </p>
                <h2 className="mt-4 font-heading text-3xl font-medium text-aubergine">
                  Your reading is being prepared.
                </h2>
                <p className="mt-4 text-ink/60">
                  We&apos;ll deliver your personalized PDF to{" "}
                  <strong className="text-ink/80">{draft.email}</strong> within
                  the delivery window for your reading tier.
                </p>
              </div>

              <div className="border border-ink/10 bg-white/60 p-6">
                <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                  Order summary
                </p>
                <dl className="space-y-2 text-sm text-ink/70">
                  {draft.name && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-ink/50">Name</dt>
                      <dd>{draft.name}</dd>
                    </div>
                  )}
                  {draft.email && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-ink/50">Email</dt>
                      <dd>{draft.email}</dd>
                    </div>
                  )}
                  {draft.birthDate && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-ink/50">Birth date</dt>
                      <dd>{draft.birthDate}</dd>
                    </div>
                  )}
                  {draft.birthTime && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-ink/50">Birth time</dt>
                      <dd>{draft.birthTime}</dd>
                    </div>
                  )}
                  {draft.birthCity && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-ink/50">Birth city</dt>
                      <dd>{draft.birthCity}</dd>
                    </div>
                  )}
                  {draft.focus && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-ink/50">Focus</dt>
                      <dd className="capitalize">{draft.focus}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <p className="text-center text-xs text-ink/40">
                A payment receipt has been sent to your email by Stripe. If you have
                any questions, contact us at{" "}
                <a href={`mailto:${supportEmail}`} className="underline">
                  {supportEmail}
                </a>
                .
              </p>
            </div>
          )}

          {status === "sent" && !draft && (
            <div className="border border-gold/20 bg-ivory-dark p-8 text-center">
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                ✓ Order confirmed
              </p>
              <h2 className="mt-4 font-heading text-3xl font-medium text-aubergine">
                Your reading is being prepared.
              </h2>
              <p className="mt-4 text-ink/60">
                We&apos;ll deliver your personalized PDF within the delivery window.
              </p>
            </div>
          )}

          {status === "no-draft" && (
            <div className="border border-gold/20 bg-ivory-dark p-8 text-center">
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                ✓ Payment received
              </p>
              <h2 className="mt-4 font-heading text-3xl font-medium text-aubergine">
                Thank you for your purchase.
              </h2>
              <p className="mt-4 text-ink/60">
                If you haven&apos;t already sent your birth details, please email them
                to{" "}
                <a
                  href={`mailto:${supportEmail}`}
                  className="font-medium text-gold-dark underline"
                >
                  {supportEmail}
                </a>{" "}
                so we can prepare your reading.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="border border-rose/30 bg-rose/5 p-8 text-center">
                <h2 className="font-heading text-2xl font-medium text-aubergine">
                  We couldn&apos;t send your details automatically.
                </h2>
                <p className="mt-4 text-ink/60">
                  Don&apos;t worry — your payment went through. Please send your birth
                  details directly to:
                </p>
                <a
                  href={`mailto:${supportEmail}?subject=${encodeURIComponent(
                    `Birth Chart Reading - ${draft?.name || "Order"}`
                  )}&body=${encodeURIComponent(
                    [
                      `Name: ${draft?.name || ""}`,
                      `Email: ${draft?.email || ""}`,
                      `Birth Date: ${draft?.birthDate || ""}`,
                      `Birth Time: ${draft?.birthTime || ""}`,
                      `Birth City: ${draft?.birthCity || ""}`,
                      `Focus: ${draft?.focus || ""}`,
                      `Notes: ${draft?.notes || ""}`,
                    ].join("\n")
                  )}`}
                  className="mt-4 inline-block font-medium text-gold-dark underline"
                >
                  {supportEmail}
                </a>
              </div>

              <Button
                href={`mailto:${supportEmail}`}
                size="lg"
                className="w-full"
                analytics={{
                  event: "cta_click",
                  params: {
                    cta_label: "Email Birth Details",
                    cta_location: "thank_you_error_fallback",
                  },
                }}
              >
                Send Birth Details via Email
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
