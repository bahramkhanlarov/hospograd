"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { apiPost } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [status, setStatus] = useState<"student" | "alumni">("student");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password.trim() || !school.trim()) {
      setError("All fields are required.");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost("/api/auth/signup", {
        username: username.trim(),
        email: email.trim(),
        password,
        school: school.trim(),
        status,
      });

      if (status === "student") {
        router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Nav />
      <Breadcrumb items={[{ label: "Sign up" }]} />
      <div className="mx-auto w-full max-w-md flex-1 px-5 py-10">
        <div className="rounded-md border border-border bg-card p-6 shadow-md">
          <h2 className="font-display mb-6 text-[1.3rem] font-medium text-foreground">
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="username"
                className="text-[0.82rem] font-semibold text-muted-foreground"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-sm border border-border bg-background px-3 py-[0.45rem] text-[0.85rem] text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-[0.82rem] font-semibold text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-sm border border-border bg-background px-3 py-[0.45rem] text-[0.85rem] text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-[0.82rem] font-semibold text-muted-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-sm border border-border bg-background px-3 py-[0.45rem] text-[0.85rem] text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* School */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="school"
                className="text-[0.82rem] font-semibold text-muted-foreground"
              >
                School
              </label>
              <input
                id="school"
                type="text"
                required
                placeholder="e.g. EHL"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="rounded-sm border border-border bg-background px-3 py-[0.45rem] text-[0.85rem] text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="status"
                className="text-[0.82rem] font-semibold text-muted-foreground"
              >
                I am a...
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "student" | "alumni")}
                className="rounded-sm border border-border bg-background px-3 py-[0.45rem] text-[0.85rem] text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option value="student">Current student</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>

            {/* Error message */}
            {error ? (
              <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-[0.82rem] text-destructive">
                {error}
              </p>
            ) : null}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-sm bg-primary px-4 py-[0.5rem] text-[0.85rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Signing up…" : "Sign up"}
            </button>
          </form>

          <p className="mt-5 text-center text-[0.82rem] text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-link hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </>
  );
}