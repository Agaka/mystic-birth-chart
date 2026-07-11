import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Mystic Birth Chart - traditional astrology from the old study",
};

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
  noIndex = false,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type,
      locale: "en_US",
      url: path,
      siteName: siteConfig.name,
      title,
      description,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
    robots: {
      index: !noIndex,
      follow: true,
    },
  };
}
