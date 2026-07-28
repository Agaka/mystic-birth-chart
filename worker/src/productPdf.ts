import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { ProductFacts } from "./reportFacts.ts";
import type { ReportBlueprint, ReportChapter } from "./reportCatalog.ts";
import type { ProductReport } from "./productProviders.ts";
import type { FullChart } from "./fullChart.ts";

const width = 612;
const height = 792;
const margin = 58;
const parchment = rgb(0.965, 0.934, 0.865);
const parchmentDark = rgb(0.88, 0.81, 0.68);
const ink = rgb(0.15, 0.09, 0.075);
const gold = rgb(0.59, 0.39, 0.12);
const muted = rgb(0.39, 0.31, 0.27);
const aubergine = rgb(0.28, 0.10, 0.09);
type Fonts = { serif: PDFFont; bold: PDFFont; italic: PDFFont; sans: PDFFont; sansBold: PDFFont };

function clean(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[\u2010-\u2015]/g, "-").replace(/[\u2018\u2019\u2032]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[^\x20-\x7E\u00B0\n]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, available: number): string[] {
  const lines: string[] = [];
  for (const paragraph of clean(text).split(/\n+/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= available) line = next;
      else { if (line) lines.push(line); line = word; }
    }
    if (line) lines.push(line);
    lines.push("");
  }
  if (lines.at(-1) === "") lines.pop();
  return lines;
}

function paper(page: PDFPage, pageNumber: number, texture: PDFImage, fonts: Fonts, eyebrow: string): void {
  page.drawImage(texture, { x: 0, y: 0, width, height, opacity: 0.42 });
  page.drawRectangle({ x: 0, y: 0, width, height, color: parchment, opacity: 0.72 });
  page.drawRectangle({ x: 18, y: 18, width: width - 36, height: height - 36, borderColor: parchmentDark, borderWidth: 0.9 });
  page.drawRectangle({ x: 25, y: 25, width: width - 50, height: height - 50, borderColor: gold, borderWidth: 0.35, opacity: 0.62 });
  page.drawText(`MYSTIC BIRTH CHART / ${clean(eyebrow).toUpperCase()}`, { x: margin, y: 758, size: 7, font: fonts.sansBold, color: gold });
  page.drawText(String(pageNumber).padStart(2, "0"), { x: width - 70, y: 35, size: 8, font: fonts.sans, color: gold });
}

function page(doc: PDFDocument, texture: PDFImage, fonts: Fonts, eyebrow: string): PDFPage {
  const value = doc.addPage([width, height]);
  paper(value, doc.getPageCount(), texture, fonts, eyebrow);
  return value;
}

function radians(value: number): number { return value * Math.PI / 180; }

