// Static SVG map of Switzerland showing clinic locations, colour-coded by
// region. The country outline comes from the Wikimedia "Switzerland location
// map.svg" (CC-BY-SA 3.0, NordNordWest) — its geographic limits are
// N 47.9, S 45.75, W 5.8, E 10.7 in an equirectangular projection.
//
// We keep the outline in its original coordinate space, wrapped in the same
// <g> transforms as the source file, and place each clinic dot with the
// standard equirectangular projection into that space so dots align with the
// outline. Dots link to the individual /clinics/<slug> pages.

import Link from "next/link";
import {
  clinicMapPoints,
  regionColour,
  regionCounts,
} from "@/lib/clinic-map";
import { SWITZERLAND_OUTLINE } from "@/lib/switzerland-outline";

// Geographic bounds of the source map.
const LON_MIN = 5.8;
const LON_MAX = 10.7;
const LAT_MAX = 47.9;
const LAT_MIN = 45.75;
// Map dimensions in the outline's original coordinate space.
const MAP_W = 1346.97;
const MAP_H = 886.52;

function project(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * MAP_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * MAP_H;
  return { x, y };
}

const OUTLINE_TRANSFORM =
  "matrix(1,0,0,0.9737543,324.44139,-85.867791) translate(-323.94019,88.618893)";

export default function ClinicMap() {
  const points = clinicMapPoints();
  const counts = regionCounts();

  return (
    <div>
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <svg
          viewBox="0 0 1349 865"
          role="img"
          aria-label="Map of Switzerland with clinic locations"
          className="w-full"
        >
          <g transform={OUTLINE_TRANSFORM}>
            <rect
              x="0.0188"
              y="0.0539"
              width={MAP_W}
              height={MAP_H}
              fill="var(--muted)"
            />
            <path
              d={SWITZERLAND_OUTLINE}
              fill="var(--card-foreground)"
              fillOpacity="0.04"
              stroke="var(--border)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {points.map((p) => {
              const { x, y } = project(p.lat, p.lon);
              return (
                <a
                  key={p.slug}
                  href={`/clinics/${p.slug}`}
                  className="map-dot-link"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r="13"
                    fill={regionColour(p.region)}
                    fillOpacity="0.18"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="6.5"
                    fill={regionColour(p.region)}
                    stroke="var(--card)"
                    strokeWidth="2"
                  />
                  <title>{`${p.name} — ${p.location} (${p.region})`}</title>
                </a>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map(({ region, count }) => (
          <div
            key={region}
            className="rounded-lg border border-border bg-card p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: regionColour(region) }}
              />
              <span className="text-[0.8rem] font-semibold text-foreground">
                {region}
              </span>
            </div>
            <p className="mt-1 text-[0.78rem] text-muted-foreground">
              {count} clinic{count === 1 ? "" : "s"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="font-display mb-3 text-lg font-medium text-foreground">
          All clinics by region
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {points.map((p) => (
            <Link
              key={p.slug}
              href={`/clinics/${p.slug}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[0.82rem] transition-colors hover:border-foreground/20 hover:bg-muted"
            >
              <span className="font-medium text-foreground">{p.name}</span>
              <span className="shrink-0 text-muted-foreground">
                {p.location}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}