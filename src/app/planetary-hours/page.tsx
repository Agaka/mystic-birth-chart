import type { Metadata } from "next";
import { PlanetaryHoursTool } from "@/components/PlanetaryHoursTool";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Planetary Hours Calculator",
  description:
    "Calculate precise planetary hours for any city. Ground your Hermetic and astrological practices in traditional timing.",
  path: "/planetary-hours",
});

export default function PlanetaryHoursPage() {
  return <PlanetaryHoursTool />;
}
