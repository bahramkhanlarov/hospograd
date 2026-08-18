"use client";

// Share widget for guide pages. Uses the native Web Share API where it
// exists (mobile + desktop Safari/Chrome), with a copy-link fallback and
// one-tap WhatsApp / Telegram intents for the channels the community
// actually clusters in. No tracking pixels; shares are plain URLs.

import { useCallback, useEffect, useState } from "react";

interface ShareCtaProps {
  title: string;
  text?: string;
  url?: string;
}

interface Platform {
  label: string;
  href: (url: string, title: string) => string;
}

const PLATFORMS: Platform[] = [
  {
    label: "WhatsApp",
    href: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
  },
  {
    label: "Telegram",
    href: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
];

const buttonClass =
  "rounded-sm border border-border px-3 py-1.5 text-[0.78rem] font-medium text-foreground transition-colors hover:border-primary hover:text-primary";

export function ShareCta({ title, text, url }: ShareCtaProps) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  const shareUrl =
    url ??
    (typeof window !== "undefined" ? window.location.href : "https://hospograd-web.bahram-khanlarov.workers.dev");

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({ title, text, url: shareUrl });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  }, [title, text, shareUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canNativeShare ? (
        <button type="button" onClick={handleNativeShare} className={buttonClass}>
          Share
        </button>
      ) : null}
      <button type="button" onClick={handleCopy} className={buttonClass}>
        {copied ? "Copied!" : "Copy link"}
      </button>
      {PLATFORMS.map((p) => (
        <a
          key={p.label}
          href={p.href(shareUrl, title)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          {p.label}
        </a>
      ))}
    </div>
  );
}