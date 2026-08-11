"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { apiPost } from "@/lib/api";

export const dynamic = "force-dynamic";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost("/api/auth/verify-otp", { email, code });
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Verification failed. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Nav />
      <Breadcrumb items={[{ label: "Verify email" }]} />
      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm rounded-md border border-border bg-card p-7 shadow-md">
          <h2 className="mb-2 text-center text-[1.3rem] font-semibold text-foreground">
            Check your email
          </h2>
          <p className="mb-6 text-center text-[0.82rem] text-muted-foreground">
            Enter the 6-digit code we sent to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
              >
                Verification code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full rounded-sm border border-input bg-background px-3 py-2 text-center text-[1.3rem] tracking-[0.3em] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {error && (
              <p className="text-[0.82rem] font-medium text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-primary px-4 py-2 text-[0.9rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Verifying…" : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}