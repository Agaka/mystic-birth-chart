import { randomBytes } from "node:crypto";
import Database from "better-sqlite3";

export type OrderMode = "live" | "test";
export type OrderStatus = "processing" | "generated" | "delivered" | "retry_pending" | "failed";
export type ReportTier = "basic" | "love" | "career" | "year-ahead" | "synastry" | "complete" | "kabbalah" | "dossier" | "almanac";

export interface WorkerEssentialJob {
  orderId: string;
  mode: OrderMode;
  tier?: ReportTier;
  customer: { name: string; email: string };
  birth: { date: string; time: string; city: string };
  focus: string;
  notes?: string;
  partnerData?: string;
  annual?: { cycleYear?: number; returnCity?: string };
  forecast?: { startDate?: string; presentationTimezone?: string };
  subscriptionId?: string;
}

export interface StoredEssentialOrder extends WorkerEssentialJob {
  tier: ReportTier;
  status: OrderStatus;
  reportToken: string;
  reportPath: string | null;
  attempts: number;
  expiresAt: string;
}

export interface EssentialOrderStatus {
  status: OrderStatus;
  updatedAt: string;
}

export type ClaimResult =
  | { kind: "claimed" | "resume"; order: StoredEssentialOrder }
  | { kind: "duplicate"; order: StoredEssentialOrder };

function asOrder(row: Record<string, unknown>): StoredEssentialOrder {
  return {
    orderId: String(row.order_id),
    mode: String(row.mode) as OrderMode,
    tier: (String(row.tier || "basic") as ReportTier),
    customer: { name: String(row.customer_name), email: String(row.email) },
    birth: { date: String(row.birth_date), time: String(row.birth_time), city: String(row.birth_city) },
    focus: String(row.focus),
    notes: typeof row.notes === "string" ? row.notes : "",
    partnerData: typeof row.partner_data === "string" ? row.partner_data : "",
    annual: {
      cycleYear: Number(row.annual_cycle_year) || undefined,
      returnCity: typeof row.annual_return_city === "string" ? row.annual_return_city : "",
    },
    forecast: {
      startDate: typeof row.forecast_start_date === "string" ? row.forecast_start_date : "",
      presentationTimezone: typeof row.presentation_timezone === "string" ? row.presentation_timezone : "",
    },
    subscriptionId: typeof row.subscription_id === "string" ? row.subscription_id : "",
    status: String(row.status) as OrderStatus,
    reportToken: String(row.report_token),
    reportPath: typeof row.report_path === "string" ? row.report_path : null,
    attempts: Number(row.attempts),
    expiresAt: String(row.expires_at),
  };
}

export class EssentialStore {
  private readonly db: Database.Database;

  constructor(path: string) {
    this.db = new Database(path);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS essential_orders (
        order_id TEXT PRIMARY KEY,
        mode TEXT NOT NULL,
        status TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        birth_time TEXT NOT NULL,
        birth_city TEXT NOT NULL,
        focus TEXT NOT NULL,
        report_token TEXT NOT NULL UNIQUE,
        report_path TEXT,
        attempts INTEGER NOT NULL DEFAULT 1,
        error_code TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );
    `);
    this.ensureColumn("tier", "TEXT NOT NULL DEFAULT 'basic'");
    this.ensureColumn("notes", "TEXT NOT NULL DEFAULT ''");
    this.ensureColumn("partner_data", "TEXT NOT NULL DEFAULT ''");
    this.ensureColumn("annual_cycle_year", "INTEGER");
    this.ensureColumn("annual_return_city", "TEXT NOT NULL DEFAULT ''");
    this.ensureColumn("subscription_id", "TEXT NOT NULL DEFAULT ''");
    this.ensureColumn("forecast_start_date", "TEXT NOT NULL DEFAULT ''");
    this.ensureColumn("presentation_timezone", "TEXT NOT NULL DEFAULT ''");
  }

  private ensureColumn(name: string, definition: string): void {
    const columns = this.db.prepare("PRAGMA table_info(essential_orders)").all() as Array<{ name: string }>;
    if (!columns.some((column) => column.name === name)) this.db.exec(`ALTER TABLE essential_orders ADD COLUMN ${name} ${definition}`);
  }

  close(): void {
    this.db.close();
  }

  claimOrder(job: WorkerEssentialJob): ClaimResult {
    const tier = job.tier || "basic";
    const current = this.findByOrderId(job.orderId);
    if (current?.status === "delivered") return { kind: "duplicate", order: current };
    if (current?.status === "processing" || current?.status === "generated") return { kind: "duplicate", order: current };

    const now = new Date().toISOString();
    if (current) {
      this.db.prepare("UPDATE essential_orders SET status = ?, attempts = attempts + 1, error_code = NULL, updated_at = ? WHERE order_id = ?")
        .run("processing", now, job.orderId);
      return { kind: "resume", order: this.findByOrderId(job.orderId)! };
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const reportToken = randomBytes(32).toString("base64url");
    this.db.prepare(`
      INSERT INTO essential_orders (
        order_id, mode, status, tier, customer_name, email, birth_date, birth_time, birth_city, focus, notes, partner_data,
        annual_cycle_year, annual_return_city, forecast_start_date, presentation_timezone, subscription_id,
        report_token, attempts, created_at, updated_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(job.orderId, job.mode, "processing", tier, job.customer.name, job.customer.email, job.birth.date, job.birth.time, job.birth.city, job.focus, job.notes || "", job.partnerData || "", job.annual?.cycleYear || null, job.annual?.returnCity || "", job.forecast?.startDate || "", job.forecast?.presentationTimezone || "", job.subscriptionId || "", reportToken, 1, now, now, expiresAt);
    return { kind: "claimed", order: this.findByOrderId(job.orderId)! };
  }

  findByOrderId(orderId: string): StoredEssentialOrder | null {
    const row = this.db.prepare("SELECT * FROM essential_orders WHERE order_id = ?").get(orderId) as Record<string, unknown> | undefined;
    return row ? asOrder(row) : null;
  }

  findByToken(token: string): StoredEssentialOrder | null {
    const row = this.db.prepare("SELECT * FROM essential_orders WHERE report_token = ? AND expires_at > ?").get(token, new Date().toISOString()) as Record<string, unknown> | undefined;
    return row ? asOrder(row) : null;
  }

  getPublicStatus(orderId: string): EssentialOrderStatus | null {
    const row = this.db.prepare("SELECT status, updated_at FROM essential_orders WHERE order_id = ?").get(orderId) as { status: OrderStatus; updated_at: string } | undefined;
    return row ? { status: row.status, updatedAt: row.updated_at } : null;
  }

  markGenerated(orderId: string, reportPath: string): void {
    this.db.prepare("UPDATE essential_orders SET status = ?, report_path = ?, updated_at = ? WHERE order_id = ?")
      .run("generated", reportPath, new Date().toISOString(), orderId);
  }

  markRetryPending(orderId: string, errorCode: string): void {
    this.updateStatus(orderId, "retry_pending", errorCode);
  }

  markDelivered(orderId: string): void {
    this.updateStatus(orderId, "delivered", null);
  }

  private updateStatus(orderId: string, status: OrderStatus, errorCode: string | null): void {
    this.db.prepare("UPDATE essential_orders SET status = ?, error_code = ?, updated_at = ? WHERE order_id = ?")
      .run(status, errorCode, new Date().toISOString(), orderId);
  }
}
