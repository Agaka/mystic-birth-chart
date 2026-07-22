import nodemailer from "nodemailer";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendEssentialDelivery(input: { to: string; name: string; url: string; pdf: Uint8Array }) {
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
    subject: "Your Essential Birth Chart Reading is ready",
    text: `Hi ${input.name || "there"},\n\nYour automated Essential Birth Chart Reading is ready. Download your PDF: ${input.url}\n\nThis is an automated first synthesis, not a hand-prepared Complete Reading.`,
    html: `<!doctype html><html><body style="margin:0;background:#e8decc;padding:24px 12px;color:#301b17;font-family:Georgia,serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center"><table role="presentation" width="620" style="max-width:620px;width:100%;background:#f7efdf;border:1px solid #b88a3a"><tr><td style="padding:28px 32px;text-align:center;background:#140f0b"><img src="https://mysticbirthchart.com/brand/mystic-astrolabe-seal-transparent.png" width="68" height="68" alt="Mystic Birth Chart" style="display:block;margin:0 auto 12px" /><div style="font:700 12px Arial,sans-serif;letter-spacing:2px;color:#d9ae56">MYSTIC BIRTH CHART</div><div style="margin-top:8px;font:11px Arial,sans-serif;letter-spacing:1.6px;color:#f4ead7">THE OLD STUDY METHOD</div></td></tr><tr><td style="padding:40px 42px"><p style="margin:0 0 12px;font:700 11px Arial,sans-serif;letter-spacing:1.8px;color:#9b742e">AUTOMATED FIRST SYNTHESIS</p><h1 style="margin:0 0 22px;font-size:34px;line-height:1.15;color:#301b17">Your Essential Reading is ready.</h1><p style="margin:0 0 18px;font-size:17px;line-height:1.65">Hi ${greeting},</p><p style="margin:0 0 26px;font-size:16px;line-height:1.7">Your Essential Birth Chart Reading has been generated automatically from the birth data you submitted. It is an instant first synthesis, not a hand-prepared Complete Reading.</p><p style="margin:0 0 28px"><a href="${input.url}" style="display:inline-block;background:#b88a3a;color:#140f0b;padding:14px 22px;text-decoration:none;font:700 14px Arial,sans-serif">Download your reading</a></p><p style="margin:0;border-top:1px solid #d9c9ae;padding-top:22px;font-size:13px;line-height:1.65;color:#624d42">A PDF copy is attached for convenience. Your private download link remains available for 30 days.</p></td></tr><tr><td style="padding:22px 32px;text-align:center;background:#301b17;color:#f4ead7;font-size:12px;line-height:1.6">Mystic Birth Chart<br /><a href="https://mysticbirthchart.com" style="color:#d9ae56;text-decoration:none">mysticbirthchart.com</a></td></tr></table></td></tr></table></body></html>`,
    attachments: input.pdf.length <= 7 * 1024 * 1024
      ? [{ filename: "mystic-essential-birth-chart-reading.pdf", content: Buffer.from(input.pdf), contentType: "application/pdf" }]
      : [],
  });
}
