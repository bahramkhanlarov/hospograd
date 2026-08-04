"use client";

// React port of public/js/layout.js's initNav(). Same two-tier logic: fetch
// /api/auth/me on mount, render logged-in vs logged-out header state. JSX
// escapes text content by default, so no escapeHtml() port is needed here.

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Me {
  username: string;
  school: string;
  status: string;
  verificationState: string;
  isAdmin: boolean;
}

type NavState =
  | { kind: "loading" }
  | { kind: "authed"; me: Me }
  | { kind: "anonymous" };

export function Nav({ className }: { className?: string }) {
  const [state, setState] = useState<NavState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiGet<Me>("/api/auth/me")
      .then((me) => {
        if (!cancelled) setState({ kind: "authed", me });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "anonymous" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    await apiPost("/api/auth/logout");
    window.location.href = "/index.html";
  }

  return (
    <nav
      className={cn(
        "flex items-center justify-between px-5 py-[0.55rem] text-[0.82rem] shadow-[0_2px_10px_-4px_rgba(10,16,26,0.35)]",
        "bg-gradient-to-b from-nav-bg to-nav-bg-deep text-white",
        className,
      )}
    >
      <a
        href="/index.html"
        className="font-display text-[1.4rem] font-normal tracking-[-0.01em] text-white opacity-100"
      >
        HospoGrad
      </a>
      {state.kind === "authed" ? (
        <span className="flex items-center">
          <a
            href={`/profile.html?username=${encodeURIComponent(state.me.username)}`}
            className="ml-4 font-medium text-white opacity-90 transition-opacity hover:opacity-100 hover:underline"
          >
            u/{state.me.username} &middot; {state.me.school} &middot; {state.me.status}
          </a>
          <a
            href="/create-post.html"
            className="ml-4 font-medium text-white opacity-90 transition-opacity hover:opacity-100 hover:underline"
          >
            New post
          </a>
          {state.me.isAdmin ? (
            <a
              href="/admin.html"
              className="ml-4 font-medium text-white opacity-90 transition-opacity hover:opacity-100 hover:underline"
            >
              Admin
            </a>
          ) : null}
          <a
            href="#"
            onClick={handleLogout}
            className="ml-4 font-medium text-white opacity-90 transition-opacity hover:opacity-100 hover:underline"
          >
            Log out
          </a>
        </span>
      ) : state.kind === "anonymous" ? (
        <span className="flex items-center">
          <a
            href="/login.html"
            className="ml-4 font-medium text-white opacity-90 transition-opacity hover:opacity-100 hover:underline"
          >
            Log in
          </a>
          <a
            href="/signup.html"
            className="ml-4 font-medium text-white opacity-90 transition-opacity hover:opacity-100 hover:underline"
          >
            Sign up
          </a>
        </span>
      ) : (
        <span />
      )}
    </nav>
  );
}
