import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { ChartFacts } from "./chartFacts.ts";
import type { EssentialReport, EssentialSection, EssentialSignature } from "./providers.ts";

const WIDTH = 612;
const HEIGHT = 792;
const MARGIN = 58;
const parchment = rgb(0.965, 0.934, 0.865);
const parchmentDark = rgb(0.88, 0.81, 0.68);
const ink = rgb(0.15, 0.09, 0.075);
const aubergine = rgb(0.235, 0.105, 0.09);
const gold = rgb(0.59, 0.39, 0.12);
const muted = rgb(0.39, 0.31, 0.27);
const deep = rgb(0.19, 0.095, 0.075);

type Fonts = { serif: PDFFont; bold: PDFFont; italic: PDFFont; sans: PDFFont; sansBold: PDFFont };

function safeText(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[\u2010-\u2015]/g, "-").replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[^\x20-\x7E\n]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of safeText(text).split(/\n+/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
      else { if (line) lines.push(line); line = word; }
    }
    if (line) lines.push(line);
    lines.push("");
  }
  if (lines.at(-1) === "") lines.pop();
  return lines;
}

function drawWrapped(page: PDFPage, text: string, font: PDFFont, size: number, x: number, y: number, maxWidth: number, lineHeight: number, color = ink): number {
  const lines = wrap(text, font, size, maxWidth);
  lines.forEach((line, index) => { if (line) page.drawText(line, { x, y: y - index * lineHeight, size, font, color }); });
  return y - lines.length * lineHeight;
}

function formatDegree(value: number): string {
  const degree = Math.floor(value);
  const minute = Math.round((value - degree) * 60);
  return `${degree} deg ${String(minute).padStart(2, "0")}'`;
}

function addPaper(page: PDFPage, pageNumber: number, texture: PDFImage, fonts: Fonts): void {
  page.drawImage(texture, { x: 0, y: 0, width: WIDTH, height: HEIGHT, opacity: 0.42 });
  page.drawRectangle({ x: 0, y: 0, width: WIDTH, height: HEIGHT, color: parchment, opacity: 0.72 });
  page.drawRectangle({ x: 18, y: 18, width: WIDTH - 36, height: HEIGHT - 36, borderColor: parchmentDark, borderWidth: 0.9 });
  page.drawRectangle({ x: 25, y: 25, width: WIDTH - 50, height: HEIGHT - 50, borderColor: gold, borderWidth: 0.35, opacity: 0.62 });
  page.drawText("MYSTIC BIRTH CHART / ESSENTIAL NATAL STUDY", { x: MARGIN, y: 758, size: 7, font: fonts.sansBold, color: gold });
  page.drawText(String(pageNumber).padStart(2, "0"), { x: WIDTH - 70, y: 35, size: 8, font: fonts.sans, color: gold });
}

function pageTitle(page: PDFPage, plate: string, title: string, fonts: Fonts): number {
  page.drawText(safeText(plate).toUpperCase(), { x: MARGIN, y: 716, size: 8, font: fonts.sansBold, color: gold });
  const y = drawWrapped(page, title, fonts.bold, 27, MARGIN, 678, WIDTH - MARGIN * 2, 31, aubergine);
  page.drawLine({ start: { x: MARGIN, y: y - 10 }, end: { x: WIDTH - MARGIN, y: y - 10 }, thickness: 0.75, color: gold, opacity: 0.7 });
  return y - 38;
}

function addPage(doc: PDFDocument, texture: PDFImage, fonts: Fonts): PDFPage {
  const page = doc.addPage([WIDTH, HEIGHT]);
  addPaper(page, doc.getPageCount(), texture, fonts);
  return page;
}

