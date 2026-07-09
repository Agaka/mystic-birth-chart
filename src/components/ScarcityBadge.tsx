"use client";

import { useEffect, useState } from "react";

interface ScarcityBadgeProps {
  maxSlots?: number;
  className?: string;
  variant?: "dark" | "light";
}

function getSlotsRemaining(max: number): number {
  const now = new Date();
  const hourFraction = (now.getUTCHours() * 60 + now.getUTCMinutes()) / (24 * 60);
  // Distribute slots across the day: starts at max, gradually decreases
  // Uses a stepped approach so it feels natural
  const consumed = Math.floor(hourFraction * max * 0.85);
  return Math.max(1, max - consumed);
}

export function ScarcityBadge({
  maxSlots = 5,
  className = "",
  variant = "dark",
}: ScarcityBadgeProps) {
  const [slots, setSlots] = useState(maxSlots);

  useEffect(() => {
    setSlots(getSlotsRemaining(maxSlots));

    // Update every 10 minutes
    const interval = window.setInterval(() => {
      setSlots(getSlotsRemaining(maxSlots));
    }, 600000);

    return () => window.clearInterval(interval);
  }, [maxSlots]);

  const isLow = slots <= 2;

  const colorStyles = {
    dark: {
      border: isLow ? "border-rose/50" : "border-gold/35",
      bg: isLow ? "bg-rose/15" : "bg-gold/12",
      dot: isLow ? "bg-rose" : "bg-gold",
      text: isLow ? "text-rose" : "text-gold-light",
      subtext: "text-ivory/50",
    },
    light: {
      border: isLow ? "border-rose/40" : "border-gold/30",
      bg: isLow ? "bg-rose/10" : "bg-gold/10",
      dot: isLow ? "bg-rose" : "bg-gold-dark",
      text: isLow ? "text-rose" : "text-gold-dark",
      subtext: "text-ink/50",
    },
  };

  const c = colorStyles[variant];

  return (
    <div
      className={`inline-flex items-center gap-2.5 border ${c.border} ${c.bg} px-3.5 py-2 ${className}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${c.dot} opacity-50`}
        />
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${c.dot}`}
        />
      </span>
      <span className={`font-ui text-xs font-semibold tracking-wide ${c.text}`}>
        {slots} of {maxSlots} Complete readings available today
      </span>
    </div>
  );
}
