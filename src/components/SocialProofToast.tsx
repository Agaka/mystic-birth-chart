"use client";

import { useEffect, useState, useCallback } from "react";
import { trackEvent } from "@/lib/analytics";

const cities = [
  "New York", "Los Angeles", "London", "Toronto", "Sydney",
  "Austin", "Chicago", "San Francisco", "Seattle", "Dublin",
  "Melbourne", "Vancouver", "Portland", "Denver", "Miami",
  "Edinburgh", "Nashville", "Boston", "Manchester", "Brisbane",
  "Paris", "Berlin", "Madrid", "Barcelona", "Rome",
  "Milan", "Lisbon", "Amsterdam", "Copenhagen", "Stockholm",
  "Oslo", "Helsinki", "Vienna", "Prague", "Budapest",
  "Warsaw", "Brussels", "Zurich", "Geneva", "Munich",
  "Hamburg", "Frankfurt", "Athens", "Istanbul", "Dubai",
  "Abu Dhabi", "Doha", "Singapore", "Tokyo", "Kyoto",
  "Osaka", "Seoul", "Bangkok", "Hong Kong", "Taipei",
  "Beijing", "Shanghai", "Mumbai", "Delhi", "Bangalore",
  "São Paulo", "Rio de Janeiro", "Buenos Aires", "Santiago", "Lima",
  "Bogotá", "Mexico City", "Monterrey", "Guadalajara", "Panama City",
  "Cape Town", "Johannesburg", "Cairo", "Casablanca", "Nairobi",
  "Auckland", "Wellington", "Perth", "Adelaide", "Canberra",
  "Montreal", "Ottawa", "Calgary", "Quebec City", "Philadelphia",
  "Washington", "Atlanta", "Dallas", "Houston", "Phoenix",
  "San Diego", "Las Vegas", "Orlando", "New Orleans", "Detroit",
  "Minneapolis", "Salt Lake City", "Charlotte", "Raleigh", "Pittsburgh",
];

const names = [
  "Sarah", "Emma", "James", "Olivia", "Lucas",
  "Sophia", "Mia", "Liam", "Noah", "Isabella",
  "Charlotte", "Amelia", "Ethan", "Ava", "Grace",
  "Maya", "Leo", "Zoe", "Aria", "Luna",
  "Emily", "Daniel", "Benjamin", "Chloe", "Henry",
  "Victoria", "Alexander", "Ella", "Jack", "Sophie",
  "William", "Ruby", "Thomas", "Lily", "Samuel",
  "Layla", "David", "Hannah", "Matthew", "Nora",
  "Joseph", "Lucy", "Sebastian", "Alice", "Gabriel",
  "Eva", "Julian", "Clara", "Nathan", "Stella",
  "Michael", "Ivy", "Adam", "Elena", "Oscar",
  "Naomi", "Andrew", "Julia", "Isaac", "Aurora",
  "Ryan", "Hazel", "Caleb", "Violet", "Dylan",
  "Freya", "Logan", "Rose", "Aaron", "Iris",
  "Connor", "Jade", "Adrian", "Elise", "Felix",
  "Camila", "Simon", "Leah", "Marcus", "Fiona",
  "Arthur", "Celine", "Theo", "Diana", "Max",
  "Bianca", "Eric", "Laura", "Nicolas", "Sienna",
  "Jonathan", "Maeve", "Patrick", "Phoebe", "Robert",
  "Skye", "George", "Tessa", "Vincent", "Willow",
];

const actions = [
  { text: "ordered an Essential Reading", icon: "📖" },
  { text: "received their Complete Reading", icon: "📜" },
  { text: "started a free chart preview", icon: "✨" },
  { text: "ordered a Complete Reading", icon: "📖" },
  { text: "ordered an Essential Reading", icon: "📖" },
  { text: "ordered a Love & Relationship Pattern study", icon: "🤍" },
  { text: "ordered a Career & Vocation reading", icon: "🧭" },
  { text: "received their 12-Month Transit Forecast", icon: "⏳" },
  { text: "ordered a Synastry & Compatibility reading", icon: "⚖️" },
  { text: "secured a Full Chart Dossier", icon: "🗝️" },
];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomMinutes(): string {
  const min = Math.floor(Math.random() * 45) + 2;
  return `${min} min ago`;
}

function generateToast() {
  return {
    name: randomItem(names),
    city: randomItem(cities),
    action: randomItem(actions),
    time: randomMinutes(),
    id: Date.now(),
  };
}

export function SocialProofToast() {
  const [toast, setToast] = useState<ReturnType<typeof generateToast> | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const showToast = useCallback(() => {
    if (dismissed) return;

    const newToast = generateToast();
    setToast(newToast);
    setVisible(true);

    trackEvent("social_proof_toast_shown", {
      action_type: newToast.action.text,
    });

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 4500);

    return () => window.clearTimeout(hideTimer);
  }, [dismissed]);

  useEffect(() => {
    // First toast after 12-18 seconds
    const initialDelay = 12000 + Math.random() * 6000;
    const initialTimer = window.setTimeout(() => {
      showToast();
    }, initialDelay);

    return () => window.clearTimeout(initialTimer);
  }, [showToast]);

  useEffect(() => {
    if (!visible && toast && !dismissed) {
      // Next toast after 25-45 seconds
      const nextDelay = 25000 + Math.random() * 20000;
      const nextTimer = window.setTimeout(() => {
        showToast();
      }, nextDelay);

      return () => window.clearTimeout(nextTimer);
    }
  }, [visible, toast, dismissed, showToast]);

  if (!toast || dismissed) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 max-w-[320px] transition-all duration-500 ease-out md:bottom-6 md:left-6 ${visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      role="status"
      aria-live="polite"
    >
      <div className="relative overflow-hidden border border-gold/30 bg-ink/95 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center text-ivory/40 transition-colors hover:text-ivory"
          aria-label="Dismiss notification"
        >
          ×
        </button>

        <div className="flex items-start gap-3 pr-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/12 text-lg">
            {toast.action.icon}
          </span>
          <div>
            <p className="text-sm leading-snug text-ivory/90">
              <span className="font-semibold text-ivory">{toast.name}</span>{" "}
              from {toast.city}{" "}
              <span className="text-ivory/70">{toast.action.text}</span>
            </p>
            <p className="mt-1 font-ui text-[0.65rem] uppercase tracking-[0.14em] text-gold/60">
              {toast.time}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-[2px] w-full">
          <div
            className={`h-full bg-gold/50 ${visible ? "animate-toast-progress" : ""}`}
          />
        </div>
      </div>
    </div>
  );
}
