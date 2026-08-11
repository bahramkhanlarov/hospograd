"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { apiPost } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiPost("/api/auth/login", { username, password });
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Nav />
      <Breadcrumb items={[{ label: "Log in" }]} />
      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm rounded-md border border-border bg-card p-7 shadow-md">
          <h2 className="mb-6 text-center text-[1.3rem] font-semibold text-foreground">
            Log in
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-sm border border-input bg-background px-3 py-2 text-[0.9rem] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Your username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-[0.82rem] font-medium text-muted-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-sm border border-input bg-background px-3 py-2 text-[0.9rem] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Your password"
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
              {submitting ? "Logging in…" : "Log in"}
            </button>
          </form>
          <p className="mt-5 text-center text-[0.82rem] text-muted-foreground">
            New here?{" "}
            <a
              href="/signup"
              className="font-medium text-link hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </>
  );
}