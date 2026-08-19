import { Suspense } from "react";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SignupForm } from "@/components/signup/signup-form";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <>
      <Nav />
      <Breadcrumb items={[{ label: "Sign up" }]} />
      <div className="mx-auto w-full max-w-md flex-1 px-5 py-10">
        <div className="rounded-md border border-border bg-card p-6 shadow-md">
          <Suspense
            fallback={
              <p className="py-12 text-center italic text-muted-foreground">
                Loading…
              </p>
            }
          >
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}