import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const width = 612;
const height = 792;
const margin = 58;
const parchment = rgb(0.965, 0.934, 0.865);
const parchmentDark = rgb(0.88, 0.81, 0.68);
const ink = rgb(0.15, 0.09, 0.075);
const aubergine = rgb(0.235, 0.105, 0.09);
const gold = rgb(0.59, 0.39, 0.12);
const muted = rgb(0.38, 0.29, 0.23);
const deep = rgb(0.08, 0.05, 0.04);

const previewSections = {
  essential: [
    {
      label: "A FIRST SYNTHESIS",
      title: "Your chart in one sentence",
      body: "This editorial chart is organized by a quiet but durable task: turn sensitivity into useful structure, then let that structure become a place from which you can speak with confidence.\n\nAquarius rises, so Saturn carries the chart. Saturn is not read in isolation: its practical steadiness is repeated by the Virgo Sun, while the Pisces Moon keeps feeling, imagination, and permeability close to the surface.",
      bullets: ["Chart ruler: Saturn", "Core tension: structure and receptivity", "Reading method: repeated traditional testimony"],
      takeaway: "The free chart can name the doorway. The Essential Reading shows which pattern is doing the organizing.",
    },
    {
      label: "READING ORDER",
      title: "Why one placement is never enough",
      body: "A reading becomes personal when it stops treating every placement as equally loud. The report begins with the Ascendant, the ruler of the Ascendant, sect, the lights, angles, dignities, and repeating testimony.\n\nThat hierarchy changes the language of the report. Instead of giving a list of traits, it asks what keeps returning across the chart and what part of life is most likely to carry that pattern forward.",
      bullets: ["Ascendant and chart ruler first", "Lights and house rulers next", "Aspects used as supporting evidence"],
      takeaway: "The point is not more astrology words. It is better proportion.",
    },
    {
      label: "CHART RULER",
      title: "Saturn carries the chart",
      body: "With Aquarius rising, Saturn has an organizing office. In this editorial example, Saturn's earthy condition asks for commitments that can survive changing moods. It prefers a measured pace, a solid base, and work that becomes more convincing through repetition.\n\nThis does not make the reader cold or severe. It suggests that trust in their own timing is a central resource. When they build a container for their perceptions, they become less likely to confuse urgency with direction.",
      bullets: ["Resource: endurance", "Pressure point: excessive self-containment", "Practical direction: choose a pace you can maintain"],
      takeaway: "A chart ruler describes the kind of effort that gives the rest of the chart traction.",
    },
    {
      label: "SOLAR EXPRESSION",
      title: "The Virgo Sun needs a craft",
      body: "The Sun in Virgo gives the chart a need to improve, clarify, sort, and make something more workable. Recognition comes less from performance for its own sake than from being genuinely useful.\n\nPaired with Saturn's authority, this is a signature for patient refinement. The shadow is a private standard so exacting that the work is delayed until it feels beyond criticism. The more useful question is not whether it is perfect, but whether it is ready to enter the world.",
      bullets: ["Core expression: discernment", "Pressure point: over-editing", "Practical direction: publish the useful version"],
      takeaway: "The Sun shows where a person needs to stand behind their own contribution.",
    },
    {
      label: "LUNAR RHYTHM",
      title: "The Pisces Moon keeps the inner door open",
      body: "The Moon describes what restores continuity. In this sample, a Pisces Moon does not ask the reader to be endlessly available; it asks them to notice how easily atmosphere becomes information.\n\nThe practical task is to protect that sensitivity without making it the only authority. Rest, music, solitude, and unhurried reflection can be forms of maintenance. Clear boundaries make the Moon more perceptive, not less compassionate.",
      bullets: ["Need: emotional spaciousness", "Pressure point: absorbing too much", "Practical direction: name the boundary before the fatigue"],
      takeaway: "The Moon is most useful when its needs are given a rhythm rather than a crisis.",
    },
    {
      label: "RELATIONSHIPS",
      title: "Attraction and commitment are different questions",
      body: "The Essential Reading does not pretend to settle every relationship question. It begins by separating the experience of attraction from the conditions that make trust sustainable.\n\nFor this example, warmth is not enough on its own. The chart repeatedly asks for consistency, room to think, and a partner who can meet sensitivity without demanding immediate resolution. This is not a prediction about another person; it is a description of the conditions under which the reader can remain present.",
      bullets: ["Notice: how trust is built", "Observe: conflict timing", "Practice: state needs before withdrawing"],
      takeaway: "A useful relationship reading describes patterns of participation, not a guaranteed partner.",
    },
    {
      label: "WORK AND DIRECTION",
      title: "Contribution grows through useful precision",
      body: "The vocational thread in this fictional chart combines Saturn's patience with Virgo's desire to make things clearer. It favors work where analysis, editing, care, systems, research, or steady stewardship have visible value.\n\nThat does not name one destined profession. It describes a working environment: enough autonomy to think, a standard worth serving, and enough time for skill to become authority. The report translates this into choices around workload, collaboration, and development.",
      bullets: ["Strength: careful judgment", "Risk: waiting too long to be ready", "Direction: choose work that rewards refinement"],
      takeaway: "Vocation is read as a relationship with contribution, authority, and environment.",
    },
    {
      label: "NEXT STUDY",
      title: "A practical direction for the next month",
      body: "Choose one area that currently feels diffuse: a project, a conversation, a financial habit, or a private routine. Give it a small Saturnian form. Put it on the calendar, define its boundary, and review it at the end of four weeks.\n\nThe point is not to force a transformation. It is to let the chart's strongest pattern become observable in ordinary life. That is where a first synthesis becomes more than recognition.",
      bullets: ["One structure to create", "One boundary to name", "One question to revisit"],
      takeaway: "The full Essential Reading ends with usable observation, not a verdict about your fate.",
    },
  ],
  complete: [
    {
      label: "AT A GLANCE",
      title: "A chart built through deliberate form",
      body: "The Complete Reading takes the first synthesis further. In this editorial chart, Aquarius rising places Saturn in the leading role, while a Virgo Sun and Pisces Moon create a recurring conversation between practical discernment and emotional permeability.\n\nThe thesis is memorable because it is structural: the reader becomes most effective when inner sensitivity is given a deliberate form, rather than being asked to disappear.",
      bullets: ["Chart ruler: Saturn", "Sect and planetary authority considered", "Dominant testimony ranked before application"],
      takeaway: "The Complete Reading connects the entire chart instead of enlarging one placement at a time.",
    },
    {
      label: "CHART ARCHITECTURE",
      title: "The hierarchy behind the interpretation",
      body: "The report first records the calculation, then weighs the evidence. The Ascendant, its ruler, the sect light, angularity, essential dignity, house rulers, and close traditional aspects are not decorative details. They determine which topics deserve the most space.\n\nModern outer planets may add context, but they are not allowed to outrank the traditional framework simply because an aspect is numerically close.",
      bullets: ["1. Chart ruler and condition", "2. Sect light and angles", "3. Relevant house rulers and repeated testimony"],
      takeaway: "A complete reading is a hierarchy of evidence, not a longer list of placements.",
    },
    {
      label: "SECT AND AUTHORITY",
      title: "What gives the chart its operating rhythm",
      body: "Sect asks whether the chart belongs to the day or night, then places the lights and traditional planets in their proper context. This gives a more useful account of support and pressure than a simple good-planet or bad-planet split.\n\nIn the example, the practical strength of Saturn is balanced against the Moon's need for permeability. Authority grows when neither condition is dismissed: form without feeling becomes rigid, and feeling without form becomes difficult to sustain.",
      bullets: ["Available resource: persistence", "Pressure point: over-control", "Question for study: where does structure become care?"],
      takeaway: "Planetary authority is about condition and office, not personality labels.",
    },
    {
      label: "PLANETARY CHAPTER",
      title: "The Sun: authorship through craft",
      body: "A Virgo Sun needs to recognize its own ability to make a process clearer. Its confidence does not necessarily arrive as certainty; it often arrives after repeated contact with a real problem, a skill, or a body of work.\n\nThe Complete Reading traces where this solar function is strengthened, where it is pressured, and how it relates to the chart ruler. That produces practical guidance about visibility, responsibility, and the kind of recognition that actually feels earned.",
      bullets: ["Available resource: precision", "Pressure point: perfectionism", "Practical direction: let useful work be seen"],
      takeaway: "Planet chapters develop each planet's office without repeating the entire technical record.",
    },
    {
      label: "RELATIONSHIP PATTERN",
      title: "The seventh house comes before romance advice",
      body: "The relationship chapter begins with the seventh whole-sign house, its ruler, and that ruler's condition. Only then does it integrate Venus, the Moon, Mars, the fifth house, the eighth house, and other repeating testimony.\n\nFor this sample chart, the emphasis is on building trust slowly enough for real continuity to appear. Attraction may be immediate, but commitment is measured by consistency, clear agreements, and the ability to remain in contact when discomfort arrives.",
      bullets: ["Support: patient reciprocity", "Demand: clarity during tension", "Practice: distinguish privacy from withdrawal"],
      takeaway: "The report describes relational conditions, not a promised partner or outcome.",
    },
    {
      label: "VOCATION AND DIRECTION",
      title: "The tenth house changes the question",
      body: "Career is not reduced to a job title. The report examines the tenth house, Midheaven, ruler of the tenth, planets in the tenth, and their relationship with the chart ruler before discussing environments, leadership, skill, and contribution.\n\nHere, the recurring signature favors thoughtful responsibility. Work becomes coherent when it gives the reader a standard to meet, a useful system to improve, and enough independence to apply their judgment.",
      bullets: ["Strength: reliable analysis", "Tension: carrying too much alone", "Direction: build authority through visible craft"],
      takeaway: "A vocation chapter offers families of work and working conditions, not one fated profession.",
    },
    {
      label: "RESOURCES AND RHYTHM",
      title: "Money, work, and energy use the same architecture",
      body: "The second and sixth houses show how resources are produced, handled, and maintained in daily life. The interpretation remains symbolic and practical: it does not predict income or offer financial advice.\n\nIn this example, stability grows through repeatable systems rather than intense bursts. A strong routine, a visible record of progress, and realistic capacity protect the chart from the cycle of overextension followed by retreat.",
      bullets: ["Resource: cumulative skill", "Risk: invisible labor", "Practice: account for capacity before saying yes"],
      takeaway: "The chart can clarify how a person works with resources without making money promises.",
    },
    {
      label: "CLOSING SYNTHESIS",
      title: "The pattern becomes usable through repetition",
      body: "The closing pages do not restate the report chapter by chapter. They return to the central architecture and show where it appears in relationships, work, self-protection, and direction.\n\nFor this fictional chart, the repeated invitation is simple: build a form that can hold what you notice. The more deliberately the reader chooses their containers, the less they have to choose between sensitivity and authority.",
      bullets: ["One resource to use", "One pressure point to observe", "One question for continued study"],
      takeaway: "A full reading should leave the reader with proportion, language, and a practical next step.",
    },
  ],
  kabbalah: [
    {
      label: "SPIRITUAL THESIS",
      title: "Practice begins with the natal chart",
      body: "The Hermetic Kabbalah Reading begins with the chart ruler, sect light, dominant planets, and signatures that require balance. It does not begin by assigning a grand spiritual identity or by treating correspondence tables as a substitute for judgment.\n\nIn this editorial chart, Saturn's prominence makes disciplined attention the central practice. The work is not to become more severe. It is to create a stable vessel for imagination, reflection, and responsibility.",
      bullets: ["Natal hierarchy first", "Correspondence table second", "Practice is optional, safe, and contemplative"],
      takeaway: "The esoteric layer follows the chart; it does not replace it.",
    },
    {
      label: "METHOD AND LIMIT",
      title: "Correspondence is a language, not a claim",
      body: "The report uses a closed, versioned correspondence record. Names, letters, colors, planetary associations, decans, and devotional texts are drawn from that reviewed material rather than invented by the model.\n\nThe interpretation remains modest about what correspondence can do. It may offer a disciplined symbolic vocabulary for observation and prayer. It does not prove protection, initiation, supernatural status, or control over another person.",
      bullets: ["Reviewed source record", "No invented angelic names", "No guarantees or coercive ritual"],
      takeaway: "The method treats tradition with enough care to remain useful.",
    },
    {
      label: "PLANETARY HIERARCHY",
      title: "Saturn as the practice of form",
      body: "When Saturn carries the chart, its lesson is not punishment. It is proportion: learning the difference between a meaningful boundary and a fearful refusal, between a steady rule and a rigid defense.\n\nThe Saturnian section translates that condition into safe practices of time, attention, review, and responsibility. The reader is invited to work with a small promise that can be kept, rather than a dramatic task that cannot be sustained.",
      bullets: ["Virtue to cultivate: patience", "Imbalance to observe: hardening", "Practice: one kept commitment"],
      takeaway: "A planetary practice should make ordinary life more coherent, not more theatrical.",
    },
    {
      label: "SOLAR BALANCE",
      title: "The Sun gives the work a visible center",
      body: "The solar chapter asks where a person needs to become present to their own contribution. In a chart with a careful Virgo Sun, this can mean allowing skill to be visible before every uncertainty has been resolved.\n\nThe associated practice is simple: select one task that expresses craft, complete a proportionate version of it, and acknowledge the work without turning that acknowledgement into performance. This is devotional in the sense that attention becomes an offering.",
      bullets: ["Virtue to cultivate: clear authorship", "Imbalance to observe: endless correction", "Practice: finish one useful thing"],
      takeaway: "The solar practice is measured by integrity, not spectacle.",
    },
    {
      label: "LUNAR ATTUNEMENT",
      title: "The Moon needs an honest rhythm",
      body: "A receptive Moon can be spiritually valuable without being endlessly open. The report reads lunar symbolism through rest, dream, memory, mood, and the maintenance of emotional continuity.\n\nFor this sample, the practice is to record changing impressions without immediately treating them as instructions. A brief evening note, a walk without input, or a deliberate ending to the day can help the reader distinguish an inner signal from an atmosphere they have absorbed.",
      bullets: ["Virtue to cultivate: receptivity", "Imbalance to observe: diffusion", "Practice: a short evening record"],
      takeaway: "Lunar work gains clarity when receptivity has a beginning and an end.",
    },
    {
      label: "MERCURIAL DISCIPLINE",
      title: "Words become part of the practice",
      body: "Mercury is read through thought, language, learning, exchange, and the practical movement of information. The reading does not prescribe a magical formula. It asks how the reader's speech can become more exact, kind, and useful.\n\nA small Mercurial discipline might be a daily page of study notes, a clearer question before a difficult conversation, or a weekly review of promises made in language. The aim is not silence; it is better mediation between inner life and shared reality.",
      bullets: ["Virtue to cultivate: discrimination", "Imbalance to observe: scattered attention", "Practice: write the precise question"],
      takeaway: "Mercurial practice should improve communication with yourself and others.",
    },
    {
      label: "SEVEN-DAY RHYTHM",
      title: "A small plan that can actually be kept",
      body: "The full reading turns the relevant planetary hierarchy into a seven-day rhythm. Each day has one modest contemplative task, one practical expression, and one question for observation.\n\nThe schedule is deliberately ordinary: a promise kept, a page studied, a room made orderly, a conversation approached with more care, an hour set aside for rest. The reader can repeat or adapt it without being asked to perform a ceremony that exceeds their circumstances.",
      bullets: ["Day 1: establish the intention", "Days 2-6: observe and practice", "Day 7: review without self-punishment"],
      takeaway: "Consistency is more valuable than intensity in a chart-led practice.",
    },
    {
      label: "ETHICAL CLOSING",
      title: "A practice should make choice more conscious",
      body: "The Hermetic reading closes by returning the reader to ordinary agency. Astrology and correspondence can give language to a pattern, but they do not remove responsibility or provide a guarantee about outcomes.\n\nThe invitation is to work with the qualities named by the chart: steadiness, clarity, courage, receptivity, restraint, and care. A useful practice makes these qualities easier to notice in action and easier to repair when they become distorted.",
      bullets: ["No claims of protection", "No control over others", "No replacement for practical judgment"],
      takeaway: "The purpose is a more coherent inner life, not a promise of supernatural results.",
    },
  ],
};

