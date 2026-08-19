// Server wrapper for the health-insurance comparison form. The interactive
// form lives in a client sub-component; this page only renders the shell.

import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { InsuranceCompareForm } from "@/components/insurance/insurance-compare-form";

export const dynamic = "force-dynamic";

export default function InsuranceComparePage() {
  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Insurance", href: "/insurance" },
          { label: "Compare" },
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
          <InsuranceCompareForm />
        </Suspense>
      </div>
    </>
  );
}