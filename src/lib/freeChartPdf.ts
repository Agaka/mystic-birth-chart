import fs from "node:fs";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFImage, type PDFPage, type PDFFont } from "pdf-lib";
import type { NatalSnapshotResult } from "./natalSnapshot.ts";
import type { ReadingSection } from "./freeChartReading.ts";

export interface FreeChartPdfData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  result: NatalSnapshotResult;
  sections: ReadingSection[];
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 56;
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

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = safeText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
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

function addPaper(page: PDFPage, pageNumber: number, texture: PDFImage | null) {
  if (texture) {
    page.drawImage(texture, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, opacity: 0.78 });
    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: parchment, opacity: 0.42 });
  } else {
    page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: parchment });
  }
  page.drawRectangle({ x: 18, y: 18, width: PAGE_WIDTH - 36, height: PAGE_HEIGHT - 36, borderColor: parchmentDark, borderWidth: 1 });
  page.drawRectangle({ x: 24, y: 24, width: PAGE_WIDTH - 48, height: PAGE_HEIGHT - 48, borderColor: gold, borderWidth: 0.35, opacity: 0.55 });
  for (let y = 52; y < PAGE_HEIGHT - 40; y += 38) {
    page.drawLine({ start: { x: 32, y }, end: { x: PAGE_WIDTH - 32, y }, thickness: 0.18, color: parchmentDark, opacity: 0.2 });
  }
  page.drawText(String(pageNumber).padStart(2, "0"), { x: PAGE_WIDTH - 68, y: 34, size: 8, color: gold });
}

function drawWrapped(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  color = ink,
): number {
  const lines = wrapText(text, font, size, maxWidth);
  lines.forEach((line, index) => page.drawText(line, { x, y: y - index * lineHeight, size, font, color }));
  return y - lines.length * lineHeight;
}

function drawHeader(page: PDFPage, label: string, title: string, serif: PDFFont, sansBold: PDFFont) {
  page.drawText(label.toUpperCase(), { x: MARGIN, y: 722, size: 8.5, font: sansBold, color: gold });
  const nextY = drawWrapped(page, title, serif, 28, MARGIN, 685, PAGE_WIDTH - MARGIN * 2, 31, aubergine);
  page.drawLine({ start: { x: MARGIN, y: nextY - 4 }, end: { x: PAGE_WIDTH - MARGIN, y: nextY - 4 }, thickness: 0.8, color: gold, opacity: 0.6 });
  return nextY - 30;
}