function drawChartWheel(doc: PDFDocument, texture: PDFImage, fonts: Fonts, eyebrow: string, title: string, chart: FullChart, timeKnown: boolean): void {
  const current = page(doc, texture, fonts, eyebrow);
  wrap(title, fonts.serif, 27, width - margin * 2).slice(0, 2).forEach((line, index) => current.drawText(line, { x: margin, y: 710 - index * 31, size: 27, font: fonts.serif, color: ink }));
  const cx = 306; const cy = 380; const outer = 220; const inner = 145;
  const reference = timeKnown ? chart.angles.ascendant.longitude : 0;
  const angleOf = (longitude: number) => radians(180 + longitude - reference);
  current.drawCircle({ x: cx, y: cy, size: outer, borderColor: gold, borderWidth: 1.2 });
  current.drawCircle({ x: cx, y: cy, size: inner, borderColor: parchmentDark, borderWidth: 0.8 });
  const labels = ["ARI", "TAU", "GEM", "CAN", "LEO", "VIR", "LIB", "SCO", "SAG", "CAP", "AQU", "PIS"];
  for (let index = 0; index < 12; index += 1) {
    const boundary = angleOf(index * 30);
    current.drawLine({ start: { x: cx + Math.cos(boundary) * inner, y: cy + Math.sin(boundary) * inner }, end: { x: cx + Math.cos(boundary) * outer, y: cy + Math.sin(boundary) * outer }, thickness: 0.5, color: gold, opacity: 0.72 });
    const middle = angleOf(index * 30 + 15);
    current.drawText(labels[index]!, { x: cx + Math.cos(middle) * 188 - 10, y: cy + Math.sin(middle) * 188 - 3, size: 7, font: fonts.sansBold, color: gold });
    if (timeKnown) {
      const house = ((index - Math.floor(reference / 30) + 12) % 12) + 1;
      current.drawText(`H${house}`, { x: cx + Math.cos(middle) * 165 - 7, y: cy + Math.sin(middle) * 165 - 3, size: 6.5, font: fonts.sansBold, color: muted });
    }
  }
  const abbreviations: Record<string, string> = { Sun: "SU", Moon: "MO", Mercury: "ME", Venus: "VE", Mars: "MA", Jupiter: "JU", Saturn: "SA", Uranus: "UR", Neptune: "NE", Pluto: "PL" };
  const points = new Map<string, { x: number; y: number }>();
  const used: number[] = [];
  for (const placement of [...chart.placements].sort((a, b) => a.longitude - b.longitude)) {
    const angle = angleOf(placement.longitude);
    const nearby = used.filter((longitude) => Math.min(Math.abs(longitude - placement.longitude), 360 - Math.abs(longitude - placement.longitude)) < 6).length;
    const radius = 122 - nearby * 29; used.push(placement.longitude);
    const point = { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }; points.set(placement.body, point);
    current.drawCircle({ x: point.x, y: point.y, size: 14, color: parchment, borderColor: gold, borderWidth: 0.7 });
    current.drawText(abbreviations[placement.body] || placement.body.slice(0, 2).toUpperCase(), { x: point.x - 7, y: point.y - 3, size: 7, font: fonts.sansBold, color: aubergine });
  }
  for (const aspect of chart.aspects.filter((item) => !item.outOfSign && item.orb <= 3 && points.has(item.body1) && points.has(item.body2)).slice(0, 16)) {
    current.drawLine({ start: points.get(aspect.body1)!, end: points.get(aspect.body2)!, thickness: 0.55, color: aspect.type === "trine" || aspect.type === "sextile" ? gold : aubergine, opacity: 0.4 });
  }
  current.drawText(timeKnown ? "Whole-sign houses / traditional aspect structure" : "Planetary positions only / birth time unknown", { x: margin, y: 92, size: 9, font: fonts.italic, color: muted });
}

function drawSynastryWheel(doc: PDFDocument, texture: PDFImage, fonts: Fonts, blueprint: ReportBlueprint, facts: ProductFacts): void {
  if (!facts.partner || !facts.synastry) return;
  const current = page(doc, texture, fonts, blueprint.eyebrow);
  current.drawText("Synastry Contact Wheel", { x: margin, y: 710, size: 27, font: fonts.serif, color: ink });
  const cx = 306; const cy = 380; const reference = facts.natalTimeKnown ? facts.natal.chart.angles.ascendant.longitude : 0;
  const angleOf = (longitude: number) => radians(180 + longitude - reference);
  [225, 188, 145].forEach((radius, index) => current.drawCircle({ x: cx, y: cy, size: radius, borderColor: index === 1 ? parchmentDark : gold, borderWidth: index === 1 ? 0.7 : 1 }));
  for (let index = 0; index < 12; index += 1) {
    const angle = angleOf(index * 30);
    current.drawLine({ start: { x: cx + Math.cos(angle) * 145, y: cy + Math.sin(angle) * 145 }, end: { x: cx + Math.cos(angle) * 225, y: cy + Math.sin(angle) * 225 }, color: gold, thickness: 0.45, opacity: 0.65 });
  }
  const abbreviate = (body: string) => ({ Sun: "SU", Moon: "MO", Mercury: "ME", Venus: "VE", Mars: "MA", Jupiter: "JU", Saturn: "SA", Uranus: "UR", Neptune: "NE", Pluto: "PL" } as Record<string, string>)[body] || body.slice(0, 2).toUpperCase();
  const first = new Map<string, { x: number; y: number }>(); const second = new Map<string, { x: number; y: number }>();
  for (const [chart, radius, target, fill] of [[facts.natal.chart, 125, first, parchment], [facts.partner.facts.chart, 168, second, rgb(0.92, 0.84, 0.69)]] as const) {
    for (const placement of chart.placements) {
      const angle = angleOf(placement.longitude); const point = { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius }; target.set(placement.body, point);
      current.drawCircle({ x: point.x, y: point.y, size: 11, color: fill, borderColor: gold, borderWidth: 0.55 });
      current.drawText(abbreviate(placement.body), { x: point.x - 6, y: point.y - 2.5, size: 6, font: fonts.sansBold, color: aubergine });
    }
  }
  for (const contact of facts.synastry.contacts.filter((item) => !item.outOfSign).slice(0, 24)) {
    const a = first.get(contact.bodyA); const b = second.get(contact.bodyB); if (!a || !b) continue;
    current.drawLine({ start: a, end: b, thickness: contact.orb <= 1 ? 0.9 : 0.45, color: contact.classification === "supportive" ? gold : aubergine, opacity: contact.classification === "highly consequential" ? 0.65 : 0.32 });
  }
  current.drawText("Inner ring: first chart / outer ring: second chart", { x: margin, y: 92, size: 9, font: fonts.italic, color: muted });
}

