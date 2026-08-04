// Renders the Globe (components/ui/interactive-globe.tsx) marked with a
// handful of well-known hospitality hub cities. These markers are explicitly
// illustrative — HospoGrad does not collect alumni location data, so the
// copy below frames this as "hospitality careers span the globe" rather than
// claiming the markers represent actual member locations.

import { Component as Globe } from "@/components/ui/interactive-globe";

// Illustrative hospitality-hub cities. Dot/arc/marker colors reuse the
// existing dark-theme tokens (--primary, --link) rather than inventing new
// brand colors.
const HOSPITALITY_HUB_MARKERS = [
  { lat: 25.2048, lng: 55.2708, label: "Dubai" },
  { lat: 1.3521, lng: 103.8198, label: "Singapore" },
  { lat: 51.5074, lng: -0.1278, label: "London" },
  { lat: 40.7128, lng: -74.006, label: "New York City" },
  { lat: 46.2044, lng: 6.1432, label: "Geneva" },
  { lat: 22.3193, lng: 114.1694, label: "Hong Kong" },
  { lat: 13.7563, lng: 100.5018, label: "Bangkok" },
];

const HOSPITALITY_HUB_CONNECTIONS = [
  { from: [25.2048, 55.2708], to: [1.3521, 103.8198] }, // Dubai - Singapore
  { from: [51.5074, -0.1278], to: [40.7128, -74.006] }, // London - NYC
  { from: [51.5074, -0.1278], to: [46.2044, 6.1432] }, // London - Geneva
  { from: [1.3521, 103.8198], to: [22.3193, 114.1694] }, // Singapore - Hong Kong
  { from: [1.3521, 103.8198], to: [13.7563, 100.5018] }, // Singapore - Bangkok
] satisfies { from: [number, number]; to: [number, number] }[];

export function GlobeSection() {
  return (
    <section className="my-8 flex flex-col items-center text-center">
      <h2 className="font-display text-2xl font-normal text-foreground">
        Hospitality careers span the globe
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        These cities are illustrative examples of major hospitality hubs, not
        a record of where HospoGrad members actually work — we don&rsquo;t
        collect that data.
      </p>
      <div className="relative mx-auto mt-4 aspect-square w-full max-w-[600px]">
        <Globe
          className="w-full h-full"
          markers={HOSPITALITY_HUB_MARKERS}
          connections={HOSPITALITY_HUB_CONNECTIONS}
          dotColor="rgba(20, 184, 146, ALPHA)"
          arcColor="rgba(20, 184, 146, 0.4)"
          markerColor="rgba(94, 179, 255, 1)"
        />
      </div>
    </section>
  );
}
