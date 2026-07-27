import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { ChartFacts } from "./chartFacts.ts";
import type { EssentialReport } from "./providers.ts";

const width = 612;
const height = 792;
const margin = 56;
const parchment = rgb(0.957, 0.925, 0.855);
const parchmentDark = rgb(0.902, 0.846, 0.741);
const ink = rgb(0.16, 0.105, 0.09);
const aubergine = rgb(0.235, 0.12, 0.11);
const gold = rgb(0.58, 0.39, 0.13);
const muted = rgb(0.39, 0.31, 0.27);

function safeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x20-\x7E\n]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of safeText(text).split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawWrapped(page: PDFPage, text: string, font: PDFFont, size: number, x: number, y: number, maxWidth: number, lineHeight: number, color = ink): number {
  const lines = wrap(text, font, size, maxWidth);
  lines.forEach((line, index) => page.drawText(line, { x, y: y - index * lineHeight, size, font, color }));
  return y - lines.length * lineHeight;
}

function addPaper(page: PDFPage, pageNumber: number, texture: PDFImage | null): void {
  if (texture) {
    page.drawImage(texture, { x: 0, y: 0, width, height, opacity: 0.78 });
    page.drawRectangle({ x: 0, y: 0, width, height, color: parchment, opacity: 0.42 });
  } else page.drawRectangle({ x: 0, y: 0, width, height, color: parchment });
  page.drawRectangle({ x: 18, y: 18, width: width - 36, height: height - 36, borderColor: parchmentDark, borderWidth: 1 });
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: gold, borderWidth: 0.35, opacity: 0.55 });
  for (let y = 52; y < height - 40; y += 38) page.drawLine({ start: { x: 32, y }, end: { x: width - 32, y }, thickness: 0.18, color: parchmentDark, opacity: 0.2 });
  page.drawText(String(pageNumber).padStart(2, "0"), { x: width - 68, y: 34, size: 8, color: gold });
}

function frame(page: PDFPage, pageNumber: number, texture: PDFImage | null, sans: PDFFont): void {
  addPaper(page, pageNumber, texture);
  page.drawText("MYSTIC BIRTH CHART / AUTOMATED ESSENTIAL READING", { x: margin, y: 758, size: 7, font: sans, color: gold });
}

function chapter(doc: PDFDocument, label: string, title: string, body: string, texture: PDFImage | null, serif: PDFFont, bold: PDFFont, sans: PDFFont): void {
  const page = doc.addPage([width, height]);
  frame(page, doc.getPageCount(), texture, sans);
  page.drawText(safeText(label).toUpperCase(), { x: margin, y: 710, size: 8, font: sans, color: gold });
  let y = drawWrapped(page, title, bold, 28, margin, 674, width - margin * 2, 33, aubergine);
  page.drawLine({ start: { x: margin, y: y - 8 }, end: { x: width - margin, y: y - 8 }, thickness: 0.8, color: gold, opacity: 0.65 });
  y = drawWrapped(page, body, serif, 13.2, margin, y - 38, width - margin * 2, 20, ink);
  page.drawRectangle({ x: margin, y: 86, width: width - margin * 2, height: 62, color: rgb(0.21, 0.12, 0.1), borderColor: gold, borderWidth: 0.7 });
  page.drawText("AUTOMATED FIRST SYNTHESIS", { x: margin + 18, y: 124, size: 7, font: sans, color: parchmentDark });
  drawWrapped(page, "This chapter is generated from the supplied birth data and the visible factors named above. It is not a hand-prepared Complete Reading.", sans, 8.5, margin + 18, 108, width - margin * 2 - 36, 12, parchment);
}

