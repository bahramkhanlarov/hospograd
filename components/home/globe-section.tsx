// Renders the Globe (components/ui/globe.tsx, Task 4) marked with a handful
// of well-known hospitality hub cities. These markers are explicitly
// illustrative — HospoGrad does not collect alumni location data, so the
// copy below frames this as "hospitality careers span the globe" rather than
// claiming the markers represent actual member locations.

import type { COBEOptions } from "cobe";
import { Globe } from "@/components/ui/globe";
import GLOBE_CONFIG from "@/components/ui/globe";

// Approximate [lat, lng] pairs for illustrative hospitality-hub cities.
const HOSPITALITY_HUB_CONFIG: COBEOptions = {
  ...GLOBE_CONFIG,
  markers: [
    { location: [25.2048, 55.2708], size: 0.07 }, // Dubai
    { location: [1.3521, 103.8198], size: 0.07 }, // Singapore
    { location: [51.5074, -0.1278], size: 0.07 }, // London
    { location: [40.7128, -74.006], size: 0.07 }, // New York City
    { location: [46.2044, 6.1432], size: 0.07 }, // Geneva
    { location: [22.3193, 114.1694], size: 0.07 }, // Hong Kong
    { location: [13.7563, 100.5018], size: 0.07 }, // Bangkok
  ],
};

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
      <Globe className="mt-4" config={HOSPITALITY_HUB_CONFIG} />
    </section>
  );
}
