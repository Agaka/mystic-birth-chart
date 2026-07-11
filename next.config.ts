import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const newsletterOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_NEWSLETTER_SIGNUP_URL
      ? new URL(process.env.NEXT_PUBLIC_NEWSLETTER_SIGNUP_URL).origin
      : "";
  } catch {
    return "";
  }
})();

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://js.stripe.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://geocoding-api.open-meteo.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  `form-action 'self' https://checkout.stripe.com${newsletterOrigin ? ` ${newsletterOrigin}` : ""}`,
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
          ...(isDevelopment
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]),
        ],
      },
    ];
  },
};

export default nextConfig;
