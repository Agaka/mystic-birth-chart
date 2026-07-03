"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { trackEvent, type AnalyticsParams } from "@/lib/analytics";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonAnalytics {
  event: string;
  params?: AnalyticsParams;
}

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  analytics?: ButtonAnalytics;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-ink hover:bg-gold-light active:bg-gold-dark shadow-[0_8px_30px_rgba(201,164,92,0.22)] hover:shadow-[0_12px_40px_rgba(201,164,92,0.32)]",
  secondary:
    "border border-ivory/35 text-ivory hover:border-gold hover:bg-gold/10 hover:text-gold",
  ghost:
    "text-ivory/70 hover:text-ivory hover:bg-ivory/5",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2.5 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-4 text-base",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  analytics,
}: ButtonProps) {
  const baseStyles =
    "inline-flex min-h-11 items-center justify-center font-[family-name:var(--font-ui)] font-semibold tracking-wide rounded-[4px] transition-all duration-300 ease-out cursor-pointer select-none";

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
    disabled ? "opacity-50 cursor-not-allowed" : ""
  } ${className}`;

  function handleClick(
    event?: MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) {
    if (disabled) {
      event?.preventDefault();
      return;
    }

    if (analytics) {
      trackEvent(analytics.event, analytics.params);
    }

    onClick?.();
  }

  if (href) {
    return (
      <Link href={href} className={classes} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
