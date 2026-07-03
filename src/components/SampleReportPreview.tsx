export function SampleReportPreview() {
  const sections = [
    {
      number: "I",
      title: "Core Identity Pattern",
      content:
        "Your Sun in Scorpio in the 8th house suggests an identity shaped by depth, privacy, crisis, trust, and transformation. You are not built for shallow answers. Your chart asks you to understand what other people avoid.",
    },
    {
      number: "II",
      title: "Emotional Pattern",
      content:
        "With the Moon in Cancer in the 4th house, emotional safety is not optional. Your instincts are protective, memory-based, and deeply responsive to the atmosphere of home, family, and belonging.",
    },
    {
      number: "III",
      title: "Love & Self-Worth",
      content:
        "Venus in Libra in the 7th house places relationship, beauty, fairness, and reciprocity at the center of value. The gift is social intelligence. The lesson is not losing your own center while seeking harmony.",
    },
    {
      number: "IV",
      title: "Career & Direction",
      content:
        "The Midheaven in Capricorn, with Saturn emphasized, points to a public path built slowly through competence, responsibility, and earned authority. Recognition is not instant, but it can become lasting.",
    },
    {
      number: "V",
      title: "Main Inner Conflict",
      content:
        "The tension between emotional intensity and relational peace creates a repeating question: can you stay honest without destroying harmony, and can you keep harmony without hiding the truth?",
    },
    {
      number: "VI",
      title: "Integration Notes",
      content:
        "The thread connecting the chart is transformation through emotional honesty. The chart does not ask you to choose between depth and love. It asks you to build a life where both can survive.",
    },
  ];

  return (
    <div className="relative">
      <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
        <span className="inline-block bg-gold px-4 py-1 font-ui text-xs font-semibold uppercase tracking-widest text-ink">
          Sample Reading
        </span>
      </div>

      <div className="overflow-hidden border border-gold/25 bg-ivory text-ink shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <div className="bg-gradient-to-b from-aubergine to-ink p-8 text-center md:p-12">
          <p className="mb-3 font-ui text-xs uppercase tracking-[0.2em] text-gold/75">
            Mystic Birth Chart Reading
          </p>
          <h3 className="font-heading text-2xl font-medium text-ivory md:text-3xl">
            Sample: Scorpio Sun / Cancer Moon / Libra Rising
          </h3>
          <p className="mt-2 font-ui text-sm text-ivory/50">
            Fictional example. Not a real client.
          </p>
        </div>

        <div className="parchment-surface space-y-8 p-8 md:p-12">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-start gap-4">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-gold/35 font-ui text-xs font-semibold text-aubergine">
                  {section.number}
                </span>
                <div>
                  <h4 className="font-heading text-xl font-semibold text-aubergine">
                    {section.title}
                  </h4>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/70">
                    {section.content}
                  </p>
                </div>
              </div>
              <div className="mt-6 h-px bg-gold/15" />
            </div>
          ))}
        </div>

        <div className="border-t border-gold/15 bg-ivory-dark p-6 text-center">
          <p className="font-ui text-xs text-ink/45">
            Your reading is written from your own birth data and selected focus
            area.
          </p>
        </div>
      </div>
    </div>
  );
}
