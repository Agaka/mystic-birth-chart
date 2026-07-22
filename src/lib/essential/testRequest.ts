import { randomUUID, timingSafeEqual } from "node:crypto";
import type { EssentialJob } from "./contracts";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

export function hasValidTestSecret(supplied: string | null, expected: string | undefined): boolean {
  if (!supplied || !expected) return false;
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export function buildEssentialTestJob(body: unknown): EssentialJob | null {
  const input = (body || {}) as Record<string, unknown>;
  const name = clean(input.name, 120);
  const email = clean(input.email, 254).toLowerCase();
  const date = clean(input.birthDate, 20);
  const time = clean(input.birthTime, 20);
  const city = clean(input.birthCity, 180);
  const focus = clean(input.focus || "general", 60);

  if (!name || !emailPattern.test(email) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || !city) {
    return null;
  }

  return {
    orderId: `test_${randomUUID()}`,
    mode: "test",
    customer: { name, email },
    birth: { date, time, city },
    focus,
  };
}
