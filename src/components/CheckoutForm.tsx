"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { trackEvent } from "@/lib/analytics";
import type { ReadingTier } from "@/lib/orders";

interface CheckoutFormProps {
  tier: ReadingTier;
  productName: string;
  productPrice: string;
}

interface CheckoutDraft {
  tier: ReadingTier;
  name: string;
  email: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  focus: string;
  notes: string;
  partnerData?: string;
  newsletter: string;
}

const draftStorageKey = "mysticBirthChartCheckoutDraft";

export function CheckoutForm({
  tier,
  productName,
  productPrice,
}: CheckoutFormProps) {
  const isEssential = tier === "basic";
  const isFocused = tier === "love" || tier === "career";
  const isSynastry = tier === "synastry";
  const isAutomated = isEssential;
  
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(draftStorageKey);
        if (!stored) return;

        const parsed = JSON.parse(stored) as CheckoutDraft;
        if (parsed.tier === tier) {
          setDraft(parsed);
        }
      } catch {
        window.localStorage.removeItem(draftStorageKey);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [tier]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const checkoutDraft: CheckoutDraft = {
      tier,
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      birthDate: String(formData.get("birthDate") || ""),
      birthTime: String(formData.get("birthTime") || ""),
      birthCity: String(formData.get("birthCity") || ""),
      focus: String(formData.get("focus") || "general"),
      notes: String(formData.get("notes") || ""),
      partnerData: isSynastry ? String(formData.get("partnerData") || "") : undefined,
      newsletter: formData.get("newsletter") ? "yes" : "no",
    };

    try {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(checkoutDraft));

      trackEvent("checkout_submit_attempt", {
        offer_tier: tier,
        offer_name: productName,
        offer_price: productPrice,
      });

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tier,
          name: checkoutDraft.name,
          email: checkoutDraft.email,
        }),
      });

      const payload = (await response.json()) as {
        url?: string;
        redirectUrl?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || "Unable to start checkout.");
      }

      const destination = payload.url || payload.redirectUrl;
      if (!destination) {
        throw new Error("Checkout did not return a destination URL.");
      }

      window.location.href = destination;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout."
      );
      setPending(false);
    }
  }

  return (
    <form key={draft?.tier || "empty"} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block font-ui text-sm font-medium text-ink/70">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={draft?.name || ""}
            className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block font-ui text-sm font-medium text-ink/70">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={draft?.email || ""}
            className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="birthDate" className="mb-2 block font-ui text-sm font-medium text-ink/70">
            Birth date
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            required
            defaultValue={draft?.birthDate || ""}
            className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink focus:border-gold focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="birthTime" className="mb-2 block font-ui text-sm font-medium text-ink/70">
            Birth time
          </label>
          <input
            id="birthTime"
            name="birthTime"
            type="time"
            required={isEssential}
            defaultValue={draft?.birthTime || ""}
            className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink focus:border-gold focus:outline-none"
          />
          <p className="mt-1 text-xs text-ink/42">
            {isAutomated
              ? "Required for the automated Essential reading, because it calculates Rising sign and chart ruler."
              : "Exact time gives the best house analysis."}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="birthCity" className="mb-2 block font-ui text-sm font-medium text-ink/70">
          Birth city and country
        </label>
        <input
          id="birthCity"
          name="birthCity"
          type="text"
          required
          defaultValue={draft?.birthCity || ""}
          className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
          placeholder="Porto Alegre, Brazil"
        />
      </div>

      <div>
        <label htmlFor="focus" className="mb-2 block font-ui text-sm font-medium text-ink/70">
          Main focus
        </label>
        <select
          id="focus"
          name="focus"
          defaultValue={draft?.focus || "general"}
          className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink focus:border-gold focus:outline-none"
        >
          <option value="general">General overview</option>
          <option value="purpose">Purpose and direction</option>
          <option value="love">Love and relationships</option>
          <option value="career">Career and vocation</option>
          <option value="money">Money and self-worth</option>
          <option value="emotions">Emotional patterns</option>
          <option value="spiritual">Spiritual direction</option>
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="mb-2 block font-ui text-sm font-medium text-ink/70">
          {isAutomated ? "Optional support note" : "Anything you want considered"}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={draft?.notes || ""}
          className="w-full resize-y border border-ink/15 bg-white px-4 py-3 font-body text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
          placeholder={
            isAutomated
              ? "City spelling, birth time context, or anything support should know. The Essential reading itself is generated automatically from chart data."
              : "Specific questions, context, or topics you want prioritized."
          }
        />
      </div>

      {isSynastry && (
        <div>
          <label htmlFor="partnerData" className="mb-2 block font-ui text-sm font-medium text-ink/70 text-aubergine font-bold">
            Partner's birth details
          </label>
          <textarea
            id="partnerData"
            name="partnerData"
            required
            rows={4}
            defaultValue={draft?.partnerData || ""}
            className="w-full resize-y border border-aubergine/15 bg-aubergine/[0.02] px-4 py-3 font-body text-ink placeholder:text-ink/40 focus:border-aubergine focus:outline-none"
            placeholder="Please provide: First Name, Date of Birth, Exact Time (or unknown), and Birth City/Country."
          />
        </div>
      )}

      <label className="flex gap-3 border border-ink/10 bg-white/55 p-4 text-sm leading-relaxed text-ink/62">
        <input
          type="checkbox"
          name="newsletter"
          defaultChecked={draft?.newsletter === "yes"}
          className="mt-1 h-4 w-4 accent-gold"
        />
        Send occasional astrology notes and reading availability updates.
      </label>

      <label className="flex gap-3 border border-ink/10 bg-white/55 p-4 text-sm leading-relaxed text-ink/62">
        <input type="checkbox" required className="mt-1 h-4 w-4 accent-gold" />
        I understand this is a written astrology reading for reflection and education, not medical,
        legal, financial, psychological, or guaranteed predictive advice.
      </label>

      {error && (
        <p className="border border-rose/35 bg-rose/10 px-4 py-3 text-sm text-aubergine">
          {error}
        </p>
      )}

      {(isEssential || isFocused) && (
        <div className="mb-2 mt-4 border border-gold/30 bg-aubergine/[0.04] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.03)]">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark/80">
            Want the full picture?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            {isEssential
              ? "Upgrade to the Complete Reading for $97 — includes full house analysis, aspects, and a hand-written synthesis delivered as PDF."
              : "A focused study is great, but a Complete Reading ($97) shows how love, career, and money intertwine across your entire chart."}
          </p>
          <a
            href="/checkout/complete"
            className="mt-3 inline-block font-ui text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-aubergine underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold-dark"
          >
            Switch to Complete Reading - $97
          </a>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full mt-4"
        disabled={pending}
        analytics={{
          event: "cta_click",
          params: {
            cta_label: "Continue to Secure Payment",
            cta_location: "custom_checkout",
            offer_tier: tier,
          },
        }}
      >
        {pending ? "Preparing Payment..." : "Continue to Secure Payment"}
      </Button>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-ink/65">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-[0.65rem]">🔒</span>
          <span className="text-[0.7rem] font-semibold tracking-wide uppercase font-ui leading-tight">Stripe Secure</span>
        </div>
        <div className="flex items-center gap-2 text-ink/65">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-[0.65rem]">✉️</span>
          <span className="text-[0.7rem] font-semibold tracking-wide uppercase font-ui leading-tight">{isEssential ? "Instant Delivery" : "72h Delivery"}</span>
        </div>
        <div className="flex items-center gap-2 text-ink/65">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-[0.65rem]">📄</span>
          <span className="text-[0.7rem] font-semibold tracking-wide uppercase font-ui leading-tight">Written format</span>
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-ink/42">
        Your card payment is completed on Stripe. Your birth details are saved in this browser so
        the confirmation page can send the delivery details.
      </p>
    </form>
  );
}
