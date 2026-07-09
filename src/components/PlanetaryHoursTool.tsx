"use client";

import { useEffect, useRef, useState } from "react";
import { IconSun, IconMoon, IconMapPin, IconCalendarEvent } from "@tabler/icons-react";
import { BirthplaceOption, fetchBirthplaces, formatBirthplace } from "@/lib/geocoding";
import { calculatePlanetaryHours, PlanetaryHour, PlanetName } from "@/lib/astronomy";

const planetSymbols: Record<PlanetName, string> = {
  Saturn: "♄",
  Jupiter: "♃",
  Mars: "♂",
  Sun: "☉",
  Venus: "♀",
  Mercury: "☿",
  Moon: "☽"
};

export function PlanetaryHoursTool() {
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [placeResults, setPlaceResults] = useState<BirthplaceOption[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<BirthplaceOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hours, setHours] = useState<PlanetaryHour[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || selectedPlace?.name === searchQuery) {
      setPlaceResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await fetchBirthplaces(searchQuery);
        setPlaceResults(results);
        setShowDropdown(true);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedPlace]);

  // Calculate hours when place or date changes
  useEffect(() => {
    if (selectedPlace && date) {
      // Ensure we are using the local date selected by the user
      const targetDate = new Date(`${date}T12:00:00`); 
      const calculatedHours = calculatePlanetaryHours(targetDate, selectedPlace.latitude, selectedPlace.longitude);
      setHours(calculatedHours);
    }
  }, [selectedPlace, date]);

  function handleSelectPlace(place: BirthplaceOption) {
    setSelectedPlace(place);
    setSearchQuery(place.name);
    setShowDropdown(false);
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl font-semibold text-ivory sm:text-5xl">
          Planetary Hours Calculator
        </h1>
        <p className="mt-4 text-lg text-ivory/70">
          Find the ruling intelligence of any hour. Ground your Hermetic practice in the traditional Chaldean sequence.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Controls */}
        <div className="md:col-span-5 lg:col-span-4">
          <div className="sticky top-24 rounded-2xl bg-midnight-light p-6 shadow-sm border border-gold/20">
            <h2 className="mb-6 font-heading text-xl font-semibold text-ivory">
              Configuration
            </h2>
            
            <div className="grid gap-6">
              <div>
                <label htmlFor="ph-date" className="mb-2 flex items-center gap-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/60">
                  <IconCalendarEvent className="h-4 w-4" />
                  Date
                </label>
                <input
                  id="ph-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border border-ivory/20 bg-midnight px-4 py-3 font-ui text-sm text-ivory outline-none transition-colors focus:border-gold"
                />
              </div>

              <div className="relative" ref={dropdownRef}>
                <label htmlFor="ph-city" className="mb-2 flex items-center gap-2 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/60">
                  <IconMapPin className="h-4 w-4" />
                  Location
                </label>
                <div className="relative">
                  <input
                    id="ph-city"
                    type="text"
                    autoComplete="off"
                    placeholder="Search your city..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (selectedPlace) setSelectedPlace(null);
                    }}
                    onFocus={() => {
                      if (placeResults.length > 0) setShowDropdown(true);
                    }}
                    className="w-full rounded-md border border-ivory/20 bg-midnight px-4 py-3 font-ui text-sm text-ivory outline-none transition-colors placeholder:text-ivory/30 focus:border-gold"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/20 border-t-gold" />
                    </div>
                  )}
                </div>

                {showDropdown && placeResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-gold/30 bg-ink shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                    {placeResults.map((place, index) => (
                      <button
                        key={`${place.id}-${index}`}
                        type="button"
                        onClick={() => handleSelectPlace(place)}
                        className="flex w-full flex-col border-b border-ivory/5 px-4 py-3 text-left transition-colors last:border-0 hover:bg-gold/10"
                      >
                        <span className="font-ui text-sm font-semibold text-ivory">
                          {formatBirthplace(place)}
                        </span>
                        <span className="mt-0.5 font-ui text-xs text-ivory/50">
                          {place.timezone}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="md:col-span-7 lg:col-span-8">
          {!selectedPlace ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gold/20 bg-midnight-light/50 p-8 text-center">
              <IconMapPin className="mb-4 h-12 w-12 text-gold/40" stroke={1} />
              <h3 className="font-heading text-xl text-ivory/80">Location Required</h3>
              <p className="mt-2 text-sm text-ivory/60">
                Planetary hours depend on the exact timing of sunrise and sunset. <br/> Please search and select your city.
              </p>
            </div>
          ) : hours.length === 0 ? (
            <div className="flex h-full min-h-[300px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ivory/20 border-t-gold" />
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Day Hours */}
              <div>
                <div className="mb-4 flex items-center gap-2 border-b border-gold/20 pb-3">
                  <IconSun className="h-5 w-5 text-gold" />
                  <h3 className="font-heading text-xl font-semibold text-ivory">Diurnal Hours</h3>
                </div>
                <div className="space-y-2">
                  {hours.filter((h) => h.isDaytime).map((hour) => (
                    <div key={hour.index} className="flex items-center justify-between rounded-md bg-midnight-light px-4 py-3 shadow-sm border border-gold/5">
                      <div className="flex items-center gap-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-bold text-gold">
                          {hour.index}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl text-gold">{planetSymbols[hour.planet]}</span>
                          <span className="font-ui font-semibold text-ivory">{hour.planet}</span>
                        </div>
                      </div>
                      <span className="font-ui text-sm text-ivory/70">
                        {formatTime(hour.startTime)} - {formatTime(hour.endTime)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Night Hours */}
              <div>
                <div className="mb-4 flex items-center gap-2 border-b border-gold/20 pb-3">
                  <IconMoon className="h-5 w-5 text-ivory/80" />
                  <h3 className="font-heading text-xl font-semibold text-ivory">Nocturnal Hours</h3>
                </div>
                <div className="space-y-2">
                  {hours.filter((h) => !h.isDaytime).map((hour) => (
                    <div key={hour.index} className="flex items-center justify-between rounded-md bg-midnight-light px-4 py-3 shadow-sm border border-gold/5">
                      <div className="flex items-center gap-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ivory/10 text-xs font-bold text-ivory/60">
                          {hour.index - 12}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl text-ivory/60">{planetSymbols[hour.planet]}</span>
                          <span className="font-ui font-semibold text-ivory">{hour.planet}</span>
                        </div>
                      </div>
                      <span className="font-ui text-sm text-ivory/70">
                        {formatTime(hour.startTime)} - {formatTime(hour.endTime)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