export async function createFreeChartPdf(data: FreeChartPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${data.name || "Your"} Free Birth Chart Preview`);
  doc.setAuthor("Mystic Birth Chart Editorial Studio");
  doc.setSubject("Traditional-first free birth chart preview");
  doc.setKeywords(["birth chart", "astrology", "Sun Moon Rising", "Mystic Birth Chart"]);

  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const iconPath = path.join(process.cwd(), "src", "app", "icon.png");
  const icon = fs.existsSync(iconPath) ? await doc.embedPng(fs.readFileSync(iconPath)) : null;
  const texturePath = path.join(process.cwd(), "public", "images", "textures", "parchment-reading-paper.jpg");
  const texture = fs.existsSync(texturePath) ? await doc.embedJpg(fs.readFileSync(texturePath)) : null;

  const addPage = () => {
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    addPaper(page, doc.getPageCount(), texture);
    return page;
  };

  const cover = addPage();
  if (icon) cover.drawImage(icon, { x: 251, y: 622, width: 110, height: 110 });
  cover.drawText("MYSTIC BIRTH CHART", { x: 205, y: 590, size: 11, font: sansBold, color: gold });
  cover.drawText("THE OLD STUDY METHOD", { x: 221, y: 568, size: 8, font: sans, color: muted });
  let y = drawWrapped(cover, "Your First Birth Chart Reading", serifBold, 34, 86, 500, 440, 38, aubergine);
  y = drawWrapped(cover, `${data.result.sunSign} Sun / ${data.result.moonSign} Moon / ${data.result.risingSign} Rising`, serifItalic, 18, 86, y - 16, 440, 24, gold);
  cover.drawLine({ start: { x: 118, y: y - 18 }, end: { x: 494, y: y - 18 }, thickness: 0.7, color: gold });
  y = drawWrapped(cover, `Prepared for ${data.name || "the chart holder"}`, serif, 16, 86, y - 60, 440, 22, ink);
  y = drawWrapped(cover, `${data.birthDate} at ${data.birthTime} / ${data.birthCity}`, sans, 9.5, 86, y - 8, 440, 14, muted);
  drawWrapped(cover, "A substantial free preview of the chart's visible architecture. Useful by itself, intentionally unfinished where houses, full planetary condition, aspects, and prioritized synthesis begin.", serif, 12.5, 105, 178, 402, 19, muted);
  cover.drawText("mysticbirthchart.com", { x: 233, y: 72, size: 9, font: sansBold, color: gold });

  const overview = addPage();
  y = drawHeader(overview, "Plate I / Chart at a glance", "The visible architecture", serifBold, sansBold);
  y = drawWrapped(overview, data.result.summary, serif, 13.5, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 20, ink);
  y -= 22;
  const columns = [
    ["SUN", data.result.sunSign, "Purpose and organizing light"],
    ["MOON", data.result.moonSign, "Need, memory, and response"],
    ["ASCENDANT", data.result.risingSign, "Approach and chart doorway"],
  ];
  columns.forEach((item, index) => {
    const x = MARGIN + index * 168;
    overview.drawRectangle({ x, y: y - 118, width: 150, height: 112, color: rgb(1, 0.985, 0.94), borderColor: parchmentDark, borderWidth: 0.7 });
    overview.drawText(item[0], { x: x + 12, y: y - 26, size: 7.5, font: sansBold, color: gold });
    overview.drawText(item[1], { x: x + 12, y: y - 56, size: 19, font: serifBold, color: aubergine });
    drawWrapped(overview, item[2], sans, 8.5, x + 12, y - 77, 126, 12, muted);
  });
  y -= 150;
  y = drawWrapped(overview, `Chart ruler: ${data.result.chartRuler}`, serifBold, 19, MARGIN, y, 300, 24, aubergine);
  y = drawWrapped(overview, data.result.rulerInterpretation.body, serif, 12.2, MARGIN, y - 4, PAGE_WIDTH - MARGIN * 2, 18, ink);
  y -= 16;
  drawWrapped(overview, `${data.result.sect}. ${data.result.sectInterpretation.body}`, serif, 12.2, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 18, ink);

  const placements = [
    { label: "Plate II / The solar center", placement: data.result.placements[0] },
    { label: "Plate III / The lunar body", placement: data.result.placements[1] },
    { label: "Plate IV / The horizon", placement: data.result.placements[2] },
  ];
  placements.forEach(({ label, placement }) => {
    const page = addPage();
    let py = drawHeader(page, label, placement.title, serifBold, sansBold);
    py = drawWrapped(page, placement.body, serif, 14, MARGIN, py, PAGE_WIDTH - MARGIN * 2, 21, ink);
    const relatedEyebrow = placement.title.startsWith("Moon")
      ? "Solar-lunar rhythm"
      : placement.title.startsWith("Rising")
        ? "Chart leadership"
        : "First synthesis";
    const related = data.sections.find((section) => section.eyebrow === relatedEyebrow);
    if (related) {
      py -= 28;
      page.drawText(related.eyebrow.toUpperCase(), { x: MARGIN, y: py, size: 8, font: sansBold, color: gold });
      py = drawWrapped(page, related.title, serifBold, 21, MARGIN, py - 30, PAGE_WIDTH - MARGIN * 2, 26, aubergine);
      drawWrapped(page, related.body, serif, 12.7, MARGIN, py - 4, PAGE_WIDTH - MARGIN * 2, 19, ink);
    }
  });

  const synthesis = addPage();
  y = drawHeader(synthesis, "Plate V / Synthesis", "Where the chart begins to speak", serifBold, sansBold);
  for (const section of data.sections.slice(2)) {
    synthesis.drawText(section.eyebrow.toUpperCase(), { x: MARGIN, y, size: 7.5, font: sansBold, color: gold });
    y = drawWrapped(synthesis, section.title, serifBold, 17, MARGIN, y - 23, PAGE_WIDTH - MARGIN * 2, 21, aubergine);
    y = drawWrapped(synthesis, section.body, serif, 10.5, MARGIN, y - 2, PAGE_WIDTH - MARGIN * 2, 15, ink) - 17;
    if (y < 95) break;
  }

  const finalPage = addPage();
  y = drawHeader(finalPage, "Plate VI / What remains hidden", "The full chart begins where this preview stops", serifBold, sansBold);
  y = drawWrapped(finalPage, "This document has interpreted the visible doorway: Sun, Moon, Ascendant, lunar phase, chart ruler, sect, and the first relationship among them. A complete judgment still needs the houses occupied by the planets, every house ruler, essential and accidental condition, angularity, major aspects, reception, repeated testimony, and current timing.", serif, 13.2, MARGIN, y, PAGE_WIDTH - MARGIN * 2, 20, ink);
  y -= 24;
  const hidden = [
    "Where the Sun and Moon operate by house",
    `The natal sign, house, and condition of ${data.result.chartRuler}`,
    "Major aspects and the tensions that repeat",
    "Love, vocation, money, and emotional patterns",
    "Which testimonies are central and which are secondary",
  ];
  hidden.forEach((item, index) => {
    finalPage.drawText(String(index + 1).padStart(2, "0"), { x: MARGIN, y, size: 9, font: sansBold, color: gold });
    y = drawWrapped(finalPage, item, serifBold, 14, MARGIN + 34, y, PAGE_WIDTH - MARGIN * 2 - 34, 18, aubergine) - 13;
  });
  finalPage.drawRectangle({ x: MARGIN, y: 102, width: PAGE_WIDTH - MARGIN * 2, height: 116, color: rgb(0.21, 0.12, 0.1), borderColor: gold, borderWidth: 0.8 });
  finalPage.drawText("CONTINUE THE READING", { x: MARGIN + 24, y: 190, size: 8, font: sansBold, color: parchmentDark });
  finalPage.drawText("Essential Birth Chart Reading / $17", { x: MARGIN + 24, y: 158, size: 19, font: serifBold, color: parchment });
  drawWrapped(finalPage, "Automated first synthesis, generated from your birth data and delivered instantly by email. No subscription.", sans, 9.5, MARGIN + 24, 137, 430, 13, parchmentDark);
  finalPage.drawText("mysticbirthchart.com/birth-chart-report", { x: MARGIN + 24, y: 81, size: 9, font: sansBold, color: gold });

  return doc.save();
}
