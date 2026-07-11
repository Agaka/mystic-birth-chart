"use client";

import {
  IconBriefcase,
  IconChartDots,
  IconClock,
  IconHeart,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

const needs = [
  {
    id: "whole-chart",
    label: "My whole chart",
    product: "Essential Birth Chart Reading",
    offerId: "basic",
    href: "#offer-basic",
    reason: "The clearest starting point when you want the chart structure before choosing a narrower theme.",
    icon: IconChartDots,
  },
  {
    id: "love",
    label: "Love and relationships",
    product: "Love & Relationship Pattern",
    offerId: "love",
    href: "#offer-love",
    reason: "A focused reading of Venus, relationship houses, attachment patterns, and repeated partnership themes.",
    icon: IconHeart,
  },
  {
    id: "career",
    label: "Career and vocation",
    product: "Career & Vocation",
    offerId: "career",
    href: "#offer-career",
    reason: "Best when work, direction, visibility, authority, and the use of your skills are the real question.",
    icon: IconBriefcase,
  },
  {
    id: "timing",
    label: "Current timing",
    product: "12-Month Transit Forecast",
    offerId: "year-ahead",
    href: "#offer-year-ahead",
    reason: "Built for the current phase: profections, solar return themes, and the major transits shaping the year.",
    icon: IconClock,
  },
  {
    id: "compatibility",
    label: "Compatibility",
    product: "Synastry & Compatibility",
    offerId: "synastry",
    href: "#offer-synastry",
    reason: "Use this when the question belongs to the interaction between two complete charts, not one placement.",
    icon: IconUsers,
  },
  {
    id: "esoteric",
    label: "Esoteric practice",
    product: "Hermetic Kabbalah Reading",
    offerId: "kabbalah",
    href: "#offer-kabbalah",
    reason: "For chart-led Hermetic work involving planetary, decanic, and devotional correspondences.",
    icon: IconSparkles,
  },
] as const;

export function ReadingNeedSelector() {
  const [selectedId, setSelectedId] = useState<(typeof needs)[number]["id"]>("whole-chart");
  const selected = needs.find((need) => need.id === selectedId) ?? needs[0];

  function chooseNeed(need: (typeof needs)[number]) {
    setSelectedId(need.id);
    trackEvent("reading_recommendation_selected", {
      product_id: need.offerId,
      product_category: "reading",
      funnel_step: "recommendation",
    });
  }

  return (
    <section aria-labelledby="reading-need-title" className="border border-gold/22 bg-white/32 p-5 md:p-8">
      <h2 id="reading-need-title" className="font-heading text-3xl font-semibold text-aubergine md:text-4xl">
        What would you like clarity about?
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/62">
        Choose the question closest to yours. The full catalog remains below, and this selector only points you toward a useful starting place.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {needs.map((need) => {
          const Icon = need.icon;
          const active = need.id === selectedId;
          return (
            <button
              key={need.id}
              type="button"
              onClick={() => chooseNeed(need)}
              aria-pressed={active}
              className={`flex min-h-16 items-center gap-3 border px-4 py-3 text-left font-ui text-sm font-semibold transition-colors ${
                active
                  ? "border-gold bg-gold/14 text-aubergine"
                  : "border-ink/12 bg-white/45 text-ink/68 hover:border-gold/45 hover:text-aubergine"
              }`}
            >
              <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-gold-dark" stroke={1.7} />
              {need.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 border-l-2 border-gold bg-ivory/65 px-5 py-5" aria-live="polite">
        <p className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-gold-dark/75">
          Recommended starting point
        </p>
        <p className="mt-2 font-heading text-2xl font-semibold text-aubergine">
          {selected.product}
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65">
          {selected.reason}
        </p>
        <a
          href={selected.href}
          className="mt-4 inline-flex min-h-11 items-center font-ui text-sm font-semibold text-aubergine underline decoration-gold/55 underline-offset-4"
          onClick={() =>
            trackEvent("select_item", {
              product_id: selected.offerId,
              product_category: "reading",
              cta_location: "reading_need_selector",
            })
          }
        >
          See this reading
        </a>
      </div>
    </section>
  );
}
