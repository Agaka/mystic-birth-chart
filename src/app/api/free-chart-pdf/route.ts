import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { buildExpandedFreeReading, normalizeFreeChartFocus } from "@/lib/freeChartReading";
import { createFreeChartPdf } from "@/lib/freeChartPdf";
import { calculateNatalSnapshot } from "@/lib/natalSnapshot";
import { siteConfig } from "@/lib/site";
import { subscribeToReadingRoom } from "@/lib/brevo";

export const runtime = "nodejs";

const RATE_WINDOW_MS = 15 * 60 * 1000;
const requestBuckets = new Map<string, number[]>();

function withinRateLimit(request: Request, mode: "email" | "download"): boolean {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = `${forwarded || "unknown"}:${mode}`;
  const now = Date.now();
  const recent = (requestBuckets.get(key) || []).filter((time) => now - time < RATE_WINDOW_MS);
  const limit = mode === "email" ? 3 : 10;
  if (recent.length >= limit) return false;
  recent.push(now);
  requestBuckets.set(key, recent);
  return true;
}

function clean(value: unknown, max = 180): string {
  return String(value ?? "").trim().slice(0, max);
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = clean(body.name, 120) || "Chart Holder";
    const email = clean(body.email, 254).toLowerCase();
    const mode = clean(body.mode, 20) === "email" ? "email" : "download";
    const date = clean(body.date, 20);
    const time = clean(body.time, 20) || "12:00";
    const birthCity = clean(body.birthCity, 180);
    const timezone = clean(body.timezone, 80);
    const focus = normalizeFreeChartFocus(clean(body.focus, 40));
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const newsletter = body.newsletter === true;

    if (!withinRateLimit(request, mode)) {
      return NextResponse.json(
        { message: "Too many requests. Please wait a few minutes before trying again." },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) ||
      !birthCity ||
      !timezone ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180 ||
      (mode === "email" && !validEmail(email))
    ) {
      return NextResponse.json({ message: "Enter complete chart details before creating the PDF." }, { status: 400 });
    }

    const result = calculateNatalSnapshot({ date, time, latitude, longitude, timezone });
    const sections = buildExpandedFreeReading(result, focus);
    const pdfBytes = await createFreeChartPdf({
      name,
      birthDate: date,
      birthTime: body.timeUnknown ? "Unknown - noon estimate used" : time,
      birthCity,
      result,
      sections,
    });

    if (mode === "download") {
      return new Response(Buffer.from(pdfBytes), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="mystic-birth-chart-preview.pdf"',
          "Cache-Control": "private, no-store",
        },
      });
    }

    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || siteConfig.supportEmail;
    if (!process.env.SMTP_PASSWORD) {
      return NextResponse.json({ message: "Email delivery is temporarily unavailable. Use the download option." }, { status: 503 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: { user: supportEmail, pass: process.env.SMTP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"${siteConfig.name}" <${supportEmail}>`,
      to: email,
      subject: "Your free Mystic Birth Chart preview",
      text: `Hi ${name},\n\nYour free birth chart PDF is attached. It includes your Sun, Moon, Rising sign, chart ruler, sect, natal Moon phase, and first synthesis.\n\nContinue at ${siteConfig.url}/birth-chart-report\n\n${siteConfig.disclaimer}`,
      html: `<div style="background:#f4ead7;padding:32px;color:#301b17;font-family:Georgia,serif"><p style="font:700 12px Arial;letter-spacing:2px;color:#9b712e">MYSTIC BIRTH CHART</p><h1 style="font-size:32px">Your free chart preview is attached.</h1><p style="font-size:17px;line-height:1.7">Hi ${name.replace(/[<>&"]/g, "")}, your PDF includes the visible architecture of your chart: Sun, Moon, Rising sign, chart ruler, sect, lunar phase, and a first synthesis.</p><p style="font-size:16px;line-height:1.7">It is useful by itself and intentionally stops before the deeper houses, aspects, planetary condition, and prioritized whole-chart judgment.</p><p><a href="${siteConfig.url}/birth-chart-report" style="display:inline-block;background:#b88a3a;color:#140f0b;padding:13px 18px;text-decoration:none;font:700 13px Arial">Compare the readings</a></p><p style="font:12px Arial;color:#7b6c5e">${siteConfig.disclaimer}</p></div>`,
      attachments: [{ filename: "mystic-birth-chart-preview.pdf", content: Buffer.from(pdfBytes), contentType: "application/pdf" }],
    });

    if (newsletter) {
      try {
        await subscribeToReadingRoom(email, name);
      } catch (error) {
        console.error("Brevo contact capture failed", { type: error instanceof Error ? error.name : "unknown" });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Free chart PDF error", { type: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ message: "The PDF could not be created. Please try again." }, { status: 500 });
  }
}
