// Renders the Globe (components/ui/interactive-globe.tsx) marked with a
// handful of well-known hospitality hub cities. These markers are explicitly
// illustrative: HospoGrad does not collect alumni location data, so the
// copy below frames this as "careers tend to go here" rather than claiming
// the markers represent actual member locations.

import { Component as Globe } from "@/components/ui/interactive-globe";

// Illustrative hospitality-hub cities. Dot field uses the brand pine green
// (--primary equivalent), arcs/markers use the copper accent reserved for
// this one component so it reads as a deliberate motif, not a random color.
const HOSPITALITY_HUB_MARKERS = [
  { lat: 25.2048, lng: 55.2708, label: "Dubai" },
  { lat: 1.3521, lng: 103.8198, label: "Singapore" },
  { lat: 51.5074, lng: -0.1278, label: "London" },
  { lat: 40.7128, lng: -74.006, label: "New York City" },
  { lat: 46.2044, lng: 6.1432, label: "Geneva" },
  { lat: 47.3769, lng: 8.5417, label: "Zurich" },
  { lat: 48.8566, lng: 2.3522, label: "Paris" },
  { lat: 22.3193, lng: 114.1694, label: "Hong Kong" },
  { lat: 13.7563, lng: 100.5018, label: "Bangkok" },
  { lat: 31.2304, lng: 121.4737, label: "Shanghai" },
  { lat: 25.2854, lng: 51.531, label: "Doha" },
  { lat: -33.8688, lng: 151.2093, label: "Sydney" },
  { lat: -33.9249, lng: 18.4241, label: "Cape Town" },
  { lat: 25.7617, lng: -80.1918, label: "Miami" },
  { lat: 43.6532, lng: -79.3832, label: "Toronto" },
];

const HOSPITALITY_HUB_CONNECTIONS = [
  { from: [25.2048, 55.2708], to: [1.3521, 103.8198] }, // Dubai - Singapore
  { from: [51.5074, -0.1278], to: [40.7128, -74.006] }, // London - NYC
  { from: [51.5074, -0.1278], to: [46.2044, 6.1432] }, // London - Geneva
  { from: [46.2044, 6.1432], to: [47.3769, 8.5417] }, // Geneva - Zurich
  { from: [48.8566, 2.3522], to: [46.2044, 6.1432] }, // Paris - Geneva
  { from: [1.3521, 103.8198], to: [22.3193, 114.1694] }, // Singapore - Hong Kong
  { from: [1.3521, 103.8198], to: [13.7563, 100.5018] }, // Singapore - Bangkok
  { from: [22.3193, 114.1694], to: [31.2304, 121.4737] }, // Hong Kong - Shanghai
  { from: [25.2048, 55.2708], to: [25.2854, 51.531] }, // Dubai - Doha
  { from: [1.3521, 103.8198], to: [-33.8688, 151.2093] }, // Singapore - Sydney
  { from: [40.7128, -74.006], to: [25.7617, -80.1918] }, // NYC - Miami
  { from: [40.7128, -74.006], to: [43.6532, -79.3832] }, // NYC - Toronto
  { from: [25.2048, 55.2708], to: [-33.9249, 18.4241] }, // Dubai - Cape Town
] satisfies { from: [number, number]; to: [number, number] }[];

export function GlobeSection() {
  return (
    <section className="my-10 grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
      <div className="max-w-md">
        <h2 className="font-display text-[1.9rem] font-medium leading-[1.1] text-foreground text-balance">
          A hospitality degree travels further than most.
        </h2>
        <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-foreground">
          Alumni from Glion, EHL, Les Roches and the other Swiss schools land
          in kitchens, front desks and head offices on every continent. The
          globe traces where those careers tend to go.
        </p>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-[560px]">
        <Globe
          className="w-full h-full"
          markers={HOSPITALITY_HUB_MARKERS}
          connections={HOSPITALITY_HUB_CONNECTIONS}
          dotColor="rgba(31, 92, 69, ALPHA)"
          arcColor="rgba(31, 92, 69, 0.35)"
          markerColor="rgba(177, 89, 47, 1)"
        />
      </div>
    </section>
  );
}