export async function createEssentialPdf(facts: ChartFacts, report: EssentialReport): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle("Essential Birth Chart Reading");
  doc.setAuthor("Mystic Birth Chart Editorial Studio");
  doc.setSubject("Automated traditional-first birth chart synthesis");
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const seal = await doc.embedPng(await readFile(join(process.cwd(), "..", "public", "brand", "mystic-astrolabe-seal-transparent.png")));
  const cover = doc.addPage([width, height]);
  addPaper(cover, doc.getPageCount(), null);
  cover.drawImage(seal, { x: 168, y: 370, width: 276, height: 276, opacity: 0.1 });
  cover.drawImage(seal, { x: 270, y: 634, width: 72, height: 72, opacity: 0.92 });
  cover.drawText("MYSTIC BIRTH CHART", { x: 205, y: 611, size: 11, font: sansBold, color: gold });
  cover.drawText("THE OLD STUDY METHOD", { x: 231, y: 593, size: 8, font: sans, color: muted });
  let y = drawWrapped(cover, safeText(report.title), bold, 33, 86, 525, 440, 38, aubergine);
  y = drawWrapped(cover, `${facts.sun} / ${facts.moon} / ${facts.rising}`, italic, 17, 86, y - 18, 440, 23, gold);
  cover.drawLine({ start: { x: 86, y: y - 20 }, end: { x: 526, y: y - 20 }, thickness: 0.7, color: gold, opacity: 0.75 });
  drawWrapped(cover, "A dense automated first synthesis of the visible architecture of your chart. It is designed to be useful on its own while showing where a complete judgment requires more evidence.", serif, 12.5, 86, 180, 440, 19, muted);
  cover.drawText("mysticbirthchart.com", { x: 233, y: 72, size: 9, font: sansBold, color: gold });

  const overview = doc.addPage([width, height]);
  frame(overview, doc.getPageCount(), null, sans);
  overview.drawText("PLATE I / CHART AT A GLANCE", { x: margin, y: 710, size: 8, font: sansBold, color: gold });
  y = drawWrapped(overview, "The visible architecture", bold, 28, margin, 674, width - margin * 2, 33, aubergine);
  overview.drawLine({ start: { x: margin, y: y - 8 }, end: { x: width - margin, y: y - 8 }, thickness: 0.8, color: gold, opacity: 0.65 });
  const factsList = [["SUN", facts.sun], ["MOON", facts.moon], ["RISING", facts.rising], ["CHART RULER", facts.chartRuler], ["SECT", facts.sect], ["MOON PHASE", facts.moonPhase]];
  const factY = y - 42;
  factsList.forEach(([label, value], index) => {
    const row = Math.floor(index / 2);
    const column = index % 2;
    const x = margin + column * 252;
    const top = factY - row * 68;
    overview.drawRectangle({ x, y: top - 48, width: 228, height: 56, color: rgb(1, 0.985, 0.94), borderColor: parchmentDark, borderWidth: 0.7 });
    overview.drawText(label, { x: x + 12, y: top - 12, size: 7, font: sansBold, color: gold });
    drawWrapped(overview, value, bold, 12.5, x + 12, top - 31, 204, 15, aubergine);
  });
  overview.drawText("The pages that follow are twelve distinct chapters, followed by your selected focus and the boundary of this automated report.", { x: margin, y: 78, size: 9, font: sans, color: muted });

  chapter(doc, "Plate II / First synthesis", "The chart as a whole", report.opening, null, serif, bold, sans);
  report.sections.forEach((section, index) => chapter(doc, `Plate ${String(index + 3).padStart(2, "0")} / ${section.eyebrow}`, section.title, section.body, null, serif, bold, sans));
  chapter(doc, "Selected focus", report.focusSection.title, report.focusSection.body, null, serif, bold, sans);

  const finalPage = doc.addPage([width, height]);
  frame(finalPage, doc.getPageCount(), null, sans);
  finalPage.drawText("FINAL PLATE / READING BOUNDARY", { x: margin, y: 710, size: 8, font: sansBold, color: gold });
  y = drawWrapped(finalPage, "What this first study can and cannot judge", bold, 27, margin, 674, width - margin * 2, 32, aubergine);
  finalPage.drawLine({ start: { x: margin, y: y - 8 }, end: { x: width - margin, y: y - 8 }, thickness: 0.8, color: gold, opacity: 0.65 });
  y = drawWrapped(finalPage, report.closing, serif, 13.2, margin, y - 38, width - margin * 2, 20, ink);
  y -= 28;
  finalPage.drawText("SCOPE OF THIS AUTOMATED READING", { x: margin, y, size: 8, font: sansBold, color: gold });
  drawWrapped(finalPage, report.scopeNote, serif, 12.5, margin, y - 28, width - margin * 2, 19, ink);
  finalPage.drawRectangle({ x: margin, y: 102, width: width - margin * 2, height: 116, color: rgb(0.21, 0.12, 0.1), borderColor: gold, borderWidth: 0.8 });
  finalPage.drawText("CONTINUE WITH A COMPLETE JUDGMENT", { x: margin + 24, y: 190, size: 8, font: sansBold, color: parchmentDark });
  finalPage.drawText("Complete Natal Reading / $97", { x: margin + 24, y: 158, size: 19, font: bold, color: parchment });
  drawWrapped(finalPage, "The Essential is automated and immediate. The Complete Reading is individually analyzed and connects houses, rulers, condition, aspects, and repeated testimony into one prioritized report.", sans, 9.5, margin + 24, 137, 430, 13, parchmentDark);
  finalPage.drawText("mysticbirthchart.com/complete-natal-chart-reading", { x: margin + 24, y: 81, size: 8.5, font: sansBold, color: gold });

  return doc.save();
}
