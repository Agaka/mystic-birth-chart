import { CommercialReadingLanding } from "@/components/CommercialReadingLanding";
import { commercialLandings } from "@/lib/commercialLandings";
import { createPageMetadata } from "@/lib/metadata";

const config = commercialLandings.complete;
export const metadata = createPageMetadata({ title: config.title, description: config.description, path: config.path });
export default function Page() { return <CommercialReadingLanding config={config} />; }
