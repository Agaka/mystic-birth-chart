"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
  once?: boolean;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [once]);

  const transforms: Record<string, string> = {
    up: "translateY(28px)",
    left: "translateX(-28px)",
    right: "translateX(28px)",
    scale: "scale(0.95)",
  };

  return (
    <div
      ref={ref}
      className={className}
      data-scroll-reveal
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : transforms[direction],
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

export function ScrollRevealGroup({
  children,
  staggerDelay = 100,
  className = "",
  direction = "up",
}: {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "scale";
}) {
  return (
    <>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <ScrollReveal
              key={index}
              delay={index * staggerDelay}
              direction={direction}
              className={className}
            >
              {child}
            </ScrollReveal>
          ))
        : children}
    </>
  );
}