const samples = [
  {
    fileName: "essential-birth-chart-reading-preview.pdf",
    eyebrow: "Automated First Synthesis",
    title: "Essential Birth Chart Reading",
    subtitle: "An eleven-page editorial demonstration",
    opening: "A substantial fictional excerpt showing how the Essential Reading turns natal hierarchy into practical language without pretending to be the entire chart.",
    contents: ["Central sentence", "Reading order", "Chart ruler and lights", "Relationships, work, and practice"],
    pages: previewSections.essential,
    close: "The full Essential Reading is generated automatically from your submitted birth data and delivered instantly by email.",
  },
  {
    fileName: "complete-natal-reading-preview.pdf",
    eyebrow: "Individually Reviewed Depth",
    title: "Complete Natal Reading",
    subtitle: "An eleven-page editorial demonstration",
    opening: "A substantial fictional excerpt showing the Complete Reading's technical hierarchy, applied chapters, and fuller synthesis across the chart.",
    contents: ["Chart architecture", "Planetary authority", "Relationship patterns", "Vocation, resources, and synthesis"],
    pages: previewSections.complete,
    close: "The Complete Reading is an individually prepared PDF. Its chapters change according to the hierarchy of the submitted chart.",
  },
  {
    fileName: "hermetic-kabbalah-reading-preview.pdf",
    eyebrow: "Chart-Led Esoteric Study",
    title: "Hermetic Kabbalah Reading",
    subtitle: "An eleven-page editorial demonstration",
    opening: "A substantial fictional excerpt showing how natal judgment, reviewed correspondence, and safe practice form one disciplined Hermetic study.",
    contents: ["Spiritual thesis", "Reviewed method", "Planetary practice", "Seven-day rhythm and ethical closing"],
    pages: previewSections.kabbalah,
    close: "The Hermetic Kabbalah Reading uses a reviewed correspondence table and keeps all practice contemplative, ethical, and non-coercive.",
  },
];

