import { createHmac } from "node:crypto";
import nodemailer from "nodemailer";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendReportDelivery(input: { to: string; name: string; url: string; pdf: Uint8Array; title: string; eyebrow: string; fileName: string; essential?: boolean }) {
  const proxyBase = process.env.EMAIL_PROXY_URL;
  const sharedSecret = process.env.ESSENTIAL_WORKER_SHARED_SECRET;
  if (proxyBase && sharedSecret) {
    const endpoint = new URL("/api/internal/essential-email", proxyBase);
    const body = JSON.stringify({ to: input.to, name: input.name, url: input.url, pdfBase64: Buffer.from(input.pdf).toString("base64"), title: input.title, eyebrow: input.eyebrow, fileName: input.fileName, essential: Boolean(input.essential) });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = createHmac("sha256", sharedSecret).update(`POST\n${endpoint.pathname}\n${timestamp}\n${body}`).digest("hex");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mystic-timestamp": timestamp, "x-mystic-signature": signature },
      body,
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`email-proxy-http-${response.status}`);
    return;
  }

  const from = process.env.SMTP_FROM || "hello@mysticbirthchart.com";
  if (!process.env.SMTP_PASSWORD) throw new Error("smtp-not-configured");

  const greeting = escapeHtml(input.name.trim() || "there");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: { user: from, pass: process.env.SMTP_PASSWORD },
  });

  await transporter.sendMail({
    from: `"Mystic Birth Chart" <${from}>`,
    to: input.to,
    subject: `Your ${input.title} is ready`,
    text: `Hi ${input.name || "there"},\n\nYour ${input.title} is ready. Download your PDF: ${input.url}`,
    html: `<!doctype html><html><body style="margin:0;background:#e8decc;padding:24px 12px;color:#301b17;font-family:Georgia,serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;width:100%;background:#f7efdf;border:1px solid #b88a3a"><tr><td style="padding:28px 32px;text-align:center;background:#140f0b"><img src="https://mysticbirthchart.com/brand/mystic-astrolabe-seal-transparent.png" width="68" height="68" alt="Mystic Birth Chart" style="display:block;margin:0 auto 12px" /><div style="font:700 12px Arial,sans-serif;letter-spacing:2px;color:#d9ae56">MYSTIC BIRTH CHART</div><div style="margin-top:8px;font:11px Arial,sans-serif;letter-spacing:1.6px;color:#f4ead7">THE OLD STUDY METHOD</div></td></tr><tr><td style="padding:40px 42px"><p style="margin:0 0 12px;font:700 11px Arial,sans-serif;letter-spacing:1.8px;color:#9b742e">${input.eyebrow.toUpperCase()}</p><h1 style="margin:0 0 22px;font-size:34px;line-height:1.15;color:#301b17">Your ${input.title} is ready.</h1><p style="margin:0 0 18px;font-size:17px;line-height:1.65">Hi ${greeting},</p><p style="margin:0 0 26px;font-size:16px;line-height:1.7">Your personalized reading has been prepared from the details you submitted.</p><p style="margin:0 0 28px"><a href="${input.url}" style="display:inline-block;background:#b88a3a;color:#140f0b;padding:14px 22px;text-decoration:none;font:700 14px Arial,sans-serif">Download your reading</a></p><p style="margin:0;border-top:1px solid #d9c9ae;padding-top:22px;font-size:13px;line-height:1.65;color:#624d42">A PDF copy is attached for convenience. Your private download link remains available for 30 days.</p></td></tr><tr><td style="padding:22px 32px;text-align:center;background:#301b17;color:#f4ead7;font-size:12px;line-height:1.6">Mystic Birth Chart<br /><a href="https://mysticbirthchart.com" style="color:#d9ae56;text-decoration:none">mysticbirthchart.com</a></td></tr></table></td></tr></table></body></html>`,
    attachments: input.pdf.length <= 7 * 1024 * 1024
      ? [{ filename: input.fileName, content: Buffer.from(input.pdf), contentType: "application/pdf" }]
      : [],
  });
}

export async function sendEssentialDelivery(input: { to: string; name: string; url: string; pdf: Uint8Array }) {
  return sendReportDelivery({ ...input, title: "Essential Birth Chart Reading", eyebrow: "Automated First Synthesis", fileName: "mystic-essential-birth-chart-reading.pdf", essential: true });
}
