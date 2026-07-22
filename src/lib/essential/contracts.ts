export type EssentialJobMode = "live" | "test";

export interface EssentialJob {
  orderId: string;
  mode: EssentialJobMode;
  customer: {
    name: string;
    email: string;
  };
  birth: {
    date: string;
    time: string;
    city: string;
  };
  focus: string;
}

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
