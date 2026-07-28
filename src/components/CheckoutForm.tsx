"use client";

import {
  IconFileText,
  IconLock,
  IconMail,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { trackEvent } from "@/lib/analytics";
import {
  checkoutSessionKey,
  freeChartSessionKey,
  readSessionDraft,
  writeSessionDraft,
  type FreeChartSessionDraft,
} from "@/lib/chartSession";
import type { ReadingTier } from "@/lib/orders";
import { siteConfig } from "@/lib/site";

interface CheckoutFormProps {
  tier: ReadingTier;
  productDelivery: string;
  productFormat: string;
}

interface CheckoutDraft {
  tier: ReadingTier;
  name: string;
  email: string;
  birthDate: string;
  birthTime: string;
  timeUnknown: boolean;
  birthCity: string;
  focus: string;
  notes: string;
  partnerData?: string;
  annualCycleYear?: string;
  annualReturnCity?: string;
  newsletter: boolean;
}

export function CheckoutForm({
  tier,
  productDelivery,
  productFormat,
}: CheckoutFormProps) {
  const isEssential = tier === "basic";
  const isFocused = tier === "love" || tier === "career";
  const isSynastry = tier === "synastry";
  const isAnnual = tier === "year-ahead" || tier === "dossier";
  const isAutomated = isEssential;
  
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const checkoutDraft = readSessionDraft<CheckoutDraft>(checkoutSessionKey);
        if (checkoutDraft?.tier === tier) {
          setTimeUnknown(Boolean(checkoutDraft.timeUnknown || checkoutDraft.birthTime === "unknown"));
          setDraft(checkoutDraft);
          return;
        }

        const freeChartDraft = readSessionDraft<FreeChartSessionDraft>(freeChartSessionKey);
        if (freeChartDraft && (tier === "basic" || tier === "complete")) {
          setDraft({
            tier,
            name: "",
            email: "",
            birthDate: freeChartDraft.birthDate,
            birthTime: freeChartDraft.birthTime,
            timeUnknown: freeChartDraft.timeUnknown,
            birthCity: freeChartDraft.birthCity,
            focus: freeChartDraft.focus,
            notes: "",
            newsletter: false,
          });
          setTimeUnknown(freeChartDraft.timeUnknown);
        }
      } catch {
        window.sessionStorage.removeItem(checkoutSessionKey);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [tier]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector<HTMLElement>(":invalid");
      setError("Check the highlighted fields before continuing to payment.");
      trackEvent("checkout_validation_error", {
        product_id: tier,
        funnel_step: "checkout-details",
      });
      firstInvalid?.focus();
      return;
    }

    setError("");
    submittingRef.current = true;
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const checkoutDraft: CheckoutDraft = {
      tier,
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      birthDate: String(formData.get("birthDate") || ""),
      birthTime: timeUnknown ? "unknown" : String(formData.get("birthTime") || ""),
      timeUnknown,
      birthCity: String(formData.get("birthCity") || ""),
      focus: String(formData.get("focus") || "general"),
      notes: String(formData.get("notes") || ""),
      partnerData: isSynastry ? String(formData.get("partnerData") || "") : undefined,
      annualCycleYear: isAnnual ? String(formData.get("annualCycleYear") || "") : undefined,
      annualReturnCity: isAnnual ? String(formData.get("annualReturnCity") || "") : undefined,
      newsletter: Boolean(formData.get("newsletter")),
    };

    try {
      writeSessionDraft(checkoutSessionKey, checkoutDraft);

      trackEvent("begin_checkout", {
        product_id: tier,
        product_category: "reading",
        funnel_step: "checkout-details",
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
          birthDate: checkoutDraft.birthDate,
          birthTime: checkoutDraft.birthTime,
          birthCity: checkoutDraft.birthCity,
          focus: checkoutDraft.focus,
          notes: checkoutDraft.notes,
          partnerData: checkoutDraft.partnerData || "",
          annualCycleYear: checkoutDraft.annualCycleYear || "",
          annualReturnCity: checkoutDraft.annualReturnCity || "",
          newsletter: checkoutDraft.newsletter,
          promotekitReferral: (window as any).promotekit_referral,
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

      trackEvent("payment_redirect", {
        product_id: tier,
        product_category: "reading",
        funnel_step: "stripe-payment",
      });
      window.location.href = destination;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout."
      );
      trackEvent("checkout_validation_error", {
        product_id: tier,
        funnel_step: "checkout-details",
      });
      submittingRef.current = false;
      setPending(false);
    }
  }

  return (
    <form
      key={draft?.tier || "empty"}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={pending}
      aria-describedby={error ? "checkout-error" : undefined}
      className="space-y-6"
    >
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
            autoComplete="name"
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
            autoComplete="email"
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
            autoComplete="bday"
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
            required={isEssential && !timeUnknown}
            disabled={timeUnknown}
            aria-describedby="checkout-birth-time-help"
            defaultValue={draft?.birthTime === "unknown" ? "" : draft?.birthTime || ""}
            className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:bg-ink/5 disabled:text-ink/40"
          />
          <p id="checkout-birth-time-help" className="mt-1 text-xs text-ink/52">
            {timeUnknown
              ? "The reading will use a noon estimate. Rising sign, houses, chart ruler, and day/night status will be provisional."
              : isAutomated
              ? "Required for the automated Essential reading, because it calculates Rising sign and chart ruler."
              : "Exact time gives the best house analysis."}
          </p>
          <label className="mt-3 flex min-h-11 items-start gap-3 text-sm leading-relaxed text-ink/65">
            <input
              type="checkbox"
              checked={timeUnknown}
              onChange={(event) => setTimeUnknown(event.target.checked)}
              className="mt-1 h-4 w-4 accent-gold"
            />
            <span>I do not know my exact birth time.</span>
          </label>
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
          autoComplete="address-level2"
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
            Partner&apos;s birth details
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

      {isAnnual && (
        <div className="grid grid-cols-1 gap-4 border border-gold/25 bg-gold/[0.04] p-4 sm:grid-cols-2">
          <div>
            <label htmlFor="annualCycleYear" className="mb-2 block font-ui text-sm font-medium text-ink/70">
              Annual cycle begins in
            </label>
            <input
              id="annualCycleYear"
              name="annualCycleYear"
              type="number"
              min="2020"
              max="2100"
              required
              defaultValue={draft?.annualCycleYear || new Date().getFullYear()}
              className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink focus:border-gold focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="annualReturnCity" className="mb-2 block font-ui text-sm font-medium text-ink/70">
              City for your solar return
            </label>
            <input
              id="annualReturnCity"
              name="annualReturnCity"
              type="text"
              required
              defaultValue={draft?.annualReturnCity || draft?.birthCity || ""}
              placeholder="City and country"
              className="w-full border border-ink/15 bg-white px-4 py-3 font-body text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
            />
          </div>
        </div>
      )}

      {siteConfig.newsletterUrl && (
        <label className="flex gap-3 border border-ink/10 bg-white/55 p-4 text-sm leading-relaxed text-ink/62">
          <input
            type="checkbox"
            name="newsletter"
            defaultChecked={draft?.newsletter === true}
            className="mt-1 h-4 w-4 accent-gold"
          />
          Send The Reading Room Letters and occasional reading availability
          updates. This choice is optional and separate from the purchase.
        </label>
      )}

      <label className="flex gap-3 border border-ink/10 bg-white/55 p-4 text-sm leading-relaxed text-ink/62">
        <input type="checkbox" required className="mt-1 h-4 w-4 accent-gold" />
        I understand this is a written astrology reading for reflection and education, not medical,
        legal, financial, psychological, or guaranteed predictive advice.
      </label>

      {error && (
        <p
          id="checkout-error"
          role="alert"
          aria-live="assertive"
          className="border border-rose/35 bg-rose/10 px-4 py-3 text-sm text-aubergine"
        >
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
          <Link
            href="/checkout/complete"
            className="mt-3 inline-flex min-h-11 items-center font-ui text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-aubergine underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold-dark"
          >
            Switch to Complete Reading - $97
          </Link>
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
            cta_location: "custom_checkout",
            product_id: tier,
          },
        }}
      >
        {pending ? "Preparing Payment..." : "Continue to Secure Payment"}
      </Button>

      <p className="text-center text-xs leading-relaxed text-ink/52">
        By continuing, you agree to the{" "}
        <Link href="/terms" className="underline decoration-gold/55 underline-offset-3">
          Terms
        </Link>
        ,{" "}
        <Link href="/privacy" className="underline decoration-gold/55 underline-offset-3">
          Privacy Policy
        </Link>
        , and{" "}
        <Link href="/refund-policy" className="underline decoration-gold/55 underline-offset-3">
          Refund Policy
        </Link>
        .
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-ink/65">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold-dark">
            <IconLock aria-hidden="true" className="h-4 w-4" stroke={1.8} />
          </span>
          <span className="text-[0.7rem] font-semibold tracking-wide uppercase font-ui leading-tight">Stripe Secure</span>
        </div>
        <div className="flex items-center gap-2 text-ink/65">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold-dark">
            <IconMail aria-hidden="true" className="h-4 w-4" stroke={1.8} />
          </span>
          <span className="text-[0.7rem] font-semibold tracking-wide uppercase font-ui leading-tight">
            {isEssential
              ? "Instant email"
              : productDelivery.replace("Hand-prepared and delivered ", "Delivery ")}
          </span>
        </div>
        <div className="flex items-center gap-2 text-ink/65">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold-dark">
            <IconFileText aria-hidden="true" className="h-4 w-4" stroke={1.8} />
          </span>
          <span className="text-[0.7rem] font-semibold tracking-wide uppercase font-ui leading-tight">
            {productFormat}
          </span>
        </div>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-ink/42">
        Your card payment is completed on Stripe. Your birth details are kept only in this browser
        session so the confirmation page can fulfill the order after payment.
      </p>
    </form>
  );
}