function wrap(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrapped(page, text, font, size, x, y, maxWidth, lineHeight, color = ink) {
  const lines = wrap(text, font, size, maxWidth);
  lines.forEach((line, index) => page.drawText(line, { x, y: y - index * lineHeight, size, font, color }));
  return y - lines.length * lineHeight;
}

function addPaper(page, texture, fonts, eyebrow, pageNumber) {
  page.drawImage(texture, { x: 0, y: 0, width, height, opacity: 0.38 });
  page.drawRectangle({ x: 0, y: 0, width, height, color: parchment, opacity: 0.74 });
  page.drawRectangle({ x: 18, y: 18, width: width - 36, height: height - 36, borderColor: parchmentDark, borderWidth: 0.9 });
  page.drawRectangle({ x: 25, y: 25, width: width - 50, height: height - 50, borderColor: gold, borderWidth: 0.35, opacity: 0.62 });
  page.drawText("MYSTIC BIRTH CHART", { x: margin, y: 757, size: 7, font: fonts.sansBold, color: gold });
  page.drawText(eyebrow.toUpperCase(), { x: margin + 112, y: 757, size: 7, font: fonts.sans, color: muted });
  page.drawText(String(pageNumber).padStart(2, "0"), { x: width - 70, y: 35, size: 8, font: fonts.sansBold, color: gold });
}

function drawCover(doc, texture, seal, fonts, sample) {
  const page = doc.addPage([width, height]);
  addPaper(page, texture, fonts, sample.eyebrow, 1);
  page.drawImage(seal, { x: 174, y: 288, width: 264, height: 264, opacity: 0.1 });
  page.drawImage(seal, { x: 270, y: 625, width: 72, height: 72, opacity: 0.9 });
  page.drawText("THE OLD STUDY METHOD", { x: 237, y: 600, size: 8, font: fonts.sans, color: muted });
  page.drawText(sample.eyebrow.toUpperCase(), { x: margin, y: 535, size: 8, font: fonts.sansBold, color: gold });
  let y = drawWrapped(page, sample.title, fonts.bold, 35, 82, 485, 448, 40, aubergine);
  y = drawWrapped(page, sample.subtitle, fonts.italic, 17, 82, y - 20, 448, 23, gold);
  page.drawLine({ start: { x: 82, y: y - 22 }, end: { x: 530, y: y - 22 }, thickness: 0.75, color: gold });
  drawWrapped(page, sample.opening, fonts.serif, 12.5, 82, 202, 448, 19, muted);
  page.drawText("EDITORIAL DEMONSTRATION / FICTIONAL EXAMPLE", { x: 166, y: 73, size: 8, font: fonts.sansBold, color: gold });
}

function drawContents(doc, texture, fonts, sample) {
  const page = doc.addPage([width, height]);
  addPaper(page, texture, fonts, sample.eyebrow, 2);
  page.drawText("PLATE 02 / PREVIEW CONTENTS", { x: margin, y: 700, size: 8, font: fonts.sansBold, color: gold });
  page.drawText("Inside the full reading", { x: margin, y: 650, size: 30, font: fonts.bold, color: aubergine });
  drawWrapped(page, "This document shows the voice, page design, and editorial structure of the paid reading. It is intentionally incomplete.", fonts.serif, 12, margin, 604, width - margin * 2, 18, muted);
  sample.contents.forEach((item, index) => {
    const top = 510 - index * 86;
    page.drawRectangle({ x: margin, y: top - 46, width: width - margin * 2, height: 58, color: rgb(0.985, 0.965, 0.91), borderColor: parchmentDark, borderWidth: 0.65 });
    page.drawText(String(index + 1).padStart(2, "0"), { x: margin + 15, y: top - 18, size: 16, font: fonts.bold, color: gold });
    page.drawText(item, { x: margin + 62, y: top - 14, size: 14, font: fonts.bold, color: aubergine });
    page.drawText(index === sample.contents.length - 1 ? "Preview closes here" : "Included in the full study", { x: margin + 62, y: top - 34, size: 8, font: fonts.sans, color: muted });
  });
}

function drawChapter(doc, texture, fonts, sample, pageNumber, section) {
  const page = doc.addPage([width, height]);
  addPaper(page, texture, fonts, sample.eyebrow, pageNumber);
  page.drawText(`PLATE ${String(pageNumber).padStart(2, "0")} / ${section.label}`, { x: margin, y: 700, size: 8, font: fonts.sansBold, color: gold });
  let y = drawWrapped(page, section.title, fonts.bold, 30, margin, 650, width - margin * 2, 35, aubergine);
  page.drawLine({ start: { x: margin, y: y - 12 }, end: { x: width - margin, y: y - 12 }, thickness: 0.75, color: gold, opacity: 0.75 });
  for (const paragraph of section.body.split("\n\n")) {
    y = drawWrapped(page, paragraph, fonts.serif, 12.3, margin, y - 34, width - margin * 2, 18, ink) - 8;
  }
  const bulletTop = Math.max(285, y - 18);
  section.bullets.forEach((bullet, index) => {
    const bulletY = bulletTop - index * 22;
    page.drawText("+", { x: margin, y: bulletY, size: 11, font: fonts.sansBold, color: gold });
    page.drawText(bullet, { x: margin + 17, y: bulletY + 1, size: 9.5, font: fonts.serif, color: muted });
  });
  page.drawRectangle({ x: margin, y: 106, width: width - margin * 2, height: 104, color: deep });
  page.drawText("TAKEAWAY", { x: margin + 20, y: 182, size: 8, font: fonts.sansBold, color: parchmentDark });
  drawWrapped(page, section.takeaway, fonts.serif, 10.5, margin + 20, 156, width - margin * 2 - 40, 15, parchment);
  page.drawText("Preview excerpt - the full report develops the evidence in depth.", { x: margin, y: 102, size: 8, font: fonts.italic, color: muted });
}

function drawClosing(doc, texture, seal, fonts, sample) {
  const page = doc.addPage([width, height]);
  addPaper(page, texture, fonts, sample.eyebrow, sample.pages.length + 3);
  page.drawImage(seal, { x: 196, y: 305, width: 220, height: 220, opacity: 0.1 });
  page.drawText("THE PREVIEW ENDS HERE", { x: margin, y: 665, size: 8, font: fonts.sansBold, color: gold });
  let y = drawWrapped(page, "The chart becomes useful when its patterns are read together.", fonts.bold, 32, margin, 615, width - margin * 2, 37, aubergine);
  drawWrapped(page, sample.close, fonts.serif, 13, margin, y - 42, width - margin * 2, 20, muted);
  page.drawRectangle({ x: margin, y: 150, width: width - margin * 2, height: 58, color: gold });
  page.drawText("MYSTICBIRTHCHART.COM / READINGS", { x: 179, y: 177, size: 10, font: fonts.sansBold, color: deep });
}

async function createPreview(sample, textureBytes, sealBytes, outputDir) {
  const doc = await PDFDocument.create();
  doc.setTitle(`${sample.title} - Editorial Preview`);
  doc.setAuthor("Mystic Birth Chart");
  doc.setSubject("Editorial PDF preview");
  const [serif, bold, italic, sans, sansBold] = await Promise.all([
    StandardFonts.TimesRoman,
    StandardFonts.TimesRomanBold,
    StandardFonts.TimesRomanItalic,
    StandardFonts.Helvetica,
    StandardFonts.HelveticaBold,
  ].map((font) => doc.embedFont(font)));
  const texture = await doc.embedJpg(textureBytes);
  const seal = await doc.embedPng(sealBytes);
  const fonts = { serif, bold, italic, sans, sansBold };
  drawCover(doc, texture, seal, fonts, sample);
  drawContents(doc, texture, fonts, sample);
  sample.pages.forEach((chapter, index) => drawChapter(doc, texture, fonts, sample, index + 3, chapter));
  drawClosing(doc, texture, seal, fonts, sample);
  await writeFile(join(outputDir, sample.fileName), await doc.save());
}

const root = process.cwd();
const outputDir = join(root, "public", "samples");
const [textureBytes, sealBytes] = await Promise.all([
  readFile(join(root, "public", "images", "textures", "parchment-reading-paper.jpg")),
  readFile(join(root, "public", "brand", "mystic-astrolabe-seal-transparent.png")),
]);
await mkdir(outputDir, { recursive: true });
for (const sample of samples) await createPreview(sample, textureBytes, sealBytes, outputDir);
