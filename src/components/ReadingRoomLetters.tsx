"use client";

import { useEffect } from "react";
import { IconMail } from "@tabler/icons-react";
import { trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/lib/site";

export function ReadingRoomLetters({ location }: { location: string }) {
  const signupUrl = siteConfig.newsletterUrl;

  useEffect(() => {
    if (!signupUrl) return;
    trackEvent("free_chart_email_offer_viewed", {
      funnel_step: "email-offer",
      cta_location: location,
    });
  }, [location, signupUrl]);

  if (!signupUrl) return null;

  return (
    <section className="border-t border-gold/22 bg-ivory-dark/55 px-6 py-10 text-ink md:px-10" aria-labelledby="reading-room-letters-title">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold/35 bg-white/40 text-gold-dark">
            <IconMail aria-hidden="true" className="h-6 w-6" stroke={1.6} />
          </span>
          <div>
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark/78">
              The Reading Room Letters
            </p>
            <h3 id="reading-room-letters-title" className="mt-2 font-heading text-3xl font-semibold text-aubergine">
              Email me this preview and send me new notes from the reading room.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/62">
              Optional. You will receive this chart preview, new astrology essays,
              and occasional reading availability. The result above remains visible
              whether you subscribe or not.
            </p>
          </div>
        </div>

        <form
          action={signupUrl}
          method="post"
          className="mt-6 grid gap-3"
          onSubmit={() =>
            trackEvent("free_chart_email_opt_in", {
              funnel_step: "email-opt-in",
              cta_location: location,
            })
          }
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor={`reading-room-email-${location}`}>
              Email address
            </label>
            <input
              id={`reading-room-email-${location}`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="your@email.com"
              className="min-h-12 flex-1 border border-ink/16 bg-white px-4 font-ui text-sm text-ink outline-none placeholder:text-ink/35 focus:border-gold"
            />
            <button
              type="submit"
              className="min-h-12 bg-gold px-6 font-ui text-sm font-semibold text-ink transition-colors hover:bg-gold-light"
            >
              Send My Preview
            </button>
          </div>
          <label className="flex items-start gap-3 text-xs leading-relaxed text-ink/58">
            <input type="checkbox" name="consent" value="yes" required className="mt-0.5 h-4 w-4 accent-gold" />
            I agree to receive The Reading Room Letters and occasional reading
            availability emails. I can unsubscribe at any time.
          </label>
        </form>
      </div>
    </section>
  );
}
