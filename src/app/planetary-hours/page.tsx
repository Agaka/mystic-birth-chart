import { PlanetaryHoursTool } from "@/components/PlanetaryHoursTool";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Planetary Hours Calculator | Mystic Birth Chart",
  description:
    "Calculate exact planetary hours for any day and location. Ground your Hermetic and astrological practices in the Chaldean sequence.",
};

export default function PlanetaryHoursPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-parchment-light">
        <PlanetaryHoursTool />
      </main>
      <SiteFooter />
    </>
  );
}