function sectionPage(doc: PDFDocument, texture: PDFImage, fonts: Fonts, plate: string, section: EssentialSection, evidence?: string): void {
  const page = addPage(doc, texture, fonts);
  let y = pageTitle(page, plate, section.title, fonts);
  if (evidence) {
    page.drawRectangle({ x: MARGIN, y: y - 46, width: WIDTH - MARGIN * 2, height: 44, color: rgb(0.985, 0.965, 0.91), borderColor: parchmentDark, borderWidth: 0.7 });
    page.drawText("TECHNICAL TESTIMONY", { x: MARGIN + 14, y: y - 18, size: 7, font: fonts.sansBold, color: gold });
    page.drawText(safeText(evidence), { x: MARGIN + 14, y: y - 35, size: 10, font: fonts.bold, color: aubergine });
    y -= 68;
  }
  drawWrapped(page, section.body, fonts.serif, 12.2, MARGIN, y, WIDTH - MARGIN * 2, 18.2, ink);
}

function signaturePage(doc: PDFDocument, texture: PDFImage, fonts: Fonts, signature: EssentialSignature, evidence: string): void {
  const page = addPage(doc, texture, fonts);
  let y = pageTitle(page, `Plate ${String(doc.getPageCount()).padStart(2, "0")} / Dominant signature ${signature.signatureRank}`, signature.title, fonts);
  page.drawRectangle({ x: MARGIN, y: y - 44, width: WIDTH - MARGIN * 2, height: 40, color: deep });
  page.drawText("CALCULATED EVIDENCE", { x: MARGIN + 14, y: y - 18, size: 7, font: fonts.sansBold, color: parchmentDark });
  page.drawText(safeText(evidence), { x: MARGIN + 14, y: y - 34, size: 10, font: fonts.bold, color: parchment });
  y = drawWrapped(page, signature.interpretation, fonts.serif, 11.7, MARGIN, y - 67, WIDTH - MARGIN * 2, 17.2, ink);
  const boxY = 104;
  const gap = 12;
  const boxWidth = (WIDTH - MARGIN * 2 - gap) / 2;
  page.drawRectangle({ x: MARGIN, y: boxY, width: boxWidth, height: 150, color: rgb(0.985, 0.965, 0.91), borderColor: parchmentDark, borderWidth: 0.7 });
  page.drawRectangle({ x: MARGIN + boxWidth + gap, y: boxY, width: boxWidth, height: 150, color: rgb(0.985, 0.965, 0.91), borderColor: parchmentDark, borderWidth: 0.7 });
  page.drawText("CONSTRUCTIVE EXPRESSION", { x: MARGIN + 12, y: boxY + 127, size: 7, font: fonts.sansBold, color: gold });
  drawWrapped(page, signature.constructiveExpression, fonts.serif, 8.5, MARGIN + 12, boxY + 108, boxWidth - 24, 11.2, ink);
  page.drawText("WHEN THE PATTERN TIGHTENS", { x: MARGIN + boxWidth + gap + 12, y: boxY + 127, size: 7, font: fonts.sansBold, color: gold });
  drawWrapped(page, signature.shadow, fonts.serif, 8.5, MARGIN + boxWidth + gap + 12, boxY + 108, boxWidth - 24, 11.2, ink);
  page.drawText("A QUESTION TO KEEP", { x: MARGIN, y: 79, size: 7, font: fonts.sansBold, color: gold });
  drawWrapped(page, signature.practicalQuestion, fonts.italic, 10.3, MARGIN + 114, 79, WIDTH - MARGIN * 2 - 114, 13, aubergine);
  void y;
}

