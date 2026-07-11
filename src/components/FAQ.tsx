"use client";

import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="overflow-hidden border border-ivory/10 transition-colors hover:border-gold/20"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer group"
            aria-expanded={openIndex === index}
          >
            <span className="font-heading text-lg font-medium text-ivory group-hover:text-gold transition-colors pr-4">
              {item.question}
            </span>
            <span
              className={`shrink-0 text-gold/50 transition-transform duration-300 ${
                openIndex === index ? "rotate-45" : ""
              }`}
              aria-hidden="true"
            >
              <IconPlus className="h-5 w-5" stroke={1.6} />
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 pb-6 text-[0.95rem] leading-relaxed text-ivory/65">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