function drawFlow(doc: PDFDocument, texture: PDFImage, fonts: Fonts, eyebrow: string, title: string, body: string, style = { size: 11.1, line: 18.5, blank: 11 }): void {
  const lines = wrap(body, fonts.serif, style.size, width - margin * 2);
  let current = page(doc, texture, fonts, eyebrow);
  let y = 714;
  current.drawText(clean(title), { x: margin, y, size: 25, font: fonts.serif, color: ink }); y -= 46;
  for (const line of lines) {
    if (y < 72) { current = page(doc, texture, fonts, eyebrow); y = 714; }
    if (line) current.drawText(line, { x: margin, y, size: style.size, font: fonts.serif, color: ink });
    y -= line ? style.line : style.blank;
  }
}

function contentsPage(doc: PDFDocument, texture: PDFImage, fonts: Fonts, blueprint: ReportBlueprint, facts: ProductFacts): void {
  const current = page(doc, texture, fonts, blueprint.eyebrow);
  current.drawText("Contents", { x: margin, y: 710, size: 28, font: fonts.serif, color: ink });
  const entries = ["Calculation Record", "Natal Wheel", ...(facts.partner ? ["Second Natal Wheel", "Synastry Contact Wheel"] : []), "Reference Tables", ...blueprint.chapters.map((chapter) => chapter.title), "Applied Direction", "Closing Synthesis", "About This Reading"];
  let y = 655;
  entries.forEach((entry, index) => {
    current.drawText(String(index + 1).padStart(2, "0"), { x: margin, y, size: 8, font: fonts.sansBold, color: gold });
    current.drawText(clean(entry), { x: margin + 34, y: y - 2, size: 11.5, font: fonts.serif, color: ink });
    y -= 29;
  });
}

function chapterAnchor(chapter: ReportChapter, facts: ProductFacts): string {
  const house = (number: number) => facts.natalEvidence?.houses.find((item) => item.house === number);
  if (chapter.key === "relationshipStructure" || chapter.key === "intimacyAndCommitment" || chapter.key === "relationshipPractice") {
    const seventh = house(7);
    return seventh ? `Seventh house: ${seventh.sign}. Traditional ruler: ${seventh.ruler}, placed in house ${seventh.rulerPlacement.house}.` : "Relationship evidence is limited to reliable calculated placements.";
  }
  if (chapter.key === "vocationStructure" || chapter.key === "workResources" || chapter.key === "vocationPractice") {
    const tenth = house(10);
    return tenth ? `Tenth house: ${tenth.sign}. Traditional ruler: ${tenth.ruler}, placed in house ${tenth.rulerPlacement.house}.` : "Vocational evidence is limited to reliable calculated placements.";
  }
  if (chapter.key === "twoStructures" || chapter.key === "contactPoints" || chapter.key === "relationshipDynamic") {
    return `${facts.synastry?.contacts.length || 0} inter-chart contacts were retained; ${facts.synastry?.houseOverlays.length || 0} reliable house overlays were available.`;
  }
  if (chapter.key === "forecastHierarchy" || chapter.key === "relevantTransits" || chapter.key === "yearTimeline") {
    const current = facts.forecast?.profections[0];
    return current ? `Active profection: house ${current.house} in ${current.sign}, governed by ${current.lordOfYear}. ${facts.forecast?.events.length || 0} principal activations were retained.` : "Only selected, calculated timing testimony is used.";
  }
  if (chapter.key.startsWith("annual") || chapter.key === "solarReturn" || chapter.key === "selectedTransits") {
    return facts.annual ? `Annual profection: house ${facts.annual.profection.house} in ${facts.annual.profection.sign}, governed by ${facts.annual.profection.lordOfYear}.` : "Annual conclusions require converging calculated testimony.";
  }
  return `Chart ruler: ${facts.natal.chart.chartRuler}. Sect: ${facts.natal.chart.sect}. Ascendant: ${facts.natal.chart.angles.ascendant.degreeLabel} ${facts.natal.chart.angles.ascendant.sign}.`;
}

