// Next.js port of the featured-clinic purchase flow. Server component renders
// the layout shell; the interactive form lives in a client sub-component.

import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { FeatureClinicForm } from "@/components/feature-clinic/feature-clinic-form";

export const dynamic = "force-dynamic";

export default function FeatureClinicPage() {
  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Medical", href: "/medical" },
          { label: "Feature your clinic" },
        ]}
      />
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-4">
        <Suspense
          fallback={
            <p className="py-12 text-center italic text-muted-foreground">
              Loading…
            </p>
          }
        >
          <FeatureClinicForm />
        </Suspense>
      </div>
    </>
  );
}