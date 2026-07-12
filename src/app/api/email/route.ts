import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import {
  calculateNatalSnapshot,
  type NatalSnapshotResult,
} from "@/lib/natalSnapshot";
import { siteConfig } from "@/lib/site";
import {
  getReadingOffer,
  isReadingTier,
  type ReadingTier,
} from "@/lib/orders";
import { subscribeToReadingRoom } from "@/lib/brevo";

interface BirthplaceMatch {
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    name?: string;
    admin1?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }>;
}

interface AutomatedReading {
  result: NatalSnapshotResult;
  birthplace: BirthplaceMatch;
  timeUnknown: boolean;
}

const focusLabels: Record<string, string> = {
  general: "General overview",
  purpose: "Purpose and direction",
  love: "Love and relationships",
  career: "Career and vocation",
  money: "Money and self-worth",
  emotions: "Emotional patterns",
  spiritual: "Spiritual direction",
};

const focusReflections: Record<string, string> = {
  purpose:
    "Read this first through repetition. Purpose in a chart is rarely one placement; it is the way the chart keeps returning to the same planet, house, ruler, or pressure until it becomes direction.",
  love:
    "Love becomes clearer when Venus, the Moon, the 7th house, and the chart ruler are read together. This automated reading opens the pattern; the deeper question is which relationship testimonies repeat.",
  career:
    "Career is not only the 10th house. It can involve the Midheaven, the chart ruler, Saturn, Mars, the 2nd house, and the planet that keeps demanding public form.",
  money:
    "Money and self-worth usually speak through Venus, the 2nd house, its ruler, and the habits that decide what you keep, spend, protect, or undervalue.",
  emotions:
    "Emotional patterns begin with the Moon, but they become personal through house, sect, aspects, and the way the chart asks you to regulate pressure, memory, and need.",
  spiritual:
    "Spiritual direction is strongest when it grows from the natal chart itself: chart ruler, 9th house, Moon, sect, planetary condition, and the symbols that are actually central for you.",
  general:
    "For a whole-chart question, begin with hierarchy: Sun, Moon, Rising, chart ruler, sect, and the themes that repeat. The chart becomes useful when the loudest symbols are separated from the background noise.",
};

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function cleanSubject(value: unknown): string {
  return cleanText(value).replace(/[\r\n]+/g, " ").slice(0, 120);
}

