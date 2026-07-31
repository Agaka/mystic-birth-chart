export type SampleReadingKind = "essential" | "complete" | "kabbalah";

type SampleSection = {
  title: string;
  content: string;
};

type SampleReading = {
  eyebrow: string;
  title: string;
  subtitle: string;
  note: string;
  contents: readonly string[];
  sections: readonly SampleSection[];
  footer: string;
};

const samples: Record<SampleReadingKind, SampleReading> = {
  essential: {
    eyebrow: "Mystic Birth Chart Essential Reading",
    title: "A first synthesis of the chart",
    subtitle:
      "An editorial demonstration of the automated report: concise enough to enter quickly, structured enough to reveal why the whole chart matters.",
    note: "Editorial demonstration. The chart figure and narrative are fictional, not a client story or testimonial.",
    contents: [
      "Your chart in one sentence",
      "The three dominant testimonies",
      "Sun, Moon, Rising, and chart ruler",
      "Love, work, and emotional rhythm",
      "Questions for the next stage of study",
    ],
    sections: [
      {
        title: "Your chart in one sentence",
        content:
          "This chart learns to turn sensitivity into reliable discernment: it notices more than it says, then becomes strongest when it gives that perception a practical form.",
      },
      {
        title: "The architecture that repeats",
        content:
          "The report does not treat the Sun, Moon, and Rising as three personality labels. It identifies the ruler of the Ascendant, the sect light, and the testimonies that repeat between angles, houses, and aspects, then explains why one pattern carries more weight than another.",
      },
      {
        title: "What the first synthesis opens",
        content:
          "The Essential reading connects work, closeness, and emotional rhythm to the same natal structure. It gives language for what is already familiar, while leaving the fuller hierarchy of rulers, houses, and timing for a deeper study.",
      },
    ],
    footer:
      "The Essential Reading is generated automatically from submitted birth data and delivered instantly by email. It is a complete first synthesis, not a hand-prepared report.",
  },
  complete: {
    eyebrow: "Mystic Birth Chart Complete Natal Reading",
    title: "A traditional natal study, read as one structure",
    subtitle:
      "An editorial demonstration of the fuller report: hierarchy first, then the life areas shaped by that hierarchy.",
    note: "Editorial demonstration. The chart figure and narrative are fictional, not a client story or testimonial.",
    contents: [
      "Chart architecture and dominant testimony",
      "Ascendant, chart ruler, and sect",
      "Planetary condition and house rulers",
      "Love, vocation, resources, and direction",
      "Practical synthesis and questions for study",
    ],
    sections: [
      {
        title: "Chart architecture",
        content:
          "The reading begins by ranking what is structurally important: the Ascendant and its ruler, the sect light, angular planets, house rulers, dignity, and repeated traditional testimony. This avoids the familiar mistake of allowing the closest isolated aspect to tell the whole story.",
      },
      {
        title: "Relationship patterns",
        content:
          "A relationship chapter opens with the seventh whole-sign house and its ruler before it considers Venus, the Moon, and Mars. Attraction, trust, conflict, and commitment are treated as related questions, not as a promise about one future partner.",
      },
      {
        title: "Vocation and direction",
        content:
          "Work is read through the tenth house, Midheaven, vocational rulers, and their relationship to the chart ruler. The practical conclusion describes coherent forms of contribution and pressure points to manage, rather than declaring a single destined profession.",
      },
      {
        title: "The closing synthesis",
        content:
          "The final pages bring the evidence back into daily life: a resource to rely on, a pressure point to observe, a practical direction, and a question worth carrying forward. The purpose is clearer self-observation, not a fixed verdict about the future.",
      },
    ],
    footer:
      "Every Complete Natal Reading is individually analyzed and prepared from the customer's chart. Its emphasis changes when the chart requires a different hierarchy.",
  },
  kabbalah: {
    eyebrow: "Mystic Birth Chart Hermetic Kabbalah Reading",
    title: "A chart-led practice, not an invented spiritual identity",
    subtitle:
      "An editorial demonstration of how the natal chart can be translated into an ethical Hermetic practice without treating symbolism as a guarantee.",
    note: "Editorial demonstration. Correspondences are drawn only from Mystic Birth Chart's reviewed source table; no client is assigned an unverifiable spiritual identity.",
    contents: [
      "The chart's spiritual thesis",
      "Planetary hierarchy and the Tree of Life",
      "Decanal and planetary correspondences",
      "A seven-day practice rhythm",
      "Reflection and safe devotional boundaries",
    ],
    sections: [
      {
        title: "The spiritual thesis of the chart",
        content:
          "The reading begins with the same traditional hierarchy used in a natal study: chart ruler, sect light, dominant planets, and the signatures that need cultivation or balance. Hermetic language is added only after the chart itself has been read.",
      },
      {
        title: "Correspondence as a practice map",
        content:
          "Planetary and decanal correspondences are presented as a careful symbolic vocabulary. A sphere can suggest a quality to contemplate, a rhythm to observe, or a devotional exercise to try; it does not prove special status, guarantee protection, or override ordinary judgment.",
      },
      {
        title: "The practical rhythm",
        content:
          "The report turns the chart into a modest and repeatable practice: one principal emphasis, supporting planetary days and hours, journal prompts, and safe contemplative actions. The aim is steadiness, attention, and ethical self-knowledge rather than spectacle.",
      },
    ],
    footer:
      "The Hermetic Kabbalah Reading is a traditional Western esoteric study. It does not promise initiation, supernatural certainty, material results, or control over another person.",
  },
};

