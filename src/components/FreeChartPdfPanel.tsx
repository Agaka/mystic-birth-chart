"use client";

import { IconDownload, IconFileTypePdf, IconMailForward } from "@tabler/icons-react";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export interface FreeChartPdfPayload {
  date: string;
  time: string;
  timeUnknown: boolean;
  birthCity: string;
  latitude: number;
  longitude: number;
  timezone: string;
  focus: string;
}

export function FreeChartPdfPanel({ payload }: { payload: FreeChartPdfPayload }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [status, setStatus] = useState<"idle" | "downloading" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function createPdf(mode: "download" | "email") {
    if (mode === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      setMessage("Enter a valid email address so we know where to send the PDF.");
      return;
    }
    setStatus(mode === "download" ? "downloading" : "sending");
    setMessage("");
    trackEvent("free_chart_pdf_started", { funnel_step: "free-chart-pdf", product_category: "lead-magnet", delivery_method: mode });

    try {
      const response = await fetch("/api/free-chart-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, mode, name, email, newsletter }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || "The PDF could not be created.");
      }
      if (mode === "download") {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "mystic-birth-chart-preview.pdf";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        setStatus("idle");
        trackEvent("free_chart_pdf_completed", { funnel_step: "free-chart-pdf", product_category: "lead-magnet", delivery_method: mode });
      } else {
        setStatus("sent");
        setMessage("Your PDF has been sent. Check the inbox and spam folder for Mystic Birth Chart.");
        trackEvent("free_chart_pdf_completed", { funnel_step: "free-chart-pdf", product_category: "lead-magnet", delivery_method: mode });
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The PDF could not be created.");
      trackEvent("free_chart_pdf_failed", { funnel_step: "free-chart-pdf", product_category: "lead-magnet", delivery_method: mode });
    }
  }

  const busy = status === "downloading" || status === "sending";

  return (
    <section className="relative overflow-hidden border border-gold/28 bg-aubergine/[0.05] p-5 md:p-7" aria-labelledby="free-pdf-title">
      <IconFileTypePdf aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 text-gold/8" stroke={1} />
      <div className="relative">
        <p className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-dark/80">Keep the reading</p>
        <h4 id="free-pdf-title" className="mt-2 font-heading text-3xl font-semibold text-aubergine">Your aged-paper chart preview, prepared as a PDF.</h4>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/66">The PDF includes the full free interpretation shown here, your lunar phase, chart ruler, sect, reflection prompts, and a clear record of what remains for a complete reading. Download it privately, or send it to your inbox.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
          <button type="button" disabled={busy} onClick={() => createPdf("download")} className="inline-flex min-h-12 items-center justify-center gap-2 border border-aubergine/25 bg-transparent px-5 py-3 font-ui text-sm font-semibold text-aubergine transition-colors hover:border-gold hover:bg-gold/10 disabled:cursor-wait disabled:opacity-55">
            <IconDownload aria-hidden="true" className="h-5 w-5" stroke={1.8} />
            {status === "downloading" ? "Preparing PDF..." : "Download without email"}
          </button>
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 font-ui text-xs font-semibold text-ink/65">Name for the cover<input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} className="min-h-12 border border-aubergine/18 bg-white/55 px-3 text-sm text-ink outline-none focus:border-gold" placeholder="Your name" /></label>
              <label className="grid gap-1.5 font-ui text-xs font-semibold text-ink/65">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} className="min-h-12 border border-aubergine/18 bg-white/55 px-3 text-sm text-ink outline-none focus:border-gold" placeholder="you@example.com" /></label>
            </div>
            <label className="flex items-start gap-3 text-xs leading-relaxed text-ink/58"><input type="checkbox" checked={newsletter} onChange={(event) => setNewsletter(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#b88a3a]" />Send me the twice-weekly astrology letter. Optional and separate from receiving the PDF. Unsubscribe anytime.</label>
            <button type="button" disabled={busy} onClick={() => createPdf("email")} className="inline-flex min-h-12 items-center justify-center gap-2 bg-gold px-5 py-3 font-ui text-sm font-semibold text-ink transition-colors hover:bg-gold-light disabled:cursor-wait disabled:opacity-55">
              <IconMailForward aria-hidden="true" className="h-5 w-5" stroke={1.8} />
              {status === "sending" ? "Sending PDF..." : "Send my PDF by email"}
            </button>
          </div>
        </div>
        {message && <p className={`mt-4 border px-4 py-3 text-sm ${status === "sent" ? "border-gold/30 bg-gold/10 text-ink/70" : "border-rose/30 bg-rose/8 text-aubergine"}`} role="status">{message}</p>}
        <p className="mt-4 text-xs leading-relaxed text-ink/44">Birth details are used to create this PDF. They are not sent to analytics. Email is used for delivery and only added to the newsletter when you select the optional box.</p>
      </div>
    </section>
  );
}
