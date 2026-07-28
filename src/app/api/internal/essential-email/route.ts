import { createHmac, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

type EmailRequest = {
  to?: unknown;
  name?: unknown;
  url?: unknown;
  pdfBase64?: unknown;
  title?: unknown;
  eyebrow?: unknown;
  fileName?: unknown;
  essential?: unknown;
};

function clean(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function validSignature(request: Request, body: string): boolean {
  const secret = process.env.ESSENTIAL_WORKER_SHARED_SECRET || "";
  const timestamp = request.headers.get("x-mystic-timestamp") || "";
  const signature = request.headers.get("x-mystic-signature") || "";
  const timestampSeconds = Number(timestamp);
  if (!secret || !Number.isInteger(timestampSeconds) || Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > 300) return false;
  const expected = createHmac("sha256", secret).update(`POST\n/api/internal/essential-email\n${timestamp}\n${body}`).digest("hex");
  const supplied = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return supplied.length === expectedBuffer.length && timingSafeEqual(supplied, expectedBuffer);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function emailHtml(name: string, url: string, title: string, eyebrow: string, essential: boolean): string {
  const greeting = escapeHtml(name || "there");
  const safeUrl = escapeHtml(url);
  const safeTitle = escapeHtml(title);
  const safeEyebrow = escapeHtml(eyebrow).toUpperCase();
  const message = essential
    ? "Your Essential Birth Chart Reading has been generated automatically from the birth data you submitted. It is an instant first synthesis, not a hand-prepared Complete Reading."
    : "Your personalized reading has been prepared from the details you submitted.";
  return `<!doctype html><html><body style="margin:0;background:#e8decc;padding:24px 12px;color:#301b17;font-family:Georgia,serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;width:100%;background:#f7efdf;border:1px solid #b88a3a"><tr><td style="padding:28px 32px;text-align:center;background:#140f0b"><img src="https://mysticbirthchart.com/brand/mystic-astrolabe-seal-transparent.png" width="68" height="68" alt="Mystic Birth Chart" style="display:block;margin:0 auto 12px" /><div style="font:700 12px Arial,sans-serif;letter-spacing:2px;color:#d9ae56">MYSTIC BIRTH CHART</div><div style="margin-top:8px;font:11px Arial,sans-serif;letter-spacing:1.6px;color:#f4ead7">THE OLD STUDY METHOD</div></td></tr><tr><td style="padding:40px 42px"><p style="margin:0 0 12px;font:700 11px Arial,sans-serif;letter-spacing:1.8px;color:#9b742e">${safeEyebrow}</p><h1 style="margin:0 0 22px;font-size:34px;line-height:1.15;color:#301b17">Your ${safeTitle} is ready.</h1><p style="margin:0 0 18px;font-size:17px;line-height:1.65">Hi ${greeting},</p><p style="margin:0 0 26px;font-size:16px;line-height:1.7">${message}</p><p style="margin:0 0 28px"><a href="${safeUrl}" style="display:inline-block;background:#b88a3a;color:#140f0b;padding:14px 22px;text-decoration:none;font:700 14px Arial,sans-serif">Download your reading</a></p><p style="margin:0;border-top:1px solid #d9c9ae;padding-top:22px;font-size:13px;line-height:1.65;color:#624d42">A PDF copy is attached for convenience. Your private download link remains available for 30 days.</p></td></tr><tr><td style="padding:22px 32px;text-align:center;background:#301b17;color:#f4ead7;font-size:12px;line-height:1.6">Mystic Birth Chart<br /><a href="https://mysticbirthchart.com" style="color:#d9ae56;text-decoration:none">mysticbirthchart.com</a></td></tr></table></td></tr></table></body></html>`;
}

export async function POST(request: Request) {
  const body = await request.text();
  if (!validSignature(request, body)) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  try {
    const input = JSON.parse(body) as EmailRequest;
    const to = clean(input.to, 254).toLowerCase();
    const name = clean(input.name, 120);
    const url = clean(input.url, 500);
    const pdfBase64 = clean(input.pdfBase64, 10_000_000);
    const title = clean(input.title, 120) || "Essential Birth Chart Reading";
    const eyebrow = clean(input.eyebrow, 80) || "Automated First Synthesis";
    const fileName = clean(input.fileName, 120).replace(/[^a-zA-Z0-9._-]/g, "-") || "mystic-reading.pdf";
    const essential = input.essential === true;
    if (!isEmail(to) || !url || !pdfBase64 || !Buffer.from(pdfBase64, "base64").subarray(0, 4).equals(Buffer.from("%PDF"))) {
      return NextResponse.json({ message: "Invalid delivery payload." }, { status: 400 });
    }
    const smtpFrom = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@mysticbirthchart.com";
    if (!process.env.SMTP_PASSWORD) return NextResponse.json({ message: "Email delivery is not configured." }, { status: 503 });

    const transporter = nodemailer.createTransport({ host: "smtp.hostinger.com", port: 465, secure: true, auth: { user: smtpFrom, pass: process.env.SMTP_PASSWORD } });
    await transporter.sendMail({
      from: `"Mystic Birth Chart" <${smtpFrom}>`,
      to,
      subject: `Your ${title} is ready`,
      text: `Hi ${name || "there"},\n\nYour ${title} is ready. Download your PDF: ${url}`,
      html: emailHtml(name, url, title, eyebrow, essential),
      attachments: [{ filename: fileName, content: Buffer.from(pdfBase64, "base64"), contentType: "application/pdf" }],
    });
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json({ message: "Email delivery failed." }, { status: 502 });
  }
}
