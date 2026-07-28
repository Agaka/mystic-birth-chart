import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { ProductFacts } from "./reportFacts.ts";
import type { ReportBlueprint } from "./reportCatalog.ts";
import type { ProductReport } from "./productProviders.ts";

const width = 612;
const height = 792;
const margin = 58;
const parchment = rgb(0.965, 0.934, 0.865);
const parchmentDark = rgb(0.88, 0.81, 0.68);
const ink = rgb(0.15, 0.09, 0.075);
const gold = rgb(0.59, 0.39, 0.12);
const muted = rgb(0.39, 0.31, 0.27);
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

function drawFlow(doc: PDFDocument, texture: PDFImage, fonts: Fonts, eyebrow: string, title: string, body: string): void {
  const lines = wrap(body, fonts.serif, 11.1, width - margin * 2);
  let current = page(doc, texture, fonts, eyebrow);
  let y = 714;
  current.drawText(clean(title), { x: margin, y, size: 25, font: fonts.serif, color: ink }); y -= 46;
  for (const line of lines) {
    if (y < 72) { current = page(doc, texture, fonts, eyebrow); y = 714; }
    if (line) current.drawText(line, { x: margin, y, size: 11.1, font: fonts.serif, color: ink });
    y -= line ? 18.5 : 11;
  }
}

function identityPage(doc: PDFDocument, texture: PDFImage, fonts: Fonts, blueprint: ReportBlueprint, facts: ProductFacts, report: ProductReport): void {
  const cover = page(doc, texture, fonts, blueprint.eyebrow);
  cover.drawText(clean(blueprint.eyebrow).toUpperCase(), { x: margin, y: 655, size: 9, font: fonts.sansBold, color: gold });
  const titleLines = wrap(report.title || blueprint.title, fonts.serif, 36, 430);
  titleLines.forEach((line, index) => cover.drawText(line, { x: margin, y: 590 - index * 42, size: 36, font: fonts.serif, color: ink }));
  cover.drawText(clean(facts.natal.birth.location), { x: margin, y: 250, size: 15, font: fonts.italic, color: gold });
  cover.drawText(`${facts.natal.birth.date} at ${facts.natal.birth.time}`, { x: margin, y: 220, size: 12, font: fonts.serif, color: muted });
  const record = page(doc, texture, fonts, blueprint.eyebrow);
  record.drawText("Calculation Record", { x: margin, y: 710, size: 28, font: fonts.serif, color: ink });
  const rows = [
    ["Birth", `${facts.natal.birth.date} at ${facts.natal.birth.time}`], ["Place", facts.natal.birth.location], ["Coordinates", `${facts.natal.birth.latitude.toFixed(4)}, ${facts.natal.birth.longitude.toFixed(4)}`], ["Time zone", facts.natal.birth.timezone],
    ["System", `${facts.natal.chart.zodiac} zodiac / ${facts.natal.chart.houseSystem} houses`], ["Ascendant", `${facts.natal.chart.angles.ascendant.degreeLabel} ${facts.natal.chart.angles.ascendant.sign}`], ["Midheaven", `${facts.natal.chart.angles.midheaven.degreeLabel} ${facts.natal.chart.angles.midheaven.sign}`], ["Sect", facts.natal.chart.sect], ["Moon phase", `${facts.natal.chart.moonPhase.name} / ${facts.natal.chart.moonPhase.timingLabel}`],
  ];
  rows.forEach(([label, value], index) => { const y = 650 - index * 48; record.drawText(label.toUpperCase(), { x: margin, y, size: 8, font: fonts.sansBold, color: gold }); record.drawText(clean(value), { x: margin, y: y - 18, size: 13, font: fonts.serif, color: ink }); });
}

function referencePages(doc: PDFDocument, texture: PDFImage, fonts: Fonts, blueprint: ReportBlueprint, facts: ProductFacts): void {
  const positions = facts.natal.chart.placements.map((placement) => [placement.body, `${placement.degreeLabel} ${placement.sign}`, `House ${placement.house}`, placement.dignities.length ? placement.dignities.join(" and ") : "No major essential dignity"]);
  positions.push(["Ascendant", `${facts.natal.chart.angles.ascendant.degreeLabel} ${facts.natal.chart.angles.ascendant.sign}`, "First house", `Chart ruler: ${facts.natal.chart.chartRuler}`]);
  positions.push(["Midheaven", `${facts.natal.chart.angles.midheaven.degreeLabel} ${facts.natal.chart.angles.midheaven.sign}`, "", ""]);
  const tables: Array<{ title: string; rows: string[][] }> = [
    { title: "Planetary Positions and Conditions", rows: positions },
    { title: "Aspect Record", rows: facts.natal.chart.aspects.map((aspect) => [`${aspect.body1} ${aspect.outOfSign ? "out-of-sign " : ""}${aspect.type} ${aspect.body2}`, `${aspect.orbLabel} orb`, aspect.outOfSign ? "Secondary testimony" : "Sign-based aspect"]) },
    { title: "Whole-Sign Houses and Rulers", rows: Array.from({ length: 12 }, (_, index) => { const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]; const rulers: Record<string, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" }; const sign = signs[(signs.indexOf(facts.natal.chart.angles.ascendant.sign) + index) % 12]!; const occupants = facts.natal.chart.placements.filter((placement) => placement.house === index + 1).map((placement) => placement.body).join(", ") || "No planets"; return [`House ${index + 1}`, sign, `Ruler: ${rulers[sign]}`, occupants]; }) },
  ];
  if (facts.annual) tables.push(
    { title: "Annual Cycle at a Glance", rows: [
      ["Period", `${facts.annual.period.startsAt.slice(0, 10)} to ${facts.annual.period.endsAt.slice(0, 10)}`, facts.annual.period.returnLocation],
      ["Annual profection", `Age ${facts.annual.profection.age}`, `House ${facts.annual.profection.house} / ${facts.annual.profection.sign}`],
      ["Lord of the Year", facts.annual.profection.lordOfYear, `Natal houses ruled: ${facts.annual.profection.natalHousesRuled.join(", ")}`],
      ["Solar Return Ascendant", `${facts.annual.solarReturn.angles.ascendant.degreeLabel} ${facts.annual.solarReturn.angles.ascendant.sign}`, `Sect: ${facts.annual.solarReturn.sect}`],
    ] },
    { title: "Monthly Annual Record", rows: facts.annual.monthlySky.map((month) => ["Month " + month.month, month.startsAt.slice(0, 10), `Ascendant ${month.chart.angles.ascendant.degreeLabel} ${month.chart.angles.ascendant.sign}`, month.chart.moonPhase.name]) },
  );
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
  const fonts = { serif, bold, italic, sans, sansBold };
  identityPage(doc, texture, fonts, blueprint, facts, report);
  drawFlow(doc, texture, fonts, blueprint.eyebrow, "The Longer View", report.introduction);
  referencePages(doc, texture, fonts, blueprint, facts);
  for (const chapter of report.chapters) drawFlow(doc, texture, fonts, blueprint.eyebrow, chapter.title, chapter.body);
  drawFlow(doc, texture, fonts, blueprint.eyebrow, "Applied Direction", report.practicalSummary);
  drawFlow(doc, texture, fonts, blueprint.eyebrow, "Closing Synthesis", report.closing);
  drawFlow(doc, texture, fonts, blueprint.eyebrow, "About This Reading", report.scopeNote);
  return doc.save();
}
