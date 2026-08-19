// Server wrapper for the featured-clinic payment-success page. The client
// sub-component reads session_id from the URL and polls
// /api/clinics/featured/status for the confirmed placement.

import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { FeatureClinicSuccess } from "@/components/feature-clinic/feature-clinic-success";

export const dynamic = "force-dynamic";

export default function FeatureClinicSuccessPage() {
  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Medical", href: "/medical" },
          { label: "Payment" },
        ]}
      />
      <Suspense
        fallback={
          <p className="py-12 text-center italic text-muted-foreground">
            Loading…
          </p>
        }
      >
        <FeatureClinicSuccess />
      </Suspense>
    </>
  );
}