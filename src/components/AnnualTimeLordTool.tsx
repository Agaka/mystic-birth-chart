"use client";

import { IconCalendarTime, IconChevronRight, IconPlanet, IconShieldCheck } from "@tabler/icons-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { calculateAnnualProfection, type AnnualProfectionResult } from "@/lib/annualProfection";
import { trackEvent } from "@/lib/analytics";
import { zodiacSigns, type ZodiacSign } from "@/lib/natalSnapshot";

function ordinal(value: number): string {
  if (value === 1) return "1st";
  if (value === 2) return "2nd";
  if (value === 3) return "3rd";
  return `${value}th`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export function AnnualTimeLordTool() {
  const [birthDate, setBirthDate] = useState("");
  const [risingSign, setRisingSign] = useState<ZodiacSign>("Aries");
  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<AnnualProfectionResult | null>(null);
  const [error, setError] = useState("");

  function calculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const born = new Date(`${birthDate}T00:00:00Z`);
    const reference = new Date(`${referenceDate}T00:00:00Z`);
    if (!birthDate || Number.isNaN(born.getTime()) || born > reference) {
      setError("Enter a valid birth date before the date you want to examine.");
      return;
    }
    setError("");
    setResult(calculateAnnualProfection(birthDate, risingSign, referenceDate));
    trackEvent("annual_time_lord_calculated", { funnel_step: "free-tool-result", product_category: "free-tool" });
    window.setTimeout(() => document.getElementById("time-lord-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  return (
    <div className="border border-gold/25 bg-ink text-ivory shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
      <div className="grid lg:grid-cols-[0.38fr_0.62fr]">
        <aside className="border-b border-gold/18 p-6 md:p-8 lg:border-b-0 lg:border-r">
          <IconCalendarTime aria-hidden="true" className="h-11 w-11 text-gold" stroke={1.35} />
          <p className="mt-6 font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold/72">Traditional annual timing</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold">Which planet governs your current year?</h2>
          <p className="mt-4 text-sm leading-relaxed text-ivory/62">Annual profections advance one whole-sign house on each birthday. The activated sign names the annual time lord, but its natal condition still determines how the year is managed.</p>
          <div className="mt-7 border-t border-ivory/10 pt-5 text-xs leading-relaxed text-ivory/48">
            Uses whole-sign houses and traditional rulers. The year runs birthday to birthday. This is educational timing, not a guaranteed prediction.
          </div>
        </aside>

        <div className="p-6 md:p-9">
          <form onSubmit={calculate} className="grid gap-5" noValidate>
            <div className="grid gap-5 md:grid-cols-3">
              <label className="grid gap-2 font-ui text-xs font-semibold text-ivory/72">Birth date<input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required className="min-h-12 border border-ivory/14 bg-midnight px-3 text-sm text-ivory outline-none focus:border-gold" /></label>
              <label className="grid gap-2 font-ui text-xs font-semibold text-ivory/72">Rising sign<select value={risingSign} onChange={(event) => setRisingSign(event.target.value as ZodiacSign)} className="min-h-12 border border-ivory/14 bg-midnight px-3 text-sm text-ivory outline-none focus:border-gold">{zodiacSigns.map((sign) => <option key={sign}>{sign}</option>)}</select></label>
              <label className="grid gap-2 font-ui text-xs font-semibold text-ivory/72">Date to examine<input type="date" value={referenceDate} onChange={(event) => setReferenceDate(event.target.value)} required className="min-h-12 border border-ivory/14 bg-midnight px-3 text-sm text-ivory outline-none focus:border-gold" /></label>
            </div>
            <p className="text-xs leading-relaxed text-ivory/45">Do not know your Rising sign? <Link href="/free-birth-chart" className="text-gold-light underline underline-offset-4">Calculate it in the free chart first.</Link></p>
            {error && <p className="border border-rose/35 bg-rose/10 px-4 py-3 text-sm text-ivory" role="alert">{error}</p>}
            <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 bg-gold px-6 py-3 font-ui text-sm font-semibold text-ink transition-colors hover:bg-gold-light">Reveal my annual time lord<IconChevronRight aria-hidden="true" className="h-4 w-4" /></button>
          </form>
        </div>
      </div>

      {result && (
        <section id="time-lord-result" className="scroll-mt-24 border-t border-gold/22 bg-ivory p-6 text-ink md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.66fr_0.34fr]">
            <div>
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark/80">Age {result.age} / House {result.house} activated</p>
              <h3 className="mt-3 font-heading text-4xl font-semibold text-aubergine md:text-6xl">A {result.sign} year, governed by {result.timeLord}.</h3>
              <p className="mt-5 text-lg leading-relaxed text-ink/68">From {formatDate(result.startsOn)} to {formatDate(result.endsOn)}, your {ordinal(result.house)} whole-sign house is profected. The annual field is <strong>{result.title.toLowerCase()}</strong>. {result.interpretation}</p>
            </div>
            <div className="border border-gold/25 bg-white/38 p-5">
              <IconPlanet aria-hidden="true" className="h-8 w-8 text-gold-dark" stroke={1.4} />
              <p className="mt-4 font-ui text-[0.66rem] font-semibold uppercase tracking-[0.17em] text-gold-dark/75">The time lord&apos;s work</p>
              <p className="mt-2 font-heading text-2xl font-semibold text-aubergine">{result.timeLord}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{result.planetTask}</p>
            </div>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <article className="border-l-2 border-gold bg-gold/8 p-5"><p className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark/78">Question for the year</p><p className="mt-3 font-heading text-2xl font-semibold text-aubergine">{result.question}</p></article>
            <article className="border border-aubergine/12 bg-white/35 p-5"><div className="flex gap-3"><IconShieldCheck aria-hidden="true" className="h-6 w-6 shrink-0 text-gold-dark" /><p className="text-sm leading-relaxed text-ink/64">The time lord is not interpreted from its name alone. A full forecast checks its natal sign, house, dignity, sect, aspects, solar-return position, and major transits.</p></div></article>
          </div>

          <div className="mt-10">
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark/78">Your twelve-year cycle</p>
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-gold/20 bg-gold/20 sm:grid-cols-3 lg:grid-cols-6">
              {result.cycle.map((item) => <div key={item.age} className={`min-h-28 bg-ivory p-4 ${item.age === result.age ? "shadow-[inset_0_0_0_2px_#b88a3a]" : ""}`}><p className="font-ui text-[0.62rem] uppercase tracking-[0.14em] text-ink/42">Age {item.age}</p><p className="mt-2 font-heading text-xl font-semibold text-aubergine">House {item.house}</p><p className="mt-1 text-xs text-ink/56">{item.sign} / {item.timeLord}</p></div>)}
            </div>
          </div>

          <div className="mt-10 border border-gold/25 bg-aubergine p-6 text-ivory md:flex md:items-center md:justify-between md:gap-8">
            <div><p className="font-ui text-xs font-semibold uppercase tracking-[0.17em] text-gold-light/75">Put the year inside the natal chart</p><h4 className="mt-2 font-heading text-3xl font-semibold">A forecast explains what {result.timeLord} actually governs for you.</h4><p className="mt-3 max-w-2xl text-sm leading-relaxed text-ivory/62">The hand-prepared Year Ahead Reading connects this profection with the natal chart, solar return, and major transits.</p></div>
            <Button href="/year-ahead-astrology-reading" size="md" className="mt-5 shrink-0 md:mt-0" analytics={{ event: "cta_click", params: { cta_location: "annual_time_lord_result", product_id: "year-ahead", product_category: "reading" } }}>Explore the Year Ahead Reading</Button>
          </div>
        </section>
      )}
    </div>
  );
}
