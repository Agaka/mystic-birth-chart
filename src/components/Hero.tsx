import Image from "next/image";
import { Button } from "@/components/Button";
import { DecorativeAstroWheel } from "@/components/DecorativeAstroWheel";

interface HeroProps {
  eyebrow?: string;
  headline: string;
  subheadline: string;
  primaryCta?: { label: string; href: string; event?: string };
  secondaryCta?: { label: string; href: string; event?: string };
  imageSrc?: string;
  imageAlt?: string;
  trustItems?: string[];
  note?: string;
  compact?: boolean;
}

export function Hero({
  eyebrow,
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  imageSrc,
  imageAlt = "",
  trustItems = [],
  note,
  compact = false,
}: HeroProps) {
  if (imageSrc && !compact) {
    return (
      <section className="relative min-h-[700px] overflow-hidden bg-ink">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/82 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-ink/25" />

        <div className="relative z-10 mx-auto flex min-h-[700px] max-w-7xl items-center px-6 py-24 md:py-32">
          <div className="max-w-3xl">
            {eyebrow && (
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/85">
                {eyebrow}
              </p>
            )}

            <h1 className="mt-5 max-w-3xl font-heading text-4xl font-semibold leading-[1.04] text-ivory md:text-6xl lg:text-7xl">
              {headline}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory/75 md:text-xl">
              {subheadline}
            </p>

            {(primaryCta || secondaryCta) && (
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                {primaryCta && (
                  <Button
                    href={primaryCta.href}
                    size="lg"
                    analytics={{
                      event: primaryCta.event || "hero_primary_cta",
                      params: {
                        cta_location: "image_hero_primary",
                      },
                    }}
                  >
                    {primaryCta.label}
                  </Button>
                )}
                {secondaryCta && (
                  <Button
                    href={secondaryCta.href}
                    variant="secondary"
                    size="lg"
                    analytics={{
                      event: secondaryCta.event || "hero_free_chart_cta",
                      params: {
                        cta_location: "image_hero_secondary",
                      },
                    }}
                  >
                    {secondaryCta.label}
                  </Button>
                )}
              </div>
            )}

            {note && (
              <p className="mt-4 max-w-xl font-ui text-sm text-ivory/55">
                {note}
              </p>
            )}

            {trustItems.length > 0 && (
              <dl className="mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
                {trustItems.map((item) => {
                  const [label, value] = item.split("|");
                  return (
                    <div
                      key={item}
                      className="border border-ivory/12 bg-ink/50 px-4 py-3 backdrop-blur-sm"
                    >
                      <dt className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold/70">
                        {label}
                      </dt>
                      <dd className="mt-1 text-sm leading-snug text-ivory/80">
                        {value || label}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-b from-midnight via-aubergine/30 to-midnight ${
        compact ? "py-20 md:py-28" : "py-28 md:py-40"
      }`}
    >
      <DecorativeAstroWheel />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        {eyebrow && (
          <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/75">
            {eyebrow}
          </p>
        )}

        <h1
          className={`font-heading font-medium tracking-tight text-ivory animate-fade-in ${
            compact
              ? "text-3xl md:text-5xl"
              : "text-4xl md:text-6xl lg:text-7xl"
          }`}
        >
          {headline}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up font-body text-lg leading-relaxed text-ivory/70 md:mt-8 md:text-xl">
          {subheadline}
        </p>

        {(primaryCta || secondaryCta) && (
          <div className="mt-10 flex animate-fade-in-up flex-col items-center justify-center gap-4 [animation-delay:0.2s] sm:flex-row">
            {primaryCta && (
              <Button
                href={primaryCta.href}
                size="lg"
                analytics={{
                    event: primaryCta.event || "cta_click",
                  params: {
                    cta_location: compact ? "compact_hero_primary" : "hero_primary",
                  },
                }}
              >
                {primaryCta.label}
              </Button>
            )}
            {secondaryCta && (
              <Button
                href={secondaryCta.href}
                variant="secondary"
                size="lg"
                analytics={{
                    event: secondaryCta.event || "cta_click",
                  params: {
                    cta_location: compact ? "compact_hero_secondary" : "hero_secondary",
                  },
                }}
              >
                {secondaryCta.label}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  );
}
