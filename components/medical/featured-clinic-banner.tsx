// Featured-clinic placement banner for the /medical page. Fetches the current
// active placement from /api/clinics/featured and, when one exists, renders a
// highlighted card above the clinic grid linking to the clinic's profile.
// Renders nothing when the slot is unoccupied.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { ClinicInfo } from "@/lib/clinics";

interface FeaturedResponse {
  featured: {
    slug: string;
    clinic: ClinicInfo;
    expiresAt: number;
  } | null;
}

export function FeaturedClinicBanner() {
  const [featured, setFeatured] = useState<FeaturedResponse["featured"]>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet<FeaturedResponse>("/api/clinics/featured")
      .then((data) => {
        if (!cancelled) setFeatured(data.featured);
      })
      .catch(() => {
        /* leave the slot empty on failure */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!featured) return null;

  const { clinic } = featured;
  const daysLeft = Math.max(
    0,
    Math.ceil((featured.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)),
  );

  return (
    <Link
      href={`/clinics/${featured.slug}`}
      className="group mb-8 block overflow-hidden rounded-md border-2 border-primary/60 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="h-28 w-full shrink-0 overflow-hidden rounded-sm sm:h-20 sm:w-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={clinic.img}
            alt={`${clinic.name} facility`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <span className="mb-1 inline-block rounded-sm bg-primary px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-primary-foreground">
            Featured
          </span>
          <h2 className="font-display text-[1.3rem] font-medium text-foreground group-hover:text-primary">
            {clinic.name}
          </h2>
          <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
            {clinic.intro}
          </p>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className="text-[0.75rem] font-medium text-primary">
            {clinic.location}
          </p>
          <p className="mt-1 text-[0.7rem] text-muted-foreground">
            {daysLeft} {daysLeft === 1 ? "day" : "days"} featured
          </p>
          <span className="mt-2 inline-block text-[0.75rem] font-medium text-primary">
            View profile →
          </span>
        </div>
      </div>
    </Link>
  );
}