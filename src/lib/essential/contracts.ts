export type EssentialJobMode = "live" | "test";

export type ReadingJobTier =
  | "basic"
  | "love"
  | "career"
  | "year-ahead"
  | "synastry"
  | "complete"
  | "kabbalah"
  | "dossier"
  | "almanac";

export interface BirthDetails {
  date: string;
  time: string;
  city: string;
}

export interface EssentialJob {
  orderId: string;
  mode: EssentialJobMode;
  /** Defaults to basic for backwards-compatible Essential test requests. */
  tier?: ReadingJobTier;
  customer: {
    name: string;
    email: string;
  };
  birth: BirthDetails;
  focus: string;
  notes?: string;
  partnerData?: string;
  annual?: {
    cycleYear?: number;
    returnCity?: string;
  };
  subscriptionId?: string;
}

export type FulfillmentJob = Required<Pick<EssentialJob, "orderId" | "mode" | "customer" | "birth" | "focus">> &
  Omit<EssentialJob, "orderId" | "mode" | "customer" | "birth" | "focus"> & {
    tier: ReadingJobTier;
  };

export interface ChartFacts {
  sun: string;
  moon: string;
  rising: string;
  chartRuler: string;
  sect: "Day chart" | "Night chart";
  moonPhase: string;
  focus: string;
  calculationLimit: string;
}

export interface EssentialSection {
  eyebrow: string;
  title: string;
  body: string;
}

export interface EssentialDraft {
  title: string;
  opening: string;
  sections: EssentialSection[];
  focusSection: EssentialSection;
  closing: string;
  scopeNote: string;
}

export type EssentialReport = EssentialDraft;

export interface EssentialWriterInput {
  facts: ChartFacts;
}

export interface EssentialReviewInput {
  facts: ChartFacts;
  draft: EssentialDraft;
}

export interface EssentialReadingProvider {
  write(input: EssentialWriterInput): Promise<EssentialDraft>;
  review(input: EssentialReviewInput): Promise<EssentialReport>;
}
