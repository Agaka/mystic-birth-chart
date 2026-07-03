"use client";

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
              className={`text-gold/50 transition-transform duration-300 flex-shrink-0 ${
                openIndex === index ? "rotate-45" : ""
              }`}
              aria-hidden="true"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <line
                  x1="10"
                  y1="4"
                  x2="10"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <line
                  x1="4"
                  y1="10"
                  x2="16"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 pb-6 text-ivory/55 leading-relaxed text-[0.95rem]">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
