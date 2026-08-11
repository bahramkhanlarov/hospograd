"use client";

import { FormEvent, useState } from "react";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";

export default function AlumniVerifyPage() {
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!linkedinUrl.trim() && !file) {
      setError("Provide a LinkedIn URL or upload a verification document.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("email", email.trim());
      if (linkedinUrl.trim()) formData.append("linkedinUrl", linkedinUrl.trim());
      if (file) formData.append("document", file);

      const res = await fetch("/api/auth/alumni-verification", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Verification submission failed.");
        return;
      }

      setSuccess("Verification submitted. An admin will review your documents.");
      setEmail("");
      setLinkedinUrl("");
      setFile(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Nav />
      <Breadcrumb items={[{ label: "Alumni verification" }]} />
      <div className="mx-auto w-full max-w-md flex-1 px-5 py-10">
        <div className="rounded-md border border-border bg-card p-6 shadow-md">
          <h2 className="mb-2 text-[1.3rem] font-semibold text-foreground">
            Alumni verification
          </h2>
          <p className="mb-6 text-[0.82rem] text-muted-foreground">
            Submit your LinkedIn profile URL or upload a diploma/student ID to
            verify your alumni status.
          </p>

          {success ? (
            <div className="rounded-sm border border-primary/30 bg-primary/10 px-4 py-3 text-[0.85rem] text-primary">
              {success}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
                >
                  Email used during signup
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="linkedin"
                  className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
                >
                  LinkedIn profile URL
                </label>
                <input
                  id="linkedin"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-sm border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="text-center text-[0.82rem] text-muted-foreground">— or —</div>

              <div>
                <label
                  htmlFor="document"
                  className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
                >
                  Upload diploma or student ID
                </label>
                <input
                  id="document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-[0.85rem] text-foreground file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-[0.8rem] file:font-medium file:text-primary-foreground"
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
                {submitting ? "Submitting…" : "Submit for review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}