function drawWheel(page: PDFPage, facts: ChartFacts, fonts: Fonts): void {
  const cx = 306; const cy = 405; const outer = 224; const inner = 148;
  const ascendant = facts.chart.angles.ascendant.longitude;
  const wheelAngle = (longitude: number) => radians(180 + longitude - ascendant);
  page.drawCircle({ x: cx, y: cy, size: outer, borderColor: gold, borderWidth: 1.2 });
  page.drawCircle({ x: cx, y: cy, size: inner, borderColor: parchmentDark, borderWidth: 0.8 });
  for (let index = 0; index < 12; index += 1) {
    const angle = wheelAngle(index * 30);
    page.drawLine({ start: { x: cx + Math.cos(angle) * inner, y: cy + Math.sin(angle) * inner }, end: { x: cx + Math.cos(angle) * outer, y: cy + Math.sin(angle) * outer }, thickness: 0.55, color: gold, opacity: 0.7 });
    const labelAngle = wheelAngle(index * 30 + 15);
    const label = ["ARI", "TAU", "GEM", "CAN", "LEO", "VIR", "LIB", "SCO", "SAG", "CAP", "AQU", "PIS"][index];
    page.drawText(label, { x: cx + Math.cos(labelAngle) * 188 - 10, y: cy + Math.sin(labelAngle) * 188 - 3, size: 7, font: fonts.sansBold, color: gold });
    const house = ((index - Math.floor(ascendant / 30) + 12) % 12) + 1;
    page.drawText(`H${house}`, { x: cx + Math.cos(labelAngle) * 165 - 7, y: cy + Math.sin(labelAngle) * 165 - 3, size: 6.5, font: fonts.sansBold, color: muted });
  }
  const points = new Map<string, { x: number; y: number }>();
  const abbreviations: Record<string, string> = { Sun: "SU", Moon: "MO", Mercury: "ME", Venus: "VE", Mars: "MA", Jupiter: "JU", Saturn: "SA", Uranus: "UR", Neptune: "NE", Pluto: "PL" };
  const plottedLongitudes: number[] = [];
  for (const placement of [...facts.chart.placements].sort((a, b) => a.longitude - b.longitude)) {
    const angle = wheelAngle(placement.longitude);
    const nearby = plottedLongitudes.filter((longitude) => Math.min(Math.abs(longitude - placement.longitude), 360 - Math.abs(longitude - placement.longitude)) < 6).length;
    const radius = 126 - nearby * 32;
    plottedLongitudes.push(placement.longitude);
    const point = { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
    points.set(placement.body, point);
    page.drawCircle({ x: point.x, y: point.y, size: 15, color: parchment, borderColor: gold, borderWidth: 0.7 });
    page.drawText(abbreviations[placement.body] || placement.body.slice(0, 2).toUpperCase(), { x: point.x - 7, y: point.y - 3, size: 7, font: fonts.sansBold, color: aubergine });
  }
  for (const aspect of facts.chart.aspects.filter((item) => item.orb <= 3 && points.has(item.body1) && points.has(item.body2)).slice(0, 14)) {
    const a = points.get(aspect.body1)!; const b = points.get(aspect.body2)!;
    const color = aspect.type === "trine" || aspect.type === "sextile" ? gold : aubergine;
    page.drawLine({ start: a, end: b, thickness: 0.55, color, opacity: 0.42 });
  }
  const ascAngle = wheelAngle(facts.chart.angles.ascendant.longitude);
  const mcAngle = wheelAngle(facts.chart.angles.midheaven.longitude);
  for (const [label, angle] of [["ASC", ascAngle], ["MC", mcAngle]] as const) {
    const x = cx + Math.cos(angle) * outer; const y = cy + Math.sin(angle) * outer;
    page.drawCircle({ x, y, size: 17, color: deep, borderColor: gold, borderWidth: 0.8 });
    page.drawText(label, { x: x - 9, y: y - 3, size: 7, font: fonts.sansBold, color: parchment });
  }
}

function radians(value: number): number { return value * Math.PI / 180; }

export async function createEssentialPdf(facts: ChartFacts, report: EssentialReport): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle("Essential Birth Chart Reading"); doc.setAuthor("Mystic Birth Chart"); doc.setSubject("A focused automated interpretation of the natal chart's principal patterns");
  const fonts: Fonts = {
    serif: await doc.embedFont(StandardFonts.TimesRoman), bold: await doc.embedFont(StandardFonts.TimesRomanBold),
    italic: await doc.embedFont(StandardFonts.TimesRomanItalic), sans: await doc.embedFont(StandardFonts.Helvetica), sansBold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const seal = await doc.embedPng(await readFile(join(process.cwd(), "..", "public", "brand", "mystic-astrolabe-seal-transparent.png")));
  const texture = await doc.embedJpg(await readFile(join(process.cwd(), "..", "public", "images", "textures", "parchment-reading-paper.jpg")));
  const sun = facts.chart.placements.find((item) => item.body === "Sun")!;
  const moon = facts.chart.placements.find((item) => item.body === "Moon")!;

  const cover = addPage(doc, texture, fonts);
  cover.drawImage(seal, { x: 174, y: 366, width: 264, height: 264, opacity: 0.09 });
  cover.drawImage(seal, { x: 270, y: 636, width: 72, height: 72, opacity: 0.92 });
  cover.drawText("THE OLD STUDY METHOD", { x: 237, y: 608, size: 8, font: fonts.sans, color: muted });
  let y = drawWrapped(cover, report.title, fonts.bold, 34, 82, 530, 448, 39, aubergine);
  y = drawWrapped(cover, `${sun.sign} Sun / ${moon.sign} Moon / ${facts.chart.angles.ascendant.sign} Rising`, fonts.italic, 17, 82, y - 18, 448, 23, gold);
  cover.drawLine({ start: { x: 82, y: y - 20 }, end: { x: 530, y: y - 20 }, thickness: 0.75, color: gold });
  drawWrapped(cover, "A calculated study of the three signatures that most strongly organize this natal chart, translated into practical language.", fonts.serif, 12.5, 82, 174, 448, 19, muted);
  cover.drawText("mysticbirthchart.com", { x: 237, y: 72, size: 9, font: fonts.sansBold, color: gold });

  const dataPage = addPage(doc, texture, fonts);
  y = pageTitle(dataPage, "Plate 02 / Calculation record", "The chart used for this reading", fonts);
  const utcInstant = new Date(facts.chart.utc).toISOString().replace("T", " at ").slice(0, 19) + " UTC";
  const rows = [
    ["Birth date and time", `${facts.birth.date} at ${facts.birth.time}`], ["Birthplace", facts.birth.location],
    ["Time zone", `${facts.birth.timezone} (UTC${facts.birth.utcOffset >= 0 ? "+" : ""}${facts.birth.utcOffset})`],
    ["Converted instant", utcInstant],
    ["Coordinates", `${facts.birth.latitude.toFixed(4)}, ${facts.birth.longitude.toFixed(4)}`],
    ["Framework", `${facts.chart.zodiac} zodiac / ${facts.chart.houseSystem} houses`],
    ["Ascendant", `${formatDegree(facts.chart.angles.ascendant.degree)} ${facts.chart.angles.ascendant.sign}`],
    ["Midheaven", `${formatDegree(facts.chart.angles.midheaven.degree)} ${facts.chart.angles.midheaven.sign}`],
    ["Sect and lunar phase", `${facts.chart.sect} / ${facts.chart.moonPhase.name} (${facts.chart.moonPhase.angle.toFixed(1)} deg)`],
  ];
  rows.forEach(([label, value], index) => {
    const rowY = y - index * 43;
    dataPage.drawText(label.toUpperCase(), { x: MARGIN, y: rowY, size: 7, font: fonts.sansBold, color: gold });
    drawWrapped(dataPage, value, fonts.bold, 11.5, MARGIN + 150, rowY, WIDTH - MARGIN * 2 - 150, 14, aubergine);
    dataPage.drawLine({ start: { x: MARGIN, y: rowY - 15 }, end: { x: WIDTH - MARGIN, y: rowY - 15 }, thickness: 0.45, color: parchmentDark });
  });
  dataPage.drawRectangle({ x: MARGIN, y: 91, width: WIDTH - MARGIN * 2, height: 98, color: deep });
  dataPage.drawText("BEFORE YOU READ", { x: MARGIN + 18, y: 166, size: 7, font: fonts.sansBold, color: parchmentDark });
  const ascendantDegree = facts.chart.angles.ascendant.degree;
  const cuspWarning = ascendantDegree < 2 || ascendantDegree > 28
    ? " The Ascendant is close to a sign boundary, so even a small time correction may change the rising sign."
    : "";
  drawWrapped(dataPage, `Birth time controls the Ascendant, houses, chart ruler, and angularity. Keep this page with the report and verify the recorded time against the most reliable source available.${cuspWarning}`, fonts.serif, 10.5, MARGIN + 18, 143, WIDTH - MARGIN * 2 - 36, 15, parchment);

  const wheelPage = addPage(doc, texture, fonts);
  pageTitle(wheelPage, "Plate 03 / Natal figure", "Your calculated chart", fonts);
  drawWheel(wheelPage, facts, fonts);
  wheelPage.drawText("PLANETARY POSITIONS / WHOLE-SIGN HOUSES", { x: MARGIN, y: 142, size: 7, font: fonts.sansBold, color: gold });
  facts.chart.placements.forEach((placement, index) => {
    const column = index < 5 ? 0 : 1; const row = index % 5; const x = MARGIN + column * 250; const py = 122 - row * 18;
    wheelPage.drawText(`${placement.body.padEnd(8)} ${formatDegree(placement.degree)} ${placement.sign} / H${placement.house} / ${placement.dignity}`, { x, y: py, size: 7.5, font: fonts.sans, color: ink });
  });

  const sentencePage = addPage(doc, texture, fonts);
  y = pageTitle(sentencePage, "Plate 04 / First judgment", "Your chart in one sentence", fonts);
  y = drawWrapped(sentencePage, report.chartSentence, fonts.serif, 13.2, MARGIN, y, WIDTH - MARGIN * 2, 19.4, ink);
  sentencePage.drawText("THE THREE SIGNATURES SELECTED", { x: MARGIN, y: y - 30, size: 8, font: fonts.sansBold, color: gold });
  facts.chart.dominantSignatures.forEach((signature, index) => {
    const top = y - 54 - index * 76;
    sentencePage.drawRectangle({ x: MARGIN, y: top - 52, width: WIDTH - MARGIN * 2, height: 60, color: rgb(0.985, 0.965, 0.91), borderColor: parchmentDark, borderWidth: 0.7 });
    sentencePage.drawText(`0${index + 1}`, { x: MARGIN + 16, y: top - 18, size: 18, font: fonts.bold, color: gold });
    sentencePage.drawText(safeText(signature.title), { x: MARGIN + 58, y: top - 12, size: 13, font: fonts.bold, color: aubergine });
    dataPage.drawText("", { x: 0, y: 0, size: 1, font: fonts.sans });
    sentencePage.drawText(safeText(signature.evidence), { x: MARGIN + 58, y: top - 35, size: 9, font: fonts.sans, color: muted });
  });

  report.dominantSignatures.forEach((signature, index) => signaturePage(doc, texture, fonts, signature, facts.chart.dominantSignatures[index]?.evidence || "Calculated dominant signature"));
  sectionPage(doc, texture, fonts, "Plate 08 / Solar principle", report.bigThree.sun, `${sun.body} at ${formatDegree(sun.degree)} ${sun.sign}, whole-sign house ${sun.house}, ${sun.dignity}`);
  sectionPage(doc, texture, fonts, "Plate 09 / Lunar principle", report.bigThree.moon, `${moon.body} at ${formatDegree(moon.degree)} ${moon.sign}, whole-sign house ${moon.house}, ${moon.dignity}; ${facts.chart.moonPhase.name}`);
  sectionPage(doc, texture, fonts, "Plate 10 / Eastern horizon", report.bigThree.ascendant, `Ascendant at ${formatDegree(facts.chart.angles.ascendant.degree)} ${facts.chart.angles.ascendant.sign}; traditional ruler ${facts.chart.chartRuler}`);
  const ruler = facts.chart.placements.find((item) => item.body === facts.chart.chartRuler)!;
  sectionPage(doc, texture, fonts, "Plate 11 / Chart ruler", report.chartRuler, `${ruler.body} at ${formatDegree(ruler.degree)} ${ruler.sign}, whole-sign house ${ruler.house}, ${ruler.dignity}`);
  sectionPage(doc, texture, fonts, "Plate 12 / Application", report.applications.purposeAndWork);
  sectionPage(doc, texture, fonts, "Plate 13 / Application", report.applications.emotionalNeeds);
  sectionPage(doc, texture, fonts, "Plate 14 / Application", report.applications.relationshipsAndBoundaries);

  const strengthsPage = addPage(doc, texture, fonts);
  y = pageTitle(strengthsPage, "Plate 15 / Practical synthesis", "Strengths and tensions", fonts);
  for (const [heading, items] of [["THREE AVAILABLE STRENGTHS", report.practicalDirection.strengths], ["THREE PATTERNS TO WATCH", report.practicalDirection.tensions]] as const) {
    strengthsPage.drawText(heading, { x: MARGIN, y, size: 8, font: fonts.sansBold, color: gold }); y -= 25;
    items.forEach((item, index) => { strengthsPage.drawText(`0${index + 1}`, { x: MARGIN, y, size: 13, font: fonts.bold, color: gold }); y = drawWrapped(strengthsPage, item, fonts.serif, 10.5, MARGIN + 40, y, WIDTH - MARGIN * 2 - 40, 14.5, ink) - 14; });
    y -= 10;
  }

  const actionsPage = addPage(doc, texture, fonts);
  y = pageTitle(actionsPage, "Plate 16 / Practical direction", "Three ways to work with the chart", fonts);
  report.practicalDirection.actions.forEach((item, index) => {
    actionsPage.drawRectangle({ x: MARGIN, y: y - 82, width: WIDTH - MARGIN * 2, height: 74, color: rgb(0.985, 0.965, 0.91), borderColor: parchmentDark, borderWidth: 0.7 });
    actionsPage.drawText(`0${index + 1}`, { x: MARGIN + 14, y: y - 35, size: 18, font: fonts.bold, color: gold });
    drawWrapped(actionsPage, item, fonts.serif, 10.2, MARGIN + 54, y - 26, WIDTH - MARGIN * 2 - 70, 13.5, ink); y -= 94;
  });
  actionsPage.drawText("QUESTIONS FOR THE OLD STUDY", { x: MARGIN, y: y - 8, size: 8, font: fonts.sansBold, color: gold }); y -= 36;
  report.practicalDirection.questions.forEach((question) => { y = drawWrapped(actionsPage, `- ${question}`, fonts.italic, 11.2, MARGIN, y, WIDTH - MARGIN * 2, 15, aubergine) - 10; });

  const finalPage = addPage(doc, texture, fonts);
  y = pageTitle(finalPage, "Plate 17 / Closing synthesis", "What to carry forward", fonts);
  y = drawWrapped(finalPage, report.closing, fonts.serif, 12.2, MARGIN, y, WIDTH - MARGIN * 2, 18.2, ink) - 28;
  finalPage.drawText("ABOUT THIS READING", { x: MARGIN, y, size: 8, font: fonts.sansBold, color: gold });
  y = drawWrapped(finalPage, report.scopeNote, fonts.serif, 10.8, MARGIN, y - 25, WIDTH - MARGIN * 2, 15, muted);
  finalPage.drawRectangle({ x: MARGIN, y: 92, width: WIDTH - MARGIN * 2, height: 112, color: deep, borderColor: gold, borderWidth: 0.8 });
  finalPage.drawText("WHEN YOU WANT THE WHOLE CHART JUDGED", { x: MARGIN + 22, y: 174, size: 7, font: fonts.sansBold, color: parchmentDark });
  finalPage.drawText("Complete Natal Reading / $97", { x: MARGIN + 22, y: 145, size: 18, font: fonts.bold, color: parchment });
  drawWrapped(finalPage, "Individually reviewed across all planets, houses, rulers, dignities, aspects, receptions, and repeated testimony.", fonts.sans, 9.5, MARGIN + 22, 124, WIDTH - MARGIN * 2 - 44, 13, parchmentDark);
  finalPage.drawText("mysticbirthchart.com/complete-natal-chart-reading", { x: MARGIN + 22, y: 74, size: 8.5, font: fonts.sansBold, color: gold });

  return doc.save();
}
