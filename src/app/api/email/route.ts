import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tier, name, email, birthDate, birthTime, birthCity, focus, notes } = body;

    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@mysticbirthchart.com";

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: supportEmail,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 1. Email to YOU (business notification)
    await transporter.sendMail({
      from: `"${siteConfig.name}" <${supportEmail}>`,
      to: supportEmail,
      replyTo: email,
      subject: `New Birth Chart Reading Order – ${name}`,
      text: [
        "New order received:",
        "",
        `Reading tier: ${tier}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Birth Date: ${birthDate}`,
        `Birth Time: ${birthTime}`,
        `Birth City: ${birthCity}`,
        `Focus: ${focus}`,
        `Notes: ${notes || "(none)"}`,
      ].join("\n"),
    });

    // 2. Confirmation email to the CUSTOMER
    if (email) {
      const tierLabel = tier === "complete" ? "Complete Natal Reading" : "Basic Natal Reading";
      const deliveryTime = tier === "complete" ? "72 hours" : "48 hours";

      await transporter.sendMail({
        from: `"${siteConfig.name}" <${supportEmail}>`,
        to: email,
        subject: `Your ${tierLabel} is confirmed ✨`,
        html: `
          <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; color: #1a1118;">
            <div style="background: #2d1b33; padding: 32px 24px; text-align: center;">
              <h1 style="color: #f5f0e8; font-size: 24px; margin: 0; font-weight: 500;">
                ${siteConfig.name}
              </h1>
            </div>

            <div style="padding: 32px 24px; background: #faf7f2;">
              <p style="font-size: 16px; line-height: 1.7; color: #3a2a30;">
                Hi ${name || "there"},
              </p>

              <p style="font-size: 16px; line-height: 1.7; color: #3a2a30;">
                Thank you for your order! Your <strong>${tierLabel}</strong> is now in the queue
                and will be delivered to this email address within <strong>${deliveryTime}</strong>.
              </p>

              <div style="background: #fff; border: 1px solid #e8e0d4; padding: 20px; margin: 24px 0;">
                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a6a; margin: 0 0 12px;">
                  Your details
                </p>
                <table style="width: 100%; font-size: 14px; color: #3a2a30; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #8a7a6a;">Name</td>
                    <td style="padding: 6px 0; text-align: right;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #8a7a6a;">Birth Date</td>
                    <td style="padding: 6px 0; text-align: right;">${birthDate}</td>
                  </tr>
                  ${birthTime ? `
                  <tr>
                    <td style="padding: 6px 0; color: #8a7a6a;">Birth Time</td>
                    <td style="padding: 6px 0; text-align: right;">${birthTime}</td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="padding: 6px 0; color: #8a7a6a;">Birth City</td>
                    <td style="padding: 6px 0; text-align: right;">${birthCity}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #8a7a6a;">Focus</td>
                    <td style="padding: 6px 0; text-align: right; text-transform: capitalize;">${focus}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 16px; line-height: 1.7; color: #3a2a30;">
                We'll send your personalized reading as a PDF directly to this email.
                If you have any questions in the meantime, simply reply to this message.
              </p>

              <p style="font-size: 14px; color: #8a7a6a; margin-top: 32px;">
                With warmth,<br />
                <strong style="color: #3a2a30;">${siteConfig.name}</strong>
              </p>
            </div>

            <div style="background: #2d1b33; padding: 20px 24px; text-align: center;">
              <p style="font-size: 12px; color: #f5f0e8; opacity: 0.6; margin: 0;">
                ${siteConfig.disclaimer}
              </p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email Sending Error:", error);
    return NextResponse.json(
      { message: "Failed to send email." },
      { status: 500 }
    );
  }
}
