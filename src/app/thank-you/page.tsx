"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { trackEvent } from "@/lib/analytics";
import { getFormUrl, siteConfig } from "@/lib/site";

interface CheckoutDraft {
  tier?: string;
  name?: string;
  email?: string;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  focus?: string;
  notes?: string;
}

const draftStorageKey = "mysticBirthChartCheckoutDraft";

export default function ThankYouPage() {
  const formUrl = getFormUrl();
  const supportEmail = siteConfig.supportEmail;
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(draftStorageKey);
        if (stored) {
          setDraft(JSON.parse(stored) as CheckoutDraft);
        }
      } catch {
        window.localStorage.removeItem(draftStorageKey);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    trackEvent("birth_details_submit_attempt", {
      destination: formUrl ? "external_form" : "mailto",
    });

    if (formUrl) {
      window.location.href = formUrl;
      return;
    }

    const formData = new FormData(e.currentTarget);
    const tier = formData.get("tier") || "";
    const name = formData.get("name") || "";
    const email = formData.get("email") || "";
    const birthDate = formData.get("birthDate") || "";
    const birthTime = formData.get("birthTime") || "";
    const birthCity = formData.get("birthCity") || "";
    const focus = formData.get("focus") || "";
    const notes = formData.get("notes") || "";

    const subject = `Birth Chart Reading - ${name}`;
    const body = [
      `Reading tier: ${tier}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Birth Date: ${birthDate}`,
      `Birth Time: ${birthTime}`,
      `Birth City: ${birthCity}`,
      `Focus: ${focus}`,
      `Notes: ${notes}`,
    ].join("\n");

    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(String(subject))}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  return (
    <>
      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
            Order received
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            Your reading is almost ready to enter the queue.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ivory/58">
            Send your birth details below so your chart can be prepared.
          </p>
        </div>
      </section>

      <section className="reading-area py-16 md:py-24">
        <div className="mx-auto max-w-xl px-6">
          {submitted ? (
            <div className="border border-gold/20 bg-ivory-dark p-8 text-center">
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                Details prepared
              </p>
              <h2 className="mt-4 font-heading text-3xl font-medium text-aubergine">
                Your email draft is ready to send.
              </h2>
              <p className="mt-4 text-ink/60">
                Send the email draft so your reading details can be matched to
                your payment.
              </p>
            </div>
          ) : (
            <form key={draft?.email || "empty"} onSubmit={handleSubmit} className="space-y-6">
              <input type="hidden" name="tier" value={draft?.tier || ""} />
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block font-ui text-sm font-medium text-ink/70"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  defaultValue={draft?.name || ""}
                  className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink transition-colors placeholder:text-ink/30 focus:border-gold focus:outline-none"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-ui text-sm font-medium text-ink/70"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  defaultValue={draft?.email || ""}
                  className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink transition-colors placeholder:text-ink/30 focus:border-gold focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="birthDate"
                    className="mb-2 block font-ui text-sm font-medium text-ink/70"
                  >
                    Birth date
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    required
                    defaultValue={draft?.birthDate || ""}
                    className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink transition-colors focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="birthTime"
                    className="mb-2 block font-ui text-sm font-medium text-ink/70"
                  >
                    Birth time
                  </label>
                  <input
                    type="time"
                    id="birthTime"
                    name="birthTime"
                    defaultValue={draft?.birthTime || ""}
                    className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink transition-colors focus:border-gold focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-ink/40">
                    As precise as possible.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="birthCity"
                  className="mb-2 block font-ui text-sm font-medium text-ink/70"
                >
                  Birth city and country
                </label>
                <input
                  type="text"
                  id="birthCity"
                  name="birthCity"
                  required
                  defaultValue={draft?.birthCity || ""}
                  className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink transition-colors placeholder:text-ink/30 focus:border-gold focus:outline-none"
                  placeholder="e.g. Sao Paulo, Brazil"
                />
              </div>

              <div>
                <label
                  htmlFor="focus"
                  className="mb-2 block font-ui text-sm font-medium text-ink/70"
                >
                  Main focus
                </label>
                <select
                  id="focus"
                  name="focus"
                  defaultValue={draft?.focus || "general"}
                  className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink transition-colors focus:border-gold focus:outline-none"
                >
                  <option value="general">General overview</option>
                  <option value="purpose">Purpose and direction</option>
                  <option value="love">Love and relationships</option>
                  <option value="money">Money and self-worth</option>
                  <option value="emotions">Emotional patterns</option>
                  <option value="career">Career and vocation</option>
                  <option value="spiritual">Spiritual direction</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block font-ui text-sm font-medium text-ink/70"
                >
                  Anything else you want the reading to consider
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  defaultValue={draft?.notes || ""}
                  className="w-full resize-y border border-ink/15 bg-white px-4 py-3 font-body text-ink transition-colors placeholder:text-ink/30 focus:border-gold focus:outline-none"
                  placeholder="Specific questions, areas of interest, or anything you want included."
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  analytics={{
                    event: "cta_click",
                    params: {
                      cta_label: "Submit Birth Details",
                      cta_location: "thank_you_form",
                    },
                  }}
                >
                  Submit Birth Details
                </Button>
              </div>

              {!formUrl && (
                <p className="mt-4 text-center text-xs text-ink/35">
                  Form integration pending. Submitting will open your email
                  client with the details pre-filled.
                </p>
              )}
            </form>
          )}
        </div>
      </section>
    </>
  );
}
