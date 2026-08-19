"use client";

// Client sub-component for the /invite page. Fetches the logged-in user's
// invite profile (username = the ref, plus a count of signups attributed to
// them). Renders the same ShareCta, but pointing at the user's personal
// /invite?ref=<username> link when authed so referrals are attributed.

import { useEffect, useState } from "react";
import { ShareCta } from "@/components/share/share-cta";
import { apiGet } from "@/lib/api";

const SITE = "https://hospograd-web.bahram-khanlarov.workers.dev";

interface InviteInfo {
  username: string;
  invitees: number;
}

type InviteState =
  | { kind: "loading" }
  | { kind: "authed"; info: InviteInfo }
  | { kind: "anonymous" };

export function InviteShare() {
  const [state, setState] = useState<InviteState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiGet<InviteInfo>("/api/invite")
      .then((info) => {
        if (!cancelled) setState({ kind: "authed", info });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "anonymous" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "loading") {
    return null;
  }

  if (state.kind === "authed") {
    const personalUrl = `${SITE}/invite?ref=${encodeURIComponent(state.info.username)}`;
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
          This is <span className="font-semibold text-foreground">your</span>{" "}
          invite link — anyone who signs up through it counts as your invite.
          So far {state.info.invitees} {state.info.invitees === 1 ? "person has" : "people have"} joined
          through you.
        </p>
        <ShareCta title="Invite your classmates to HospoGrad" url={personalUrl} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[0.85rem] leading-relaxed text-muted-foreground">
        Send the site to a classmate and they can sign up straight from the
        guides. Once you&rsquo;ve logged in you&rsquo;ll get your own link so
        your invites count toward you.
      </p>
      <ShareCta title="Invite your classmates to HospoGrad" url={SITE} />
    </div>
  );
}