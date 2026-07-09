export interface GeocodingApiResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export interface BirthplaceOption {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export async function fetchBirthplaces(query: string): Promise<BirthplaceOption[]> {
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

export function formatBirthplace(place: BirthplaceOption): string {
  if (place.admin1) {
    return `${place.name}, ${place.admin1}, ${place.country}`;
  }
  return `${place.name}, ${place.country}`;
}
