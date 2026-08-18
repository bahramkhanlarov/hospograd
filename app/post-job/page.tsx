// Next.js port of the job-posting flow. Server component renders the layout
// shell; the interactive form lives in a client sub-component.

import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PostJobForm } from "@/components/post-job/post-job-form";

export const dynamic = "force-dynamic";

export default function PostJobPage() {
  return (
    <>
      <Nav />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Jobs", href: "/category/jobs-internships" },
          { label: "Post a job" },
        ]}
      />
      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-4">
        <Suspense
          fallback={
            <p className="py-12 text-center italic text-muted-foreground">
              Loading…
            </p>
          }
        >
          <PostJobForm />
        </Suspense>
      </div>
    </>
  );
}