function chapterOpening(doc: PDFDocument, texture: PDFImage, seal: PDFImage, fonts: Fonts, blueprint: ReportBlueprint, chapter: ReportChapter, index: number, facts: ProductFacts): void {
  const current = page(doc, texture, fonts, blueprint.eyebrow);
  current.drawImage(seal, { x: 326, y: 260, width: 205, height: 205, opacity: 0.075 });
  current.drawText(`CHAPTER ${String(index + 1).padStart(2, "0")}`, { x: margin, y: 655, size: 9, font: fonts.sansBold, color: gold });
  const titleLines = wrap(chapter.title, fonts.serif, 32, width - margin * 2);
  titleLines.forEach((line, lineIndex) => current.drawText(line, { x: margin, y: 595 - lineIndex * 39, size: 32, font: fonts.serif, color: ink }));
  const purposeY = 495 - Math.max(0, titleLines.length - 1) * 39;
  let y = purposeY;
  for (const line of wrap(chapter.purpose, fonts.serif, 12, width - margin * 2)) {
    if (line) current.drawText(line, { x: margin, y, size: 12, font: fonts.serif, color: muted });
    y -= line ? 19 : 10;
  }
  current.drawLine({ start: { x: margin, y: 245 }, end: { x: width - margin, y: 245 }, thickness: 0.6, color: gold, opacity: 0.75 });
  current.drawText("TECHNICAL ANCHOR", { x: margin, y: 218, size: 8, font: fonts.sansBold, color: gold });
  const anchorLines = wrap(chapterAnchor(chapter, facts), fonts.italic, 11, width - margin * 2);
  anchorLines.slice(0, 4).forEach((line, lineIndex) => current.drawText(line, { x: margin, y: 193 - lineIndex * 17, size: 11, font: fonts.italic, color: aubergine }));
}

function identityPage(doc: PDFDocument, texture: PDFImage, seal: PDFImage, fonts: Fonts, blueprint: ReportBlueprint, facts: ProductFacts, report: ProductReport): void {
  const cover = page(doc, texture, fonts, blueprint.eyebrow);
  cover.drawImage(seal, { x: 196, y: 300, width: 220, height: 220, opacity: 0.12 });
  cover.drawText(clean(blueprint.eyebrow).toUpperCase(), { x: margin, y: 655, size: 9, font: fonts.sansBold, color: gold });
  const titleLines = wrap(report.title || blueprint.title, fonts.serif, 36, 430);
  titleLines.forEach((line, index) => cover.drawText(line, { x: margin, y: 590 - index * 42, size: 36, font: fonts.serif, color: ink }));
  cover.drawText(clean(facts.natal.birth.location), { x: margin, y: 250, size: 15, font: fonts.italic, color: gold });
  cover.drawText(`${facts.natal.birth.date} at ${facts.natal.birth.time}`, { x: margin, y: 220, size: 12, font: fonts.serif, color: muted });
  const record = page(doc, texture, fonts, blueprint.eyebrow);
  record.drawText("Calculation Record", { x: margin, y: 710, size: 28, font: fonts.serif, color: ink });
  const rows = [
    ["Birth", `${facts.natal.birth.date} at ${facts.natal.birth.time}`], ["Place", facts.natal.birth.location], ["Coordinates", `${facts.natal.birth.latitude.toFixed(4)}, ${facts.natal.birth.longitude.toFixed(4)}`], ["Time zone", facts.natal.birth.timezone],
    ["System", `${facts.natal.chart.zodiac} zodiac / ${facts.natal.chart.houseSystem} houses`], ...(facts.natalTimeKnown ? [["Ascendant", `${facts.natal.chart.angles.ascendant.degreeLabel} ${facts.natal.chart.angles.ascendant.sign}`], ["Midheaven", `${facts.natal.chart.angles.midheaven.degreeLabel} ${facts.natal.chart.angles.midheaven.sign}`], ["Sect", facts.natal.chart.sect]] : [["Birth-time reliability", facts.natalReliabilityNote]]), ["Moon phase", `${facts.natal.chart.moonPhase.name} / ${facts.natal.chart.moonPhase.timingLabel}`],
  ];
  rows.forEach(([label, value], index) => { const y = 650 - index * 48; record.drawText(label.toUpperCase(), { x: margin, y, size: 8, font: fonts.sansBold, color: gold }); record.drawText(clean(value), { x: margin, y: y - 18, size: 13, font: fonts.serif, color: ink }); });
}