function escapeHtml(value: unknown): string {
  return cleanText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getFocusLabel(focus: string): string {
  return focusLabels[focus] || focusLabels.general;
}

function getFocusReflection(focus: string): string {
  return focusReflections[focus] || focusReflections.general;
}

function detailRows(details: Array<[string, string | undefined]>): string {
  return details
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 7px 0; color: #8a7a6a;">${escapeHtml(label)}</td>
          <td style="padding: 7px 0; text-align: right;">${escapeHtml(value)}</td>
        </tr>
      `
    )
    .join("");
}

function emailShell(title: string, body: string): string {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 620px; margin: 0 auto; color: #1a1118; background: #faf7f2;">
      <div style="background: #140f0b; padding: 32px 24px; text-align: center; border-bottom: 1px solid #b88a3a;">
        <p style="font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #b88a3a; margin: 0 0 10px;">
          ${siteConfig.name}
        </p>
        <h1 style="color: #f5f0e8; font-size: 28px; line-height: 1.2; margin: 0; font-weight: 500;">
          ${escapeHtml(title)}
        </h1>
      </div>

      <div style="padding: 32px 24px;">
        ${body}
      </div>

      <div style="background: #140f0b; padding: 20px 24px; text-align: center;">
        <p style="font-size: 12px; color: #f5f0e8; opacity: 0.65; line-height: 1.6; margin: 0;">
          ${escapeHtml(siteConfig.disclaimer)}
        </p>
      </div>
    </div>
  `;
}

async function findBirthplace(query: string): Promise<BirthplaceMatch | null> {
  const params = new URLSearchParams({
    name: query,
    count: "1",
    language: "en",
    format: "json",
  });

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as OpenMeteoGeocodingResponse;
  const place = data.results?.find(
    (item) =>
      typeof item.latitude === "number" &&
      typeof item.longitude === "number" &&
      Boolean(item.timezone)
  );

  if (!place || typeof place.latitude !== "number" || typeof place.longitude !== "number" || !place.timezone) {
    return null;
  }

  return {
    label: [place.name, place.admin1, place.country].filter(Boolean).join(", "),
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  };
}

async function createAutomatedReading({
  birthDate,
  birthTime,
  birthCity,
}: {
  birthDate: string;
  birthTime: string;
  birthCity: string;
}): Promise<AutomatedReading | null> {
  if (!birthDate || !birthTime || !birthCity) {
    return null;
  }

  const timeUnknown = birthTime === "unknown";
  const calculationTime = timeUnknown ? "12:00" : birthTime;

  const birthplace = await findBirthplace(birthCity);
  if (!birthplace) {
    return null;
  }

  return {
    birthplace,
    timeUnknown,
    result: calculateNatalSnapshot({
      date: birthDate,
      time: calculationTime,
      latitude: birthplace.latitude,
      longitude: birthplace.longitude,
      timezone: birthplace.timezone,
    }),
  };
}

function automatedReadingEmail({
  name,
  email,
  birthDate,
  birthTime,
  focus,
  automated,
}: {
  name: string;
  email: string;
  birthDate: string;
  birthTime: string;
  focus: string;
  automated: AutomatedReading;
}): string {
  const result = automated.result;
  const focusLabel = getFocusLabel(focus);
  const readingSections = [
    ...result.placements,
    result.rulerInterpretation,
    result.sectInterpretation,
  ]
    .map(
      (section) => `
        <div style="border-top: 1px solid #e0d2bd; padding-top: 18px; margin-top: 18px;">
          <h3 style="font-size: 22px; line-height: 1.25; color: #301b17; margin: 0 0 10px;">
            ${escapeHtml(section.title)}
          </h3>
          <p style="font-size: 15px; line-height: 1.75; color: #3a2a30; margin: 0;">
            ${escapeHtml(section.body)}
          </p>
        </div>
      `
    )
    .join("");

  return emailShell(
    "Your Essential Reading is ready",
    `
      <p style="font-size: 16px; line-height: 1.75; color: #3a2a30; margin: 0 0 18px;">
        Hi ${escapeHtml(name || "there")},
      </p>

      <p style="font-size: 16px; line-height: 1.75; color: #3a2a30; margin: 0 0 18px;">
        Your <strong>Essential Birth Chart Reading</strong> has been generated automatically from your birth data and is delivered below. This is the instant $17 reading, not a hand-prepared report.
      </p>

      <div style="background: #fff; border: 1px solid #e8e0d4; padding: 20px; margin: 24px 0;">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a6a; margin: 0 0 12px;">
          Birth data used
        </p>
        <table style="width: 100%; font-size: 14px; color: #3a2a30; border-collapse: collapse;">
          ${detailRows([
            ["Name", name],
            ["Email", email],
            ["Birth Date", birthDate],
            ["Birth Time", automated.timeUnknown ? "Unknown - noon estimate used" : birthTime],
            ["Birth City", automated.birthplace.label],
            ["Focus", focusLabel],
          ])}
        </table>
      </div>

      ${
        automated.timeUnknown
          ? `<div style="background: #fff4df; border: 1px solid #d7bf91; padding: 16px; margin: 20px 0; color: #5b4524; font-size: 14px; line-height: 1.65;">
              Your exact birth time was marked as unknown, so this automated reading uses noon as a neutral estimate. The Sun and most Moon interpretation remain useful, but the Rising sign, houses, chart ruler, and day/night status are provisional.
            </div>`
          : ""
      }

      <div style="background: #f4ead7; border: 1px solid #d7bf91; padding: 22px; margin: 24px 0;">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #9b742e; margin: 0 0 10px;">
          First synthesis
        </p>
        <h2 style="font-size: 28px; line-height: 1.2; color: #301b17; margin: 0 0 12px;">
          ${escapeHtml(result.sunSign)} Sun. ${escapeHtml(result.moonSign)} Moon. ${escapeHtml(result.risingSign)} Rising.
        </h2>
        <p style="font-size: 16px; line-height: 1.75; color: #3a2a30; margin: 0;">
          ${escapeHtml(result.summary)}
        </p>
      </div>

      ${readingSections}

      <div style="border-top: 1px solid #e0d2bd; padding-top: 18px; margin-top: 18px;">
        <h3 style="font-size: 22px; line-height: 1.25; color: #301b17; margin: 0 0 10px;">
          Your selected focus: ${escapeHtml(focusLabel)}
        </h3>
        <p style="font-size: 15px; line-height: 1.75; color: #3a2a30; margin: 0;">
          ${escapeHtml(getFocusReflection(focus))}
        </p>
      </div>

      <div style="background: #140f0b; border: 1px solid #b88a3a; padding: 22px; margin: 28px 0 0;">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #b88a3a; margin: 0 0 10px;">
          What remains for a hand-prepared reading
        </p>
        <p style="font-size: 15px; line-height: 1.75; color: #f4ead7; margin: 0 0 16px;">
          This automated Essential reading gives the first hierarchy. The Complete Reading is where the chart is weighed by hand: houses, rulers, aspects, dignity, angularity, repeated testimonies, love, career, money, temperament, and practical direction.
        </p>
        <a href="${siteConfig.url}/birth-chart-report#readings" style="display: inline-block; background: #b88a3a; color: #140f0b; padding: 12px 18px; text-decoration: none; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold;">
          Compare the Complete Reading
        </a>
      </div>
    `
  );
}

function automatedFallbackEmail({
  name,
  birthCity,
}: {
  name: string;
  birthCity: string;
}): string {
  return emailShell(
    "Your Essential order needs one correction",
    `
      <p style="font-size: 16px; line-height: 1.75; color: #3a2a30; margin: 0 0 18px;">
        Hi ${escapeHtml(name || "there")},
      </p>
      <p style="font-size: 16px; line-height: 1.75; color: #3a2a30; margin: 0 0 18px;">
        Your payment was received, but the automated system could not confidently match this birth city: <strong>${escapeHtml(birthCity || "not provided")}</strong>.
      </p>
      <p style="font-size: 16px; line-height: 1.75; color: #3a2a30; margin: 0;">
        Please reply to this email with your birth city and country written clearly. Once the location is confirmed, we can send your automated Essential Reading.
      </p>
    `
  );
}

function manualConfirmationEmail({
  name,
  email,
  birthDate,
  birthTime,
  birthCity,
  focus,
  productName,
  delivery,
  format,
}: {
  name: string;
  email: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  focus: string;
  productName: string;
  delivery: string;
  format: string;
}): string {
  return emailShell(
    `Your ${productName} is confirmed`,
    `
      <p style="font-size: 16px; line-height: 1.75; color: #3a2a30; margin: 0 0 18px;">
        Hi ${escapeHtml(name || "there")},
      </p>

      <p style="font-size: 16px; line-height: 1.75; color: #3a2a30; margin: 0 0 18px;">
        Thank you for your order. Your <strong>${escapeHtml(productName)}</strong> is now in the individually prepared queue. ${escapeHtml(delivery)}.
      </p>

      <div style="background: #fff; border: 1px solid #e8e0d4; padding: 20px; margin: 24px 0;">
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #8a7a6a; margin: 0 0 12px;">
          Your details
        </p>
        <table style="width: 100%; font-size: 14px; color: #3a2a30; border-collapse: collapse;">
          ${detailRows([
            ["Name", name],
            ["Email", email],
            ["Birth Date", birthDate],
            ["Birth Time", birthTime],
            ["Birth City", birthCity],
            ["Focus", getFocusLabel(focus)],
          ])}
        </table>
      </div>

      <p style="font-size: 16px; line-height: 1.75; color: #3a2a30; margin: 0;">
        This is an individually prepared ${escapeHtml(format)}, not an automated Essential reading. If you have any questions in the meantime, simply reply to this message.
      </p>
    `
  );
}

export async function POST(request: Request) {
  let recoveryStripe: Stripe | null = null;
  let recoverySessionId = "";
  try {
    const body = await request.json();
    const tierValue = cleanText(body.tier);
    const sessionId = cleanText(body.sessionId);
    let name = cleanText(body.name).slice(0, 120);
    const email = cleanText(body.email).toLowerCase().slice(0, 254);
    let birthDate = cleanText(body.birthDate).slice(0, 20);
    let birthTime = cleanText(body.birthTime).slice(0, 20);
    let birthCity = cleanText(body.birthCity).slice(0, 180);
    let focus = cleanText(body.focus || "general").slice(0, 60);
    let notes = cleanText(body.notes).slice(0, 3000);
    let partnerData = cleanText(body.partnerData).slice(0, 3000);
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@mysticbirthchart.com";
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!isReadingTier(tierValue)) {
      return NextResponse.json({ message: "Invalid reading tier." }, { status: 400 });
    }
    const tier: ReadingTier = tierValue;
    const offer = getReadingOffer(tier);

    if (
      !sessionId ||
      !stripeSecretKey ||
      !name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !birthDate ||
      !birthCity ||
      (tier === "basic" && !birthTime)
    ) {
      return NextResponse.json(
        { message: "The paid order could not be verified with complete delivery details." },
        { status: 400 },
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    recoveryStripe = stripe;
    recoverySessionId = sessionId;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentConfirmed =
      session.status === "complete" &&
      (session.payment_status === "paid" || session.payment_status === "no_payment_required");
    const sessionEmail = cleanText(session.customer_details?.email || session.customer_email).toLowerCase();

    if (
      !paymentConfirmed ||
      session.client_reference_id !== tier ||
      !sessionEmail ||
      sessionEmail !== email
    ) {
      return NextResponse.json({ message: "Payment verification failed." }, { status: 403 });
    }

    name = cleanText(session.metadata?.customer_name || name).slice(0, 120);
    birthDate = cleanText(session.metadata?.birth_date || birthDate).slice(0, 20);
    birthTime = cleanText(session.metadata?.birth_time || birthTime).slice(0, 20);
    birthCity = cleanText(session.metadata?.birth_city || birthCity).slice(0, 180);
    focus = cleanText(session.metadata?.reading_focus || focus || "general").slice(0, 60);
    notes = cleanText(session.metadata?.customer_notes || notes).slice(0, 3000);
    partnerData = cleanText(session.metadata?.partner_data || partnerData).slice(0, 3000);

    if (session.metadata?.fulfillment_status === "sent") {
      return NextResponse.json({
        success: true,
        alreadyFulfilled: true,
        productId: tier,
        value: Number(offer.product.price.replace(/[^0-9.]/g, "")) || 0,
        currency: "USD",
      });
    }

    if (session.metadata?.fulfillment_status === "processing") {
      const startedAt = Date.parse(session.metadata.fulfillment_started_at || "");
      const stillActive = Number.isFinite(startedAt) && Date.now() - startedAt < 10 * 60 * 1000;
      if (stillActive) {
        return NextResponse.json({
          success: true,
          alreadyProcessing: true,
          productId: tier,
          value: Number(offer.product.price.replace(/[^0-9.]/g, "")) || 0,
          currency: "USD",
        });
      }
    }

    if (!process.env.SMTP_PASSWORD) {
      return NextResponse.json({ message: "Email delivery is not configured." }, { status: 503 });
    }

    await stripe.checkout.sessions.update(session.id, {
      metadata: {
        ...session.metadata,
        fulfillment_status: "processing",
        fulfillment_started_at: new Date().toISOString(),
      },
    });

    let automated: AutomatedReading | null = null;
    if (tier === "basic") {
      automated = await createAutomatedReading({ birthDate, birthTime, birthCity });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: supportEmail,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"${siteConfig.name}" <${supportEmail}>`,
      to: supportEmail,
      replyTo: email,
      subject: `New ${cleanSubject(offer.product.name)} Order - ${cleanSubject(name || "Customer")}`,
      text: [
        "New order received:",
        "",
        `Reading tier: ${tier}`,
        `Product: ${offer.product.name}`,
        `Delivery mode: ${offer.product.delivery}`,
        `Format: ${offer.product.format}`,
        `Automated reading sent: ${automated ? "yes" : tier === "basic" ? "no - location or birth data needs review" : "not applicable"}`,
        automated ? `Matched city: ${automated.birthplace.label}` : "",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Birth Date: ${birthDate}`,
        `Birth Time: ${birthTime}`,
        `Birth City: ${birthCity}`,
        `Focus: ${getFocusLabel(focus)}`,
        `Notes: ${notes || "(none)"}`,
        partnerData ? `Partner details: ${partnerData}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (email) {
      if (tier === "basic" && automated) {
        await transporter.sendMail({
          from: `"${siteConfig.name}" <${supportEmail}>`,
          to: email,
          subject: "Your automated Essential Birth Chart Reading is ready",
          html: automatedReadingEmail({
            name,
            email,
            birthDate,
            birthTime,
            focus,
            automated,
          }),
        });
      } else if (tier === "basic") {
        await transporter.sendMail({
          from: `"${siteConfig.name}" <${supportEmail}>`,
          to: email,
          subject: "Action needed for your Essential Birth Chart Reading",
          html: automatedFallbackEmail({ name, birthCity }),
        });
      } else {
        await transporter.sendMail({
          from: `"${siteConfig.name}" <${supportEmail}>`,
          to: email,
          subject: `Your ${offer.product.name} is confirmed`,
          html: manualConfirmationEmail({
            name,
            email,
            birthDate,
            birthTime,
            birthCity,
            focus,
            productName: offer.product.name,
            delivery: offer.product.delivery,
            format: offer.product.format,
          }),
        });
      }
    }

    if (session.metadata?.newsletter_opt_in === "yes") {
      try {
        await subscribeToReadingRoom(email, name);
      } catch (error) {
        console.error("Paid-order newsletter capture failed", {
          type: error instanceof Error ? error.name : "unknown",
        });
      }
    }

    await stripe.checkout.sessions.update(session.id, {
      metadata: {
        ...session.metadata,
        fulfillment_status: "sent",
        fulfilled_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      automated: Boolean(automated),
      productId: tier,
      value: Number(offer.product.price.replace(/[^0-9.]/g, "")) || 0,
      currency: "USD",
    });
  } catch (error: unknown) {
    if (recoveryStripe && recoverySessionId) {
      try {
        const failedSession = await recoveryStripe.checkout.sessions.retrieve(recoverySessionId);
        await recoveryStripe.checkout.sessions.update(recoverySessionId, {
          metadata: {
            ...failedSession.metadata,
            fulfillment_status: "failed",
            fulfillment_failed_at: new Date().toISOString(),
          },
        });
      } catch {
        // Stripe will retry the webhook; logging below remains the final fallback.
      }
    }
    console.error("Order Fulfillment Error", {
      type:
        error instanceof Stripe.errors.StripeError
          ? error.type
          : error instanceof SyntaxError
            ? "invalid-json"
            : "unknown",
    });
    return NextResponse.json(
      { message: "The order was paid, but fulfillment could not be completed automatically." },
      { status: 500 }
    );
  }
}
