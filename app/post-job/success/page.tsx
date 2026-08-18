// Server wrapper for the payment-success page. The client sub-component reads
// session_id from the URL and polls /api/jobs/status for the published post.

import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PostJobSuccess } from "@/components/post-job/post-job-success";

export const dynamic = "force-dynamic";

export default function PostJobSuccessPage() {
  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Jobs", href: "/category/jobs-internships" },
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
        <PostJobSuccess />
      </Suspense>
    </>
  );
}