export interface FreeChartSessionDraft {
  birthDate: string;
  birthTime: string;
  birthCity: string;
  focus: string;
  timeUnknown: boolean;
}

export const freeChartSessionKey = "mysticBirthChartFreeChartDraft";
export const checkoutSessionKey = "mysticBirthChartCheckoutDraft";

export function readSessionDraft<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.sessionStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

export function writeSessionDraft<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function clearChartSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(freeChartSessionKey);
  window.sessionStorage.removeItem(checkoutSessionKey);
}
