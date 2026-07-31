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

const samples = [
  {
    fileName: "essential-birth-chart-reading-preview.pdf",
    eyebrow: "Automated First Synthesis",
    title: "Essential Birth Chart Reading",
    subtitle: "A five-page editorial preview",
    opening: "A concise study of the three testimonies that organize a chart before isolated placements are allowed to dominate the interpretation.",
    contents: ["Calculation record", "Your chart in one sentence", "Three dominant testimonies", "Practical direction"],
    pages: [
      ["Your chart in one sentence", "This fictional chart learns to turn sensitivity into reliable discernment: it notices more than it says, then becomes strongest when it gives that perception a practical form."],
      ["The three dominant testimonies", "The Ascendant ruler, sect light, and repeated traditional testimony are ranked before the report moves into love, work, and emotional rhythm. The point is not to make the chart sound complicated. It is to identify which pattern actually carries weight."],
      ["A practical first direction", "The Essential reading translates the first architecture of the chart into clear language. It offers recognition, a pressure point worth observing, and questions for further study without pretending that a first synthesis is the entire natal map."],
    ],
    close: "The full Essential Reading is generated automatically from your submitted birth data and delivered instantly by email.",
  },
  {
    fileName: "complete-natal-reading-preview.pdf",
    eyebrow: "Individually Reviewed Depth",
    title: "Complete Natal Reading",
    subtitle: "A five-page editorial preview",
    opening: "A fuller traditional-first study that reads the chart as an ordered structure, then follows that structure into relationships, vocation, resources, and direction.",
    contents: ["Chart architecture", "Planetary authority", "Relationship patterns", "Vocation and direction"],
    pages: [
      ["Chart architecture", "The Complete Reading begins with hierarchy: the Ascendant and chart ruler, sect, angularity, dignity, relevant house rulers, and repeated testimony. A close aspect is not allowed to outrank the structure that holds it."],
      ["Relationship patterns", "The relationship chapter begins with the seventh whole-sign house and its ruler. Venus, the Moon, Mars, the fifth house, and the eighth house then show how attraction, continuity, desire, trust, and boundaries become connected parts of one pattern."],
      ["Vocation and direction", "The tenth house, Midheaven, vocational ruler, planets in the tenth, and the chart ruler are considered together before any practical conclusion is made. The outcome is a set of coherent working conditions and forms of contribution, not a single fated career."],
    ],
    close: "The Complete Reading is an individually prepared PDF. Its chapters change according to the hierarchy of the submitted chart.",
  },
  {
    fileName: "hermetic-kabbalah-reading-preview.pdf",
    eyebrow: "Chart-Led Esoteric Study",
    title: "Hermetic Kabbalah Reading",
    subtitle: "A five-page editorial preview",
    opening: "A Western Hermetic practice map that begins with natal hierarchy and uses reviewed correspondences only where the chart provides a real basis for them.",
    contents: ["Spiritual thesis", "Planetary hierarchy", "Correspondence and practice", "Seven-day rhythm"],
    pages: [
      ["The spiritual thesis", "The reading starts with the chart ruler, sect light, dominant planets, and signatures requiring attention. Hermetic language is introduced only after the natal chart has been read on its own terms."],
      ["Correspondence and practice", "Correspondences are treated as a disciplined symbolic vocabulary, not proof of a special spiritual identity. The document identifies qualities to contemplate and practical rhythms to observe without promising protection, initiation, or material results."],
      ["The seven-day rhythm", "A focused plan turns the relevant planetary symbolism into optional, safe, and repeatable practice. It uses reflective questions, devotional timing, and ordinary habits of attention rather than spectacle or coercion."],
    ],
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

function drawChapter(doc, texture, fonts, sample, pageNumber, [title, body]) {
  const page = doc.addPage([width, height]);
  addPaper(page, texture, fonts, sample.eyebrow, pageNumber);
  page.drawText(`PLATE ${String(pageNumber).padStart(2, "0")} / SAMPLE CHAPTER`, { x: margin, y: 700, size: 8, font: fonts.sansBold, color: gold });
  let y = drawWrapped(page, title, fonts.bold, 30, margin, 650, width - margin * 2, 35, aubergine);
  page.drawLine({ start: { x: margin, y: y - 12 }, end: { x: width - margin, y: y - 12 }, thickness: 0.75, color: gold, opacity: 0.75 });
  y = drawWrapped(page, body, fonts.serif, 13, margin, y - 52, width - margin * 2, 20, ink);
  page.drawRectangle({ x: margin, y: 150, width: width - margin * 2, height: 108, color: deep });
  page.drawText("WHAT THIS CHAPTER DOES", { x: margin + 20, y: 229, size: 8, font: fonts.sansBold, color: parchmentDark });
  drawWrapped(page, "It connects the technical structure of the chart to a concrete lived question, then gives the reader a useful way to observe the pattern without turning the reading into a prediction.", fonts.serif, 10.5, margin + 20, 202, width - margin * 2 - 40, 15, parchment);
  page.drawText("Preview excerpt - the full report develops the evidence in depth.", { x: margin, y: 102, size: 8, font: fonts.italic, color: muted });
}

function drawClosing(doc, texture, seal, fonts, sample) {
  const page = doc.addPage([width, height]);
  addPaper(page, texture, fonts, sample.eyebrow, 5);
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
  sample.pages.slice(0, 2).forEach((chapter, index) => drawChapter(doc, texture, fonts, sample, index + 3, chapter));
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
