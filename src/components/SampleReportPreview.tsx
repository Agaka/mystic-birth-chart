const sampleSections = [
  {
    title: "Chart Overview",
    content:
      "This fictional chart concentrates water and cardinal testimony around the private and relational axes. The reading begins there because the pattern repeats before any single placement is interpreted.",
  },
  {
    title: "Ascendant and Chart Ruler",
    content:
      "Libra rises, so Venus leads the chart. Venus is not read as a generic love symbol; her sign, house, condition, rulerships, and aspects show where the life seeks proportion and where harmony becomes costly.",
  },
  {
    title: "Sect and Planetary Condition",
    content:
      "This is a night chart. Venus and the Moon become especially important, while Saturn and Mars are judged through the protections and pressures available to them after sunset.",
  },
  {
    title: "Sun, Moon and Rising in Context",
    content:
      "Scorpio Sun, Cancer Moon, and Libra Rising describe depth, emotional memory, and a socially measured doorway. The synthesis matters because the chart wants truth without sacrificing connection.",
  },
  {
    title: "Angular Emphasis",
    content:
      "Planets close to the angles become louder in lived experience. Here, the 4th and 10th house axis makes home, ancestry, public responsibility, and the tension between privacy and visibility central.",
  },
  {
    title: "Houses and House Rulers",
    content:
      "Each life area is followed through its ruler. The relationship story, for example, is not confined to the 7th house; its ruler carries the question into another house and joins it to a second topic.",
  },
  {
    title: "Important Aspects",
    content:
      "A close Moon-Saturn contact repeats themes of emotional duty, caution, and earned safety. Venus-Mars testimony adds attraction and friction, making relationship choices unusually formative.",
  },
  {
    title: "Love and Relationship Patterns",
    content:
      "The chart seeks reciprocity but distrusts shallow reassurance. The work is learning to name intensity early, before politeness turns into resentment or testing.",
  },
  {
    title: "Career and Vocation",
    content:
      "The Midheaven and its ruler point toward work that rewards patience, judgment, and responsibility. Recognition grows through competence rather than constant visibility.",
  },
  {
    title: "Money and Self-Worth",
    content:
      "The 2nd house ruler connects resources to emotional security. Spending and saving are therefore not only practical habits; they become ways of regulating uncertainty and preserving autonomy.",
  },
  {
    title: "Main Tensions",
    content:
      "The chart repeatedly asks whether emotional protection can coexist with honest relationship. Avoidance preserves calm briefly, but directness creates the deeper stability the chart actually wants.",
  },
  {
    title: "Integration Notes",
    content:
      "The strongest testimonies converge around trust, measured disclosure, and the construction of durable safety. These are not separate themes; they are different expressions of the same architecture.",
  },
  {
    title: "Practical Closing Synthesis",
    content:
      "Build structures that let truth arrive before crisis. Choose work, relationships, and financial habits that reward steadiness without demanding emotional silence.",
  },
] as const;

const contents = [
  "Chart overview",
  "Ascendant and chart ruler",
  "Sect and planetary condition",
  "Sun, Moon and Rising in context",
  "Angular emphasis",
  "Houses and house rulers",
  "Important aspects",
  "Love and relationship patterns",
  "Career and vocation",
  "Money and self-worth",
  "Main tensions",
  "Integration notes",
  "Practical closing synthesis",
] as const;

export function SampleReportPreview({ compact = false }: { compact?: boolean }) {
  const visibleSections = compact ? sampleSections.slice(0, 4) : sampleSections;

  return (
    <div className="relative">
      <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
        <span className="inline-block whitespace-nowrap bg-gold px-4 py-1 font-ui text-xs font-semibold uppercase tracking-widest text-ink">
          Fictional Sample Reading
        </span>
      </div>

      <article className="overflow-hidden border border-gold/25 bg-ivory text-ink shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <header className="bg-gradient-to-b from-aubergine to-ink p-8 text-center md:p-12">
          <p className="mb-3 font-ui text-xs uppercase tracking-[0.2em] text-gold/75">
            Mystic Birth Chart Complete Natal Reading
          </p>
          <h3 className="font-heading text-2xl font-medium text-ivory md:text-3xl">
            Scorpio Sun / Cancer Moon / Libra Rising
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ivory/58">
            Fictional example, not a real client or testimonial. Representative of
            the tone and structure of an individually prepared Complete reading.
          </p>
        </header>

        {!compact && (
          <section className="border-b border-gold/18 bg-ivory-dark/55 p-7 md:p-10" aria-labelledby="sample-contents-title">
            <h4 id="sample-contents-title" className="font-heading text-2xl font-semibold text-aubergine">
              Table of Contents
            </h4>
            <ol className="mt-5 grid gap-x-8 gap-y-2 text-sm text-ink/65 sm:grid-cols-2">
              {contents.map((item, index) => (
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
            <section key={section.title} aria-labelledby={`sample-section-${index}`}>
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-gold/35 font-ui text-xs font-semibold text-aubergine">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h4 id={`sample-section-${index}`} className="font-heading text-xl font-semibold text-aubergine">
                    {section.title}
                  </h4>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/72">
                    {section.content}
                  </p>
                </div>
              </div>
              <div className="mt-6 h-px bg-gold/15" />
            </section>
          ))}
        </div>

        <footer className="border-t border-gold/15 bg-ivory-dark p-6 text-center">
          <p className="font-ui text-xs leading-relaxed text-ink/52">
            Every Complete reading is individually analyzed and prepared from the customer&apos;s chart. The structure varies when the chart requires a different emphasis.
          </p>
        </footer>
      </article>
    </div>
  );
}