function referencePages(doc: PDFDocument, texture: PDFImage, fonts: Fonts, blueprint: ReportBlueprint, facts: ProductFacts): void {
  const positions = facts.natal.chart.placements.map((placement) => [placement.body, `${placement.degreeLabel} ${placement.sign}`, facts.natalTimeKnown ? `House ${placement.house}` : "", placement.dignities.length ? placement.dignities.join(" and ") : "No major essential dignity"]);
  if (facts.natalTimeKnown) {
    positions.push(["Ascendant", `${facts.natal.chart.angles.ascendant.degreeLabel} ${facts.natal.chart.angles.ascendant.sign}`, "First house", `Chart ruler: ${facts.natal.chart.chartRuler}`]);
    positions.push(["Midheaven", `${facts.natal.chart.angles.midheaven.degreeLabel} ${facts.natal.chart.angles.midheaven.sign}`, "", ""]);
  }
  const tables: Array<{ title: string; rows: string[][] }> = blueprint.tier === "almanac" ? [] : [
    { title: "Planetary Positions and Conditions", rows: positions },
    { title: "Aspect Record", rows: facts.natal.chart.aspects.map((aspect) => [`${aspect.body1} ${aspect.outOfSign ? "out-of-sign " : ""}${aspect.type} ${aspect.body2}`, `${aspect.orbLabel} orb`, aspect.outOfSign ? "Secondary testimony" : "Sign-based aspect"]) },
    ...(facts.natalTimeKnown ? [{ title: "Whole-Sign Houses and Rulers", rows: Array.from({ length: 12 }, (_, index) => { const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]; const rulers: Record<string, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" }; const sign = signs[(signs.indexOf(facts.natal.chart.angles.ascendant.sign) + index) % 12]!; const occupants = facts.natal.chart.placements.filter((placement) => placement.house === index + 1).map((placement) => placement.body).join(", ") || "No planets"; return [`House ${index + 1}`, sign, `Ruler: ${rulers[sign]}`, occupants]; }) }] : []),
  ];
  if (facts.partner) tables.push({ title: "Second Person / Planetary Positions", rows: facts.partner.facts.chart.placements.map((placement) => [placement.body, `${placement.degreeLabel} ${placement.sign}`, facts.partner!.timeKnown ? `House ${placement.house}` : "Houses omitted", placement.dignities.length ? placement.dignities.join(" and ") : "No major essential dignity"]) });
  if (facts.synastry) tables.push(
    { title: "Inter-Chart Contacts", rows: [...facts.synastry.contacts, ...facts.synastry.angleContacts].map((contact) => [`${contact.bodyA} ${contact.outOfSign ? "out-of-sign " : ""}${contact.aspect} ${contact.bodyB}`, `${contact.orbLabel} orb`, contact.classification]) },
    { title: "Reliable House Overlays", rows: facts.synastry.houseOverlays.map((overlay) => [`${overlay.planetOwner} person's ${overlay.body}`, `${overlay.owner} person's house ${overlay.house}`, overlay.sign]) },
    { title: "Reliability and Omissions", rows: [...facts.synastry.moonCautions, ...facts.synastry.omitted].map((item) => [item]) },
  );
  if (facts.hermetic) tables.push(
    { title: "Hermetic Correspondence Record", rows: [["System", facts.hermetic.system], ["Version", facts.hermetic.version]] },
    { title: "The Seven Planetary Spheres", rows: Object.entries(facts.hermetic.planetarySpheres).map(([planet, value]) => [`${planet} / ${value.sephirah} / ${value.day}`, `Virtue: ${value.virtue}`, `Imbalance: ${value.imbalance}`]) },
    { title: "Selected Natal Quinances", rows: facts.hermetic.selectedQuinances.map((item) => [`${item.subject} / ${item.degreeLabel} ${item.sign}`, `${item.quinance.startDegree}°-${item.quinance.endDegree}° / ${item.quinance.angel}`, `${item.quinance.planet} / ${item.quinance.contemplativeText}`]) },
    { title: "Zodiac Paths in the Selected System", rows: Object.entries(facts.hermetic.zodiac).map(([sign, value]) => [sign, `Letter: ${value.letter}`, `Tarot: ${value.tarot}`, `Path: ${value.path}`]) },
  );
  if (facts.annual) tables.push(
    { title: "Annual Cycle at a Glance", rows: [
      ["Period", `${facts.annual.period.startsAt.slice(0, 10)} to ${facts.annual.period.endsAt.slice(0, 10)}`, facts.annual.period.returnLocation],
      ["Annual profection", `Age ${facts.annual.profection.age}`, `House ${facts.annual.profection.house} / ${facts.annual.profection.sign}`],
      ["Lord of the Year", facts.annual.profection.lordOfYear, `Natal houses ruled: ${facts.annual.profection.natalHousesRuled.join(", ")}`],
      ["Solar Return Ascendant", `${facts.annual.solarReturn.angles.ascendant.degreeLabel} ${facts.annual.solarReturn.angles.ascendant.sign}`, `Sect: ${facts.annual.solarReturn.sect}`],
    ] },
    { title: "Monthly Annual Record", rows: facts.annual.monthlySky.map((month) => ["Month " + month.month, month.startsAt.slice(0, 10), `Ascendant ${month.chart.angles.ascendant.degreeLabel} ${month.chart.angles.ascendant.sign}`, month.chart.moonPhase.name]) },
    { title: "Solar Return / Natal Contact Record", rows: [
      ["Return rulers", `Ascendant: ${facts.annual.solarReturnEvidence.ascendantRuler}`, `Midheaven: ${facts.annual.solarReturnEvidence.midheavenRuler}`],
      ["Angular planets", facts.annual.solarReturnEvidence.angularPlanets.join(", ") || "None"],
      ...facts.annual.solarReturnEvidence.returnToNatalAspects.map((item) => [`Return ${item.returnBody}`, `${item.outOfSign ? "out-of-sign " : ""}${item.aspect} natal ${item.natalBody}`, `${item.orbLabel} orb`]),
    ] },
  );
  if (facts.forecast) tables.push(
    { title: "Forecast Period and Profections", rows: [["Period", `${facts.forecast.period.startsAt.slice(0, 10)} to ${facts.forecast.period.endsAt.slice(0, 10)}`, facts.forecast.period.timezone], ...facts.forecast.profections.map((item) => ["Profection", `${item.startsAt.slice(0, 10)} to ${item.endsAt.slice(0, 10)}`, `House ${item.house} / ${item.sign}`, `Lord: ${item.lordOfYear}`])] },
    { title: "Selected Transit Activations", rows: facts.forecast.events.map((item) => [item.exactAt.slice(0, 10), `${item.transit} ${item.aspect} ${item.target}`, `${item.exactOrb.toFixed(2)} deg exact orb`, item.category]) },
  );
  if (facts.almanac) tables.push({ title: "This Month at a Glance", rows: [
    ["Period", `${facts.almanac.month.startsAt.slice(0, 10)} to ${facts.almanac.month.endsAt.slice(0, 10)}`, facts.almanac.month.presentationTimezone],
    ["Solar month", `Sun through ${facts.almanac.month.themeSign}`, `Natal house ${facts.almanac.month.sunHouse}`],
    ["Annual profection", `House ${facts.almanac.profection.house} / ${facts.almanac.profection.sign}`, `Lord: ${facts.almanac.profection.lordOfYear}`],
    ...facts.almanac.lunations.map((item) => [item.exactAt.slice(0, 10), item.kind, `${item.degreeLabel} ${item.sign}`, `Natal house ${item.natalHouse}`]),
    ...facts.almanac.timing.events.map((item) => [item.exactAt.slice(0, 10), `${item.transit} ${item.aspect} ${item.target}`, `${item.exactOrb.toFixed(2)} deg exact orb`, item.category]),
  ] });
  for (const table of tables) {
    let current = page(doc, texture, fonts, blueprint.eyebrow); let y = 710;
    current.drawText(table.title, { x: margin, y, size: 25, font: fonts.serif, color: ink }); y -= 45;
    for (const row of table.rows) {
      if (y < 90) { current = page(doc, texture, fonts, blueprint.eyebrow); y = 710; }
      current.drawRectangle({ x: margin, y: y - 25, width: width - margin * 2, height: 31, borderColor: parchmentDark, borderWidth: 0.45, opacity: 0.7 });
      const cells = row.filter(Boolean); const cellWidth = (width - margin * 2 - 24) / Math.max(1, cells.length);
      cells.forEach((cell, index) => current.drawText(clean(cell).slice(0, 55), { x: margin + 12 + index * cellWidth, y: y - 6, size: 8.5, font: index === 0 ? fonts.sansBold : fonts.serif, color: index === 0 ? gold : ink }));
      y -= 34;
    }
  }
}

export async function createProductPdf(blueprint: ReportBlueprint, facts: ProductFacts, report: ProductReport): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(report.title || blueprint.title); doc.setAuthor("Mystic Birth Chart"); doc.setSubject("A personalized traditional-first astrology report");
  const [serif, bold, italic, sans, sansBold] = await Promise.all([StandardFonts.TimesRoman, StandardFonts.TimesRomanBold, StandardFonts.TimesRomanItalic, StandardFonts.Helvetica, StandardFonts.HelveticaBold].map((font) => doc.embedFont(font)));
  const texture = await doc.embedJpg(await readFile(join(process.cwd(), "..", "public", "images", "textures", "parchment-reading-paper.jpg")));
  const seal = await doc.embedPng(await readFile(join(process.cwd(), "..", "public", "brand", "mystic-astrolabe-seal-transparent.png")));
  const fonts = { serif, bold, italic, sans, sansBold };
  identityPage(doc, texture, seal, fonts, blueprint, facts, report);
  if (blueprint.tier !== "almanac") contentsPage(doc, texture, fonts, blueprint, facts);
  drawChartWheel(doc, texture, fonts, blueprint.eyebrow, facts.partner ? "Natal Wheel / First Person" : "Natal Wheel", facts.natal.chart, facts.natalTimeKnown);
  if (facts.partner) drawChartWheel(doc, texture, fonts, blueprint.eyebrow, "Natal Wheel / Second Person", facts.partner.facts.chart, facts.partner.timeKnown);
  if (facts.annual) drawChartWheel(doc, texture, fonts, blueprint.eyebrow, "Solar Return Wheel", facts.annual.solarReturn, true);
  drawSynastryWheel(doc, texture, fonts, blueprint, facts);
  const flowStyle = ["love", "career", "year-ahead", "synastry", "almanac"].includes(blueprint.tier) ? { size: 10.4, line: 15.8, blank: 8 } : { size: 11.2, line: 20, blank: 12 };
  if (blueprint.tier === "almanac") {
    referencePages(doc, texture, fonts, blueprint, facts);
    for (const chapter of report.chapters) drawFlow(doc, texture, fonts, blueprint.eyebrow, chapter.title, chapter.body, flowStyle);
    drawFlow(doc, texture, fonts, blueprint.eyebrow, "Monthly Orientation and Closing", `${report.introduction}\n\n${report.practicalSummary}\n\n${report.closing}\n\n${report.scopeNote}`, flowStyle);
    return doc.save();
  }
  drawFlow(doc, texture, fonts, blueprint.eyebrow, "The Longer View", report.introduction, flowStyle);
  referencePages(doc, texture, fonts, blueprint, facts);
  report.chapters.forEach((chapter, index) => {
    const specification = blueprint.chapters.find((item) => item.key === chapter.key);
    if (specification) chapterOpening(doc, texture, seal, fonts, blueprint, specification, index, facts);
    drawFlow(doc, texture, fonts, blueprint.eyebrow, `${chapter.title} / Study`, chapter.body, flowStyle);
  });
  drawFlow(doc, texture, fonts, blueprint.eyebrow, "Applied Direction", report.practicalSummary, flowStyle);
  drawFlow(doc, texture, fonts, blueprint.eyebrow, "Closing Synthesis", report.closing, flowStyle);
  drawFlow(doc, texture, fonts, blueprint.eyebrow, "About This Reading", report.scopeNote, flowStyle);
  return doc.save();
}

function summaryText(pageValue: PDFPage, fonts: Fonts, title: string, body: string, startY = 700): void {
  pageValue.drawText(clean(title), { x: margin, y: startY, size: 27, font: fonts.serif, color: ink });
  let y = startY - 44;
  for (const line of wrap(body, fonts.serif, 11.2, width - margin * 2).slice(0, 31)) {
    if (line) pageValue.drawText(line, { x: margin, y, size: 11.2, font: fonts.serif, color: ink });
    y -= line ? 18.5 : 10;
  }
}

export async function createDossierSummaryPdf(facts: ProductFacts, report: ProductReport): Promise<Uint8Array> {
  const blueprint: ReportBlueprint = { ...({} as ReportBlueprint), tier: "dossier", fileName: "annual-quick-reference.pdf", title: "Annual Quick Reference", eyebrow: "Premium Integrated Study", targetPages: [4, 4], targetWords: [0, 99999], requiresPartner: false, requiresAnnualCycle: true, recurring: false, chapters: [] };
  const doc = await PDFDocument.create();
  doc.setTitle("Mystic Birth Chart Annual Quick Reference"); doc.setAuthor("Mystic Birth Chart");
  const [serif, bold, italic, sans, sansBold] = await Promise.all([StandardFonts.TimesRoman, StandardFonts.TimesRomanBold, StandardFonts.TimesRomanItalic, StandardFonts.Helvetica, StandardFonts.HelveticaBold].map((font) => doc.embedFont(font)));
  const texture = await doc.embedJpg(await readFile(join(process.cwd(), "..", "public", "images", "textures", "parchment-reading-paper.jpg")));
  const seal = await doc.embedPng(await readFile(join(process.cwd(), "..", "public", "brand", "mystic-astrolabe-seal-transparent.png")));
  const fonts = { serif, bold, italic, sans, sansBold };
  const cover = page(doc, texture, fonts, blueprint.eyebrow);
  cover.drawImage(seal, { x: 196, y: 300, width: 220, height: 220, opacity: 0.12 });
  cover.drawText("ANNUAL QUICK REFERENCE", { x: margin, y: 650, size: 9, font: sansBold, color: gold });
  cover.drawText(clean(report.title), { x: margin, y: 575, size: 31, font: serif, color: ink });
  cover.drawText(clean(facts.natal.birth.location), { x: margin, y: 510, size: 14, font: italic, color: gold });
  cover.drawText("Keep this beside the full dossier for decisions, review, and preparation.", { x: margin, y: 225, size: 12, font: serif, color: muted });
  const overview = page(doc, texture, fonts, blueprint.eyebrow);
  summaryText(overview, fonts, "The Cycle in One View", `${report.introduction}\n\n${report.practicalSummary}`);
  const windows = page(doc, texture, fonts, blueprint.eyebrow);
  const eventLines = (facts.forecast?.events || []).slice(0, 14).map((event) => `${event.exactAt.slice(0, 10)}  ${event.transit} ${event.aspect} ${event.target}  /  ${event.category}. Apply from ${event.applyingAt.slice(0, 10)}; review after ${event.separatingAt.slice(0, 10)}.`).join("\n\n") || "No annual timing events were supplied for this edition.";
  summaryText(windows, fonts, "Priority Windows", eventLines);
  const direction = page(doc, texture, fonts, blueprint.eyebrow);
  const profections = facts.forecast?.profections.map((item) => `${item.startsAt.slice(0, 10)}: House ${item.house} in ${item.sign}, led by ${item.lordOfYear}.`).join("\n") || "";
  summaryText(direction, fonts, "Direction and Review", `${profections}\n\n${report.closing}\n\nUse timing as a way to prepare and notice. It does not guarantee a specific event.`);
  return doc.save();
}
