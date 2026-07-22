import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { ChartFacts } from "./chartFacts.ts";
import type { EssentialReport } from "./providers.ts";

const width = 612, height = 792, margin = 56;
const parchment = rgb(0.957, 0.925, 0.855), ink = rgb(0.16, 0.105, 0.09), gold = rgb(0.58, 0.39, 0.13), aubergine = rgb(0.235, 0.12, 0.11);
function wrap(text: string, font: { widthOfTextAtSize(value: string, size: number): number }, size: number, max: number) { const lines: string[] = []; let line = ""; for (const word of text.replace(/[^\x20-\x7E]/g, "").split(/\s+/)) { const candidate = line ? `${line} ${word}` : word; if (font.widthOfTextAtSize(candidate, size) <= max) line = candidate; else { if (line) lines.push(line); line = word; } } if (line) lines.push(line); return lines; }

export async function createEssentialPdf(facts: ChartFacts, report: EssentialReport): Promise<Uint8Array> {
  const doc = await PDFDocument.create(); const serif = await doc.embedFont(StandardFonts.TimesRoman), bold = await doc.embedFont(StandardFonts.TimesRomanBold), sans = await doc.embedFont(StandardFonts.HelveticaBold);
  const seal = await doc.embedPng(await readFile(join(process.cwd(), "..", "public", "brand", "mystic-astrolabe-seal-transparent.png")));
  const page = doc.addPage([width, height]); page.drawRectangle({ x: 0, y: 0, width, height, color: parchment }); page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: gold, borderWidth: 0.7 }); page.drawImage(seal, { x: 170, y: 360, width: 270, height: 270, opacity: 0.09 });
  page.drawText("MYSTIC BIRTH CHART", { x: 206, y: 650, size: 10, font: sans, color: gold }); page.drawText("AUTOMATED ESSENTIAL BIRTH CHART READING", { x: 130, y: 626, size: 8, font: sans, color: ink });
  let y = 560; for (const line of wrap(report.title, bold, 31, 440)) { page.drawText(line, { x: 86, y, size: 31, font: bold, color: aubergine }); y -= 38; }
  page.drawText(`${facts.sun} / ${facts.moon} / ${facts.rising}`, { x: 86, y: y - 16, size: 16, font: serif, color: gold });
  page.drawText("Generated automatically from your submitted birth data.", { x: 86, y: 130, size: 10, font: serif, color: ink });
  const sections = [
    { eyebrow: "FIRST SYNTHESIS", title: report.title, body: report.opening },
    ...report.sections,
    report.focusSection,
    { eyebrow: "CLOSING NOTE", title: "A pattern to keep observing", body: report.closing },
    { eyebrow: "SCOPE", title: "What this reading covers", body: report.scopeNote },
  ];
  let content = doc.addPage([width, height]);
  let cy = 730;
  const drawPageFrame = () => {
    content.drawRectangle({ x: 0, y: 0, width, height, color: parchment });
    content.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: gold, borderWidth: 0.7 });
    content.drawText("MYSTIC BIRTH CHART / AUTOMATED ESSENTIAL READING", { x: margin, y: 760, size: 7, font: sans, color: gold });
  };
  const nextPage = () => { content = doc.addPage([width, height]); cy = 730; drawPageFrame(); };
  drawPageFrame();
  for (const section of sections) {
    const titleLines = wrap(section.title, bold, 22, 500);
    const bodyLines = wrap(section.body, serif, 12, 500);
    const required = 24 + titleLines.length * 27 + 16 + bodyLines.length * 18 + 26;
    if (cy - required < 58) nextPage();
    content.drawText(section.eyebrow.toUpperCase(), { x: margin, y: cy, size: 8, font: sans, color: gold });
    cy -= 28;
    for (const line of titleLines) { content.drawText(line, { x: margin, y: cy, size: 22, font: bold, color: aubergine }); cy -= 27; }
    cy -= 8;
    for (const line of bodyLines) { content.drawText(line, { x: margin, y: cy, size: 12, font: serif, color: ink }); cy -= 18; }
    cy -= 26;
  }
  return doc.save();
}
