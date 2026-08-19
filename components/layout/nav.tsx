"use client";

// React port of public/js/layout.js's initNav(). Same two-tier logic: fetch
// /api/auth/me on mount, render logged-in vs logged-out header state. JSX
// escapes text content by default, so no escapeHtml() port is needed here.

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

// One pill treatment for actual calls-to-action (log in / sign up); every
// other nav item stays plain text. Documented exception to the page's
// otherwise-uniform 8px radius, applied identically everywhere it appears.
const navLinkClass =
  "text-[0.78rem] font-medium text-muted-foreground transition-colors hover:text-foreground";
const pillClass =
  "ml-4 inline-block rounded-full px-3 py-[0.3rem] text-[0.78rem] font-semibold transition-colors";

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
  const pathname = usePathname();

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
    window.location.href = "/";
  }

  const navLinks = [
    { href: "/education", label: "Education" },
    { href: "/careers", label: "Careers" },
    { href: "/medical", label: "Medical" },
    { href: "/insurance", label: "Insurance" },
    { href: "/finance", label: "Finance" },
    { href: "/tools", label: "Tools" },
  ];

  return (
    <nav
      className={cn(
        "flex flex-wrap items-center justify-between gap-y-2 px-5 py-[0.55rem] text-[0.82rem]",
        "border-b border-border bg-nav-bg shadow-[0_1px_4px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <a
          href="/"
          className="font-display text-[1.5rem] font-medium tracking-[-0.01em] text-foreground"
        >
          HospoGrad
        </a>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            className={cn(
              navLinkClass,
              pathname === link.href && "text-foreground",
            )}
          >
            {link.label}
          </a>
        ))}
      </div>
      {state.kind === "authed" ? (
        <span className="flex items-center">
          <a
            href={`/profile/${encodeURIComponent(state.me.username)}`}
            className="flex items-center gap-1.5 text-[0.78rem] font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            u/{state.me.username} &middot; {state.me.school}
            <span className="rounded-full border border-border px-1.5 py-px text-[0.62rem] font-medium uppercase tracking-wide text-muted-foreground">
              {state.me.status}
            </span>
          </a>
          <a href="/create-post" className={cn(navLinkClass, "ml-4")}>
            New post
          </a>
          {state.me.isAdmin ? (
            <a href="/admin" className={cn(navLinkClass, "ml-4")}>
              Admin
            </a>
          ) : null}
          <a href="#" onClick={handleLogout} className={cn(navLinkClass, "ml-4")}>
            Log out
          </a>
        </span>
      ) : state.kind === "anonymous" ? (
        <span className="flex items-center">
          <a href="/login" className={cn(pillClass, "text-foreground/80 hover:text-foreground")}>
            Log in
          </a>
          <a
            href="/signup"
            className={cn(pillClass, "bg-primary text-primary-foreground hover:bg-primary-hover")}
          >
            Sign up
          </a>
        </span>
      ) : (
        // Skeleton matching the anonymous-state shape, so the header doesn't
        // pop from blank to content once /api/auth/me resolves.
        <span className="flex items-center gap-2" aria-hidden="true">
          <span className="h-6 w-14 animate-pulse rounded-full bg-muted" />
          <span className="h-6 w-20 animate-pulse rounded-full bg-muted" />
        </span>
      )}
    </nav>
  );
}
