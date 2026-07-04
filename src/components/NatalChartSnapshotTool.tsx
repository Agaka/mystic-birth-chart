"use client";

import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { trackEvent } from "@/lib/analytics";
import {
  calculateNatalSnapshot,
  cityPresets,
  type CityPreset,
  type NatalSnapshotResult,
} from "@/lib/natalSnapshot";

interface NatalChartSnapshotToolProps {
  basicHref: string;
  completeHref: string;
}

interface BirthplaceOption {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface GeocodingApiResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country?: string;
  admin1?: string;
}

const quickPlaces = cityPresets
  .filter((city) => ["porto-alegre", "new-york", "london", "sao-paulo"].includes(city.id))
  .map(presetToBirthplace);

function formatOffset(offset: number): string {
  return offset > 0 ? `+${offset}` : `${offset}`;
}

function formatBirthplace(place: BirthplaceOption): string {
  return [place.name, place.admin1, place.country].filter(Boolean).join(", ");
}

function presetToBirthplace(city: CityPreset): BirthplaceOption {
  const [name, country = ""] = city.label.split(", ");

  return {
    id: city.id,
    name,
    country,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  };
}

function localBirthplaceMatches(query: string): BirthplaceOption[] {
  const normalized = query.toLowerCase();

  return cityPresets
    .filter((city) => city.label.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map(presetToBirthplace);
}

function uniquePlaces(places: BirthplaceOption[]): BirthplaceOption[] {
  const seen = new Set<string>();

  return places.filter((place) => {
    const key = `${place.name}-${place.country}-${place.admin1 ?? ""}-${place.timezone}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function fetchBirthplaces(query: string): Promise<BirthplaceOption[]> {
  const params = new URLSearchParams({
    name: query,
    count: "6",
    language: "en",
    format: "json",
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error("City search failed.");
  }

  const data = (await response.json()) as { results?: GeocodingApiResult[] };

  return (data.results ?? [])
    .filter((place) => place.timezone && place.country)
    .map((place) => ({
      id: String(place.id),
      name: place.name,
      admin1: place.admin1,
      country: place.country ?? "",
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone ?? "UTC",
    }));
}

export function NatalChartSnapshotTool({
  basicHref,
  completeHref,
}: NatalChartSnapshotToolProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [birthplaceQuery, setBirthplaceQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<BirthplaceOption | null>(null);
  const [placeResults, setPlaceResults] = useState<BirthplaceOption[]>([]);
  const [isFindingCity, setIsFindingCity] = useState(false);
  const [cityMessage, setCityMessage] = useState("");
  const [result, setResult] = useState<NatalSnapshotResult | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement | null>(null);

  function choosePlace(place: BirthplaceOption) {
    setSelectedPlace(place);
    setBirthplaceQuery(formatBirthplace(place));
    setCityMessage(`Using ${formatBirthplace(place)}.`);
  }

  async function findBirthplace(): Promise<BirthplaceOption | null> {
    const query = birthplaceQuery.trim();

    if (query.length < 2) {
      setCityMessage("");
      return null;
    }

    setIsFindingCity(true);
    setError("");

    try {
      const localMatches = localBirthplaceMatches(query);
      let apiPlaces: BirthplaceOption[] = [];

      try {
        apiPlaces = await fetchBirthplaces(query);
      } catch {
        apiPlaces = [];
      }

      const places = uniquePlaces([...apiPlaces, ...localMatches]);

      if (places.length === 0) {
        setPlaceResults([]);
        setCityMessage("");
        return null;
      }

      setPlaceResults(places);
      choosePlace(places[0]);
      setCityMessage(`Using ${formatBirthplace(places[0])}. Choose another match below if needed.`);
      return places[0];
    } finally {
      setIsFindingCity(false);
    }
  }

  async function handleCitySearch() {
    const place = await findBirthplace();
    if (!place) {
      trackEvent("free_chart_city_search", {
        status: "not_found",
      });
      setError("I could not find that city. Try adding the state or country, like Porto Alegre, Brazil.");
      return;
    }

    trackEvent("free_chart_city_search", {
      status: "found",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

    if (!date || !time) {
      setError("Enter your birth date and birth time to begin the free chart reading.");
      setResult(null);
      return;
    }

    if (!validTime) {
      setError("Enter birth time in 24-hour HH:MM format, like 14:35.");
      setResult(null);
      return;
    }

    const place = selectedPlace ?? (await findBirthplace());

    if (!place) {
      setError("Enter your birth city, like Porto Alegre, Brazil, so the chart can find the Rising sign.");
      setResult(null);
      return;
    }

    const snapshot = calculateNatalSnapshot({
      date,
      time,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
    });

    setError("");
    setResult(snapshot);
    trackEvent("free_chart_preview_generated", {
      sun_sign: snapshot.sunSign,
      moon_sign: snapshot.moonSign,
      rising_sign: snapshot.risingSign,
      chart_ruler: snapshot.chartRuler,
      sect: snapshot.sect,
    });
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <form
        onSubmit={handleSubmit}
        className="border border-gold/22 bg-ink/70 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.26)] md:p-8"
      >
        <div>
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold/72">
            Free chart preview
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-ivory md:text-4xl">
            Begin with the first layer of your chart.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ivory/58">
            No account, no email wall. This free preview calculates your chart
            in the browser and gives a real first reading of your Sun, Moon,
            Rising, chart ruler, and day or night chart. It is meant to feel
            personal enough to matter, but incomplete enough to show why the
            full chart needs synthesis.
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/62">
              Birth date
            </span>
            <input
              required
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="min-h-12 border border-ivory/14 bg-midnight px-4 font-ui text-sm text-ivory outline-none transition-colors placeholder:text-ivory/32 focus:border-gold"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/62">
              Birth time
            </span>
            <input
              required
              type="text"
              inputMode="numeric"
              pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
              placeholder="14:35"
              maxLength={5}
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="min-h-12 border border-ivory/14 bg-midnight px-4 font-ui text-sm text-ivory outline-none transition-colors focus:border-gold"
            />
            <span className="text-xs leading-relaxed text-ivory/42">
              If you do not know the exact time, use your best estimate. Rising
              sign and day/night status depend on time.
            </span>
          </label>

          <div className="grid gap-2">
            <label
              htmlFor="birthplace"
              className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/62"
            >
              Birth city
            </label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                id="birthplace"
                required
                type="text"
                placeholder="Porto Alegre, Brazil"
                value={birthplaceQuery}
                onChange={(event) => {
                  setBirthplaceQuery(event.target.value);
                  setSelectedPlace(null);
                  setCityMessage("");
                }}
                className="min-h-12 border border-ivory/14 bg-midnight px-4 font-ui text-sm text-ivory outline-none transition-colors placeholder:text-ivory/32 focus:border-gold"
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={isFindingCity}
                onClick={handleCitySearch}
                className="w-full sm:w-auto"
              >
                {isFindingCity ? "Finding..." : "Find City"}
              </Button>
            </div>
            <span className="text-xs leading-relaxed text-ivory/42">
              City, state, or country works best. Birth date and time stay in
              your browser; only the city text is searched.
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickPlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => {
                  setPlaceResults([]);
                  choosePlace(place);
                }}
                className="border border-gold/20 px-3 py-2 font-ui text-xs text-ivory/68 transition-colors hover:border-gold/45 hover:text-ivory"
              >
                {formatBirthplace(place)}
              </button>
            ))}
          </div>

          {(cityMessage || selectedPlace) && (
            <p className="border border-gold/20 bg-gold/8 px-4 py-3 text-sm leading-relaxed text-ivory/68">
              {cityMessage || (selectedPlace ? `Using ${formatBirthplace(selectedPlace)}.` : "")}
            </p>
          )}

          {placeResults.length > 1 && (
            <div className="grid gap-2">
              {placeResults.map((place) => {
                const active = selectedPlace?.id === place.id;
                return (
                  <button
                    key={`${place.id}-${place.timezone}`}
                    type="button"
                    onClick={() => choosePlace(place)}
                    className={`border px-4 py-3 text-left transition-colors ${
                      active
                        ? "border-gold bg-gold/12 text-ivory"
                        : "border-ivory/12 bg-midnight/70 text-ivory/62 hover:border-gold/35 hover:text-ivory"
                    }`}
                  >
                    <span className="block font-ui text-sm font-semibold">
                      {formatBirthplace(place)}
                    </span>
                    <span className="mt-1 block font-ui text-xs text-ivory/42">
                      {place.timezone}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-5 border border-rose/40 bg-rose/12 px-4 py-3 text-sm text-ivory">
            {error}
          </p>
        )}

        <div className="mt-7">
          <Button type="submit" size="lg" className="w-full" disabled={isFindingCity}>
            {isFindingCity ? "Finding City..." : "Begin My Free Reading"}
          </Button>
        </div>
      </form>

      <div
        ref={resultRef}
        className="min-h-[560px] scroll-mt-28 border border-gold/22 bg-ivory p-6 text-ink shadow-[0_24px_70px_rgba(0,0,0,0.18)] md:p-8"
      >
        {result ? (
          <SnapshotResult
            result={result}
            basicHref={basicHref}
            completeHref={completeHref}
            birthplaceLabel={selectedPlace ? formatBirthplace(selectedPlace) : birthplaceQuery}
          />
        ) : (
          <EmptyResult />
        )}
      </div>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="flex min-h-[500px] flex-col justify-center">
      <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark/75">
        Waiting for birth data
      </p>
      <h3 className="mt-4 font-heading text-3xl font-semibold leading-tight text-aubergine md:text-5xl">
        Your first chart notes will appear here.
      </h3>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/62">
        The free preview is designed to give a real first taste without
        pretending to be a full reading. It should name something recognizable,
        then show where the deeper questions begin.
      </p>
      <div className="mt-8 grid gap-3 text-sm text-ink/62 sm:grid-cols-3">
        {["Sun sign", "Moon sign", "Rising sign"].map((item) => (
          <div key={item} className="border border-gold/25 px-4 py-3">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function SnapshotResult({
  result,
  basicHref,
  completeHref,
  birthplaceLabel,
}: {
  result: NatalSnapshotResult;
  basicHref: string;
  completeHref: string;
  birthplaceLabel: string;
}) {
  return (
    <div>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark/80">
            Your first chart reading
          </p>
          <h3 className="mt-3 font-heading text-3xl font-semibold leading-tight text-aubergine md:text-5xl">
            {result.sunSign} Sun. {result.moonSign} Moon. {result.risingSign} Rising.
          </h3>
        </div>
        <div className="border border-gold/35 px-4 py-3 font-ui text-xs uppercase tracking-[0.16em] text-ink/58 md:text-right">
          <span className="block normal-case tracking-normal">{birthplaceLabel}</span>
          <span className="mt-1 block">
            UTC {formatOffset(result.utcOffset)} / {result.timezone}
          </span>
        </div>
      </div>

      <p className="mt-6 text-lg leading-relaxed text-ink/70">{result.summary}</p>
      <p className="mt-4 text-base leading-relaxed text-ink/58">
        Read this as the opening page, not the final verdict. If it feels close,
        the reason is that the chart is already speaking. The paid reading goes
        further by deciding which parts of the chart deserve priority and how
        these placements actually connect.
      </p>

      <div className="mt-8 grid gap-4">
        {result.placements.map((placement) => (
          <article key={placement.title} className="border border-gold/24 bg-white/34 p-5 md:p-6">
            <h4 className="font-heading text-2xl font-semibold text-aubergine">
              {placement.title}
            </h4>
            <p className="mt-3 text-base leading-relaxed text-ink/68">
              {placement.body}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[result.rulerInterpretation, result.sectInterpretation].map((item) => (
          <article key={item.title} className="border border-aubergine/18 bg-aubergine/[0.04] p-5 md:p-6">
            <h4 className="font-heading text-2xl font-semibold text-aubergine">
              {item.title}
            </h4>
            <p className="mt-3 text-base leading-relaxed text-ink/68">{item.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 border-l-2 border-gold bg-gold/10 px-5 py-4">
        <p className="text-sm leading-relaxed text-ink/68">{result.calculationNote}</p>
      </div>

      <div className="mt-8 bg-ink p-6 text-ivory">
        <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
          What a paid reading adds
        </p>
        <h4 className="mt-3 font-heading text-3xl font-semibold">
          The part this preview cannot do is synthesis.
        </h4>
        <p className="mt-3 text-sm leading-relaxed text-ivory/68">
          A complete reading does not simply add more paragraphs. It decides
          which placements matter most, which houses carry the story, and where
          your chart repeats the same theme through different symbols.
        </p>
        <ul className="mt-5 grid gap-3 text-sm leading-relaxed text-ivory/68 md:grid-cols-2">
          <li>+ House placements and angular emphasis</li>
          <li>+ Traditional rulers and planetary condition</li>
          <li>+ Aspects, repeating themes, and chart hierarchy</li>
          <li>+ Practical written guidance you can revisit</li>
        </ul>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            href={basicHref}
            size="md"
            className="sm:flex-1"
            analytics={{
              event: "reading_offer_click",
              params: {
                offer_id: "basic-reading",
                cta_location: "free_chart_result",
              },
            }}
          >
            Order Basic Reading
          </Button>
          <Button
            href={completeHref}
            variant="secondary"
            size="md"
            className="sm:flex-1"
            analytics={{
              event: "reading_offer_click",
              params: {
                offer_id: "complete-reading",
                cta_location: "free_chart_result",
              },
            }}
          >
            Order Complete Reading
          </Button>
        </div>
      </div>
    </div>
  );
}