export function SampleReportPreview({
  kind = "complete",
  compact = false,
}: {
  kind?: SampleReadingKind;
  compact?: boolean;
}) {
  const sample = samples[kind];
  const visibleSections = compact ? sample.sections.slice(0, 2) : sample.sections;

  return (
    <div className="relative">
      <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
        <span className="inline-block whitespace-nowrap bg-gold px-4 py-1 font-ui text-xs font-semibold uppercase tracking-widest text-ink">
          Editorial Sample
        </span>
      </div>

      <article className="overflow-hidden border border-gold/25 bg-ivory text-ink shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <header className="bg-aubergine p-8 text-center md:p-12">
          <p className="mb-3 font-ui text-xs uppercase tracking-[0.2em] text-gold-light/85">
            {sample.eyebrow}
          </p>
          <h3 className="font-heading text-3xl font-medium leading-tight text-ivory md:text-4xl">
            {sample.title}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ivory/72">
            {sample.subtitle}
          </p>
          <p className="mx-auto mt-4 max-w-xl font-ui text-[0.65rem] uppercase tracking-[0.12em] text-gold-light/75">
            {sample.note}
          </p>
        </header>

        {!compact && (
          <section
            className="border-b border-gold/18 bg-ivory-dark/55 p-7 md:p-10"
            aria-labelledby={`${kind}-sample-contents-title`}
          >
            <h4
              id={`${kind}-sample-contents-title`}
              className="font-heading text-2xl font-semibold text-aubergine"
            >
              Inside this reading
            </h4>
            <ol className="mt-5 grid gap-x-8 gap-y-2 text-sm text-ink/65 sm:grid-cols-2">
              {sample.contents.map((item, index) => (
                <li key={item} className="flex gap-3 border-b border-gold/12 py-2">
                  <span className="font-ui text-xs text-gold-dark">{String(index + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="parchment-surface space-y-8 p-8 md:p-12">
          {visibleSections.map((section, index) => (
            <section key={section.title} aria-labelledby={`${kind}-sample-section-${index}`}>
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-gold/35 font-ui text-xs font-semibold text-aubergine">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4
                    id={`${kind}-sample-section-${index}`}
                    className="font-heading text-2xl font-semibold text-aubergine"
                  >
                    {section.title}
                  </h4>
                  <p className="mt-2 text-[0.98rem] leading-relaxed text-ink/72">
                    {section.content}
                  </p>
                </div>
              </div>
              {index < visibleSections.length - 1 && <div className="mt-6 h-px bg-gold/15" />}
            </section>
          ))}
        </div>

        <footer className="border-t border-gold/15 bg-ivory-dark p-6 text-center">
          <p className="mx-auto max-w-2xl font-ui text-xs leading-relaxed text-ink/60">{sample.footer}</p>
        </footer>
      </article>
    </div>
  );
}
