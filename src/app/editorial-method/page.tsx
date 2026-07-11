import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Editorial Method",
  description:
    "How the Mystic Birth Chart Editorial Studio researches, structures, reviews, and updates traditional-first astrology content.",
  path: "/editorial-method",
});

export default function EditorialMethodPage() {
  return (
    <>
      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Editorial Method", href: "/editorial-method" },
            ]}
          />
          <p className="mb-4 mt-7 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/75">
            {siteConfig.editorialName}
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            How the reading room is written.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ivory/66">
            A method-led editorial standard for traditional astrology, clear
            explanation, and responsible interpretation.
          </p>
        </div>
      </section>

      <section className="reading-area">
        <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
          <div className="article-prose">
            <h2>Structure Before Keywords</h2>
            <p>
              Articles begin with the astrological structure relevant to the
              topic: planet, sign, house, ruler, sect, condition, aspect, timing
              technique, or repeated testimony. We avoid treating one placement
              as a complete personality or guaranteed outcome.
            </p>

            <h2>Traditional-First, Modern When Useful</h2>
            <p>
              Traditional concepts provide the organizing framework. Modern
              language is used when it makes the technique clearer and more
              practical, not to erase the source method or turn every symbol into
              a psychological label.
            </p>

            <h2>Editorial Review</h2>
            <p>
              Priority articles are checked for internal consistency, readable
              definitions, non-fatalistic language, links to related concepts,
              and a clear distinction between educational content and personal
              chart interpretation. Updated dates are shown when the published
              article has materially changed.
            </p>

            <h2>Commercial Transparency</h2>
            <p>
              The Essential Birth Chart Reading is described as automated. The
              Complete Natal Reading is described as individually analyzed,
              prepared, and reviewed. Editorial articles may link to these
              products, but the educational explanation must remain useful on its
              own.
            </p>

            <h2>Boundaries</h2>
            <p>
              Mystic Birth Chart does not publish medical or psychological
              diagnosis, legal or financial instruction, guaranteed prediction,
              fear-based placement claims, or invented social proof. Hermetic and
              Kabbalistic subjects are included only when directly grounded in
              astrology.
            </p>

            <h2>Corrections and Contact</h2>
            <p>
              To flag a factual, technical, or accessibility issue, email{" "}
              <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
              For the studio&apos;s operating model and product process, read the{" "}
              <Link href="/about">About page</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
