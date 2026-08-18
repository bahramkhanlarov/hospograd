// Geographic data for the clinic map on the /medical page. Each clinic slug
// (matching lib/clinics.ts) is given a latitude/longitude and a region label.
// Regions are used to colour the map dots and to build the legend.

import { CLINICS } from "@/lib/clinics";

export interface ClinicMapPoint {
  slug: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  region: MapRegion;
}

export const MAP_REGIONS = [
  "Lake Geneva",
  "Zurich & Central",
  "Eastern",
  "Bern region",
] as const;

export type MapRegion = (typeof MAP_REGIONS)[number];

const COORDS: Record<string, { lat: number; lon: number; region: MapRegion }> = {
  "cereneo-hertenstein": { lat: 47.032, lon: 8.47, region: "Zurich & Central" },
  "clinique-nescens": { lat: 46.435, lon: 6.217, region: "Lake Geneva" },
  "rehaklinik-seewis": { lat: 46.99, lon: 9.637, region: "Eastern" },
  "klinik-schloss-mammern": { lat: 47.646, lon: 8.916, region: "Eastern" },
  "hirslanden-klinik-aarau": { lat: 47.393, lon: 8.044, region: "Zurich & Central" },
  "rehaklinik-tschugg": { lat: 47.028, lon: 7.077, region: "Bern region" },
  "klinik-adelheid": { lat: 47.139, lon: 8.584, region: "Zurich & Central" },
  "clinique-de-genolier": { lat: 46.435, lon: 6.217, region: "Lake Geneva" },
  "klinik-hirslanden": { lat: 47.364, lon: 8.543, region: "Zurich & Central" },
  "clinique-la-prairie": { lat: 46.442, lon: 6.895, region: "Lake Geneva" },
  "clinique-valmont": { lat: 46.434, lon: 6.933, region: "Lake Geneva" },
  "clinique-de-la-source": { lat: 46.521, lon: 6.634, region: "Lake Geneva" },
  "hirslanden-clinique-bois-cerf": { lat: 46.526, lon: 6.627, region: "Lake Geneva" },
  "clinique-de-montchoisi": { lat: 46.52, lon: 6.653, region: "Lake Geneva" },
  "hopital-de-la-tour": { lat: 46.229, lon: 6.081, region: "Lake Geneva" },
  "clinique-des-grangettes": { lat: 46.194, lon: 6.185, region: "Lake Geneva" },
  "clinique-generale-beaulieu": { lat: 46.192, lon: 6.152, region: "Lake Geneva" },
  "clinique-de-carouge": { lat: 46.183, lon: 6.14, region: "Lake Geneva" },
  "hirslanden-clinique-cecil": { lat: 46.522, lon: 6.635, region: "Lake Geneva" },
  "chuv-lausanne": { lat: 46.524, lon: 6.644, region: "Lake Geneva" },
};

const REGION_COLOURS: Record<MapRegion, string> = {
  "Lake Geneva": "#1a7f6a",
  "Zurich & Central": "#c9a84c",
  Eastern: "#8a5a3b",
  "Bern region": "#4a6fa5",
};

export function regionColour(region: MapRegion): string {
  return REGION_COLOURS[region];
}

export function regionCounts(): Array<{ region: MapRegion; count: number }> {
  return MAP_REGIONS.map((region) => ({
    region,
    count: Object.values(COORDS).filter((c) => c.region === region).length,
  }));
}

export function clinicMapPoints(): ClinicMapPoint[] {
  return Object.entries(CLINICS)
    .map(([slug, clinic]) => {
      const coord = COORDS[slug];
      if (!coord) return null;
      return {
        slug,
        name: clinic.name,
        location: clinic.location,
        lat: coord.lat,
        lon: coord.lon,
        region: coord.region,
      };
    })
    .filter((p): p is ClinicMapPoint => p !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}