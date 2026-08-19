"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { Nav } from "@/components/layout/nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Me {
  username: string;
  school: string;
  status: string;
  verificationState: string;
  isAdmin: boolean;
}

interface VerificationUser {
  id: string;
  username: string;
  school: string;
  status: string;
  verification_doc_key?: string;
}

interface Report {
  id: string;
  reason: string;
  post_id?: string;
  comment_id?: string;
  reported_by?: string;
  created_at?: string;
}

interface Suggestion {
  id: string;
  post_id: string;
  body: string;
  status: string;
  created_at: number;
  post_title: string;
  post_author: string;
}

interface InsuranceLead {
  id: string;
  age: number;
  canton: string;
  deductible: number;
  plan_model: string;
  start_date: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function apiDelete(path: string): Promise<void> {
  const res = await fetch(path, { method: "DELETE", credentials: "same-origin" });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const message =
      typeof data.error === "string" ? data.error : `Request failed (${res.status})`;
    throw new Error(message);
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [me, setMe] = useState<Me | null>(null);

  const [verifications, setVerifications] = useState<VerificationUser[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [editedSuggestions, setEditedSuggestions] = useState<Record<string, string>>({});
  const [leads, setLeads] = useState<InsuranceLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  const [loadingVerifications, setLoadingVerifications] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const [actingVerification, setActingVerification] = useState<string | null>(null);
  const [actingReport, setActingReport] = useState<string | null>(null);
  const [actingSuggestion, setActingSuggestion] = useState<string | null>(null);

  // ---------------
  // Auth check
  // ---------------

  useEffect(() => {
    let cancelled = false;
    apiGet<Me>("/api/auth/me")
      .then((user) => {
        if (cancelled) return;
        if (!user.isAdmin) {
          router.replace("/");
          return;
        }
        setMe(user);
        setChecking(false);
      })
      .catch(() => {
        if (!cancelled) {
          router.replace("/");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  // ---------------
  // Data fetchers
  // ---------------

  const fetchVerifications = useCallback(async () => {
    setLoadingVerifications(true);
    try {
      const data = (await apiGet<{ users: VerificationUser[] }>(
        "/api/admin/verifications",
      )) ?? { users: [] };
      setVerifications(data.users ?? []);
    } catch {
      setVerifications([]);
    } finally {
      setLoadingVerifications(false);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const data = (await apiGet<{ reports: Report[] }>(
        "/api/admin/reports",
      )) ?? { reports: [] };
      setReports(data.reports ?? []);
    } catch {
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const data = (await apiGet<{ suggestions: Suggestion[] }>(
        "/api/suggestions",
      )) ?? { suggestions: [] };
      setSuggestions(data.suggestions ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const data = (await apiGet<{ leads: InsuranceLead[] }>(
        "/api/admin/insurance/leads",
      )) ?? { leads: [] };
      setLeads(data.leads ?? []);
    } catch {
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    if (checking || !me) return;
    fetchVerifications();
    fetchReports();
    fetchSuggestions();
    fetchLeads();
  }, [checking, me, fetchVerifications, fetchReports, fetchSuggestions, fetchLeads]);

  // ---------------
  // Actions
  // ---------------

  async function handleVerification(userId: string, action: "approve" | "reject") {
    setActingVerification(userId);
    try {
      await apiPost(`/api/admin/verifications/${encodeURIComponent(userId)}/${action}`);
      await fetchVerifications();
    } catch (err) {
      console.error("verification action failed", err);
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActingVerification(null);
    }
  }

  async function handleResolveReport(reportId: string) {
    setActingReport(reportId);
    try {
      await apiPost(`/api/admin/reports/${encodeURIComponent(reportId)}/resolve`);
      await fetchReports();
    } catch (err) {
      console.error("resolve report failed", err);
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActingReport(null);
    }
  }

  async function handleDeletePost(postId: string, reportId: string) {
    setActingReport(reportId);
    try {
      await apiDelete(`/api/admin/posts/${encodeURIComponent(postId)}`);
      await fetchReports();
    } catch (err) {
      console.error("delete post failed", err);
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActingReport(null);
    }
  }

  async function handleDeleteComment(commentId: string, reportId: string) {
    setActingReport(reportId);
    try {
      await apiDelete(`/api/admin/comments/${encodeURIComponent(commentId)}`);
      await fetchReports();
    } catch (err) {
      console.error("delete comment failed", err);
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActingReport(null);
    }
  }

  async function handleLeadStatus(leadId: string, status: string) {
    setActingSuggestion(leadId);
    try {
      await apiPost(`/api/admin/insurance/leads/${encodeURIComponent(leadId)}/status`, {
        status,
      });
      await fetchLeads();
    } catch (err) {
      console.error("lead status update failed", err);
      alert(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setActingSuggestion(null);
    }
  }

  async function handleApproveSuggestion(suggestionId: string, editedBody: string) {
    setActingSuggestion(suggestionId);
    try {
      await apiPost(`/api/suggestions/${encodeURIComponent(suggestionId)}/approve`, {
        body: editedBody,
      });
      await fetchSuggestions();
      setEditedSuggestions((prev) => {
        const next = { ...prev };
        delete next[suggestionId];
        return next;
      });
    } catch (err) {
      console.error("approve suggestion failed", err);
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActingSuggestion(null);
    }
  }

  async function handleRejectSuggestion(suggestionId: string) {
    setActingSuggestion(suggestionId);
    try {
      await apiPost(`/api/suggestions/${encodeURIComponent(suggestionId)}/reject`);
      await fetchSuggestions();
    } catch (err) {
      console.error("reject suggestion failed", err);
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActingSuggestion(null);
    }
  }

  // ---------------
  // Loading gate
  // ---------------

  if (checking) {
    return (
      <>
        <Nav />
        <Breadcrumb items={[{ label: "Admin" }]} />
        <div className="mx-auto flex max-w-5xl items-center justify-center px-5 py-20">
          <p className="italic text-muted-foreground">Checking access…</p>
        </div>
      </>
    );
  }

  // ---------------
  // Render
  // ---------------

  return (
    <>
      <Nav />
      <Breadcrumb items={[{ label: "Admin" }]} />
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-5 py-6">
        {/* ─────── Verifications ─────── */}
        <section>
          <h2 className="mb-4 font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
            Pending verifications
          </h2>

          {loadingVerifications ? (
            <p className="italic text-muted-foreground">Loading…</p>
          ) : verifications.length === 0 ? (
            <p className="italic text-muted-foreground">No pending verifications.</p>
          ) : (
            <div className="space-y-3">
              {verifications.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-3"
                >
                  <div className="flex-1 text-[0.85rem] leading-relaxed">
                    <strong className="text-foreground">{u.username}</strong>
                    <span className="text-muted-foreground">
                      {" "}&middot;{" "}{u.school}{" "}&middot;{" "}{u.status}
                    </span>
                    {u.verification_doc_key ? (
                      <p className="mt-0.5 text-muted-foreground">
                        Doc key: {u.verification_doc_key}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={actingVerification === u.id}
                      onClick={() => handleVerification(u.id, "approve")}
                      className="cursor-pointer rounded-sm bg-primary px-3 py-1 text-[0.8rem] font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actingVerification === u.id ? "…" : "Approve"}
                    </button>
                    <button
                      type="button"
                      disabled={actingVerification === u.id}
                      onClick={() => handleVerification(u.id, "reject")}
                      className="cursor-pointer rounded-sm border border-border bg-transparent px-3 py-1 text-[0.8rem] font-medium text-foreground transition-colors hover:bg-card-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─────── Insurance leads ─────── */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
              Insurance leads
            </h2>
            <a
              href="/api/admin/insurance/leads/export"
              className="rounded-sm border border-border bg-card px-3 py-1 text-[0.8rem] font-medium text-foreground transition-colors hover:bg-card-hover"
            >
              Export CSV
            </a>
          </div>

          {loadingLeads ? (
            <p className="italic text-muted-foreground">Loading…</p>
          ) : leads.length === 0 ? (
            <p className="italic text-muted-foreground">
              No insurance leads yet.
            </p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-md border border-border bg-card px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.85rem] leading-relaxed">
                    <strong className="text-foreground">
                      {lead.age}yo · {lead.canton}
                    </strong>
                    <span className="text-muted-foreground">
                      Franchise {lead.deductible} · {lead.plan_model}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.68rem] font-medium text-primary">
                      {lead.status}
                    </span>
                    <span className="ml-auto text-[0.72rem] text-muted-foreground">
                      {new Date(lead.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.8rem] text-muted-foreground">
                    Start {lead.start_date} ·{" "}
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-link hover:text-primary"
                    >
                      {lead.email}
                    </a>
                    {lead.phone ? (
                      <span> · {lead.phone}</span>
                    ) : null}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    {["new", "contacted", "converted", "rejected"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={actingSuggestion === lead.id || lead.status === status}
                        onClick={() => handleLeadStatus(lead.id, status)}
                        className={`cursor-pointer rounded-sm px-2 py-0.5 text-[0.7rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          lead.status === status
                            ? "bg-primary text-white"
                            : "border border-border bg-transparent text-muted-foreground hover:bg-card-hover"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─────── AI Suggested Answers ─────── */}
        <section>
          <h2 className="mb-4 font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
            AI suggested answers
          </h2>

          {loadingSuggestions ? (
            <p className="italic text-muted-foreground">Loading…</p>
          ) : suggestions.length === 0 ? (
            <p className="italic text-muted-foreground">No pending suggestions.</p>
          ) : (
            <div className="space-y-4">
              {suggestions.map((s) => {
                const edited = editedSuggestions[s.id] ?? s.body;
                return (
                <div
                  key={s.id}
                  className="rounded-md border border-border bg-card p-4"
                >
                  <div className="mb-1 text-[0.8rem] font-medium text-link">
                    <a href={`/posts/${s.post_id}`} className="hover:underline">
                      {s.post_title}
                    </a>
                    <span className="ml-2 font-normal text-muted-foreground">
                      by {s.post_author}
                    </span>
                  </div>
                  <p className="mb-1.5 text-[0.72rem] text-muted-foreground">
                    AI-drafted. Review and edit before posting — it will be
                    published under the &ldquo;hospograd-team&rdquo; account,
                    not yours.
                  </p>
                  <textarea
                    value={edited}
                    onChange={(e) =>
                      setEditedSuggestions((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                    rows={4}
                    className="mb-3 w-full resize-y rounded-sm border border-border bg-muted/50 px-3 py-2 text-[0.85rem] leading-relaxed text-foreground outline-none transition-colors focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actingSuggestion === s.id || !edited.trim()}
                      onClick={() => handleApproveSuggestion(s.id, edited)}
                      className="cursor-pointer rounded-sm bg-primary px-3 py-1 text-[0.8rem] font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actingSuggestion === s.id ? "…" : "Post as HospoGrad Team"}
                    </button>
                    <button
                      type="button"
                      disabled={actingSuggestion === s.id}
                      onClick={() => handleRejectSuggestion(s.id)}
                      className="cursor-pointer rounded-sm border border-border bg-transparent px-3 py-1 text-[0.8rem] font-medium text-foreground transition-colors hover:bg-card-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─────── Reports ─────── */}
        <section>
          <h2 className="mb-4 font-display text-[1.3rem] font-normal tracking-[-0.01em] text-foreground">
            Reports
          </h2>

          {loadingReports ? (
            <p className="italic text-muted-foreground">Loading…</p>
          ) : reports.length === 0 ? (
            <p className="italic text-muted-foreground">No reports.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 rounded-md border border-border bg-card px-4 py-3"
                >
                  <div className="flex-1 text-[0.85rem] leading-relaxed">
                    <strong className="text-foreground">{r.reason}</strong>
                    {r.reported_by ? (
                      <span className="text-muted-foreground">
                        {" "}&middot;{" "}reported by {r.reported_by}
                      </span>
                    ) : null}
                    {r.created_at ? (
                      <span className="text-muted-foreground">
                        {" "}&middot;{" "}
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    ) : null}
                    <div className="mt-0.5 flex flex-wrap gap-1.5">
                      {r.post_id ? (
                        <span className="inline-block rounded-sm border border-border bg-muted px-2 py-0.5 text-[0.75rem] text-muted-foreground">
                          Post: {r.post_id.slice(0, 8)}…
                        </span>
                      ) : null}
                      {r.comment_id ? (
                        <span className="inline-block rounded-sm border border-border bg-muted px-2 py-0.5 text-[0.75rem] text-muted-foreground">
                          Comment: {r.comment_id.slice(0, 8)}…
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={actingReport === r.id}
                      onClick={() => handleResolveReport(r.id)}
                      className="cursor-pointer rounded-sm bg-primary px-3 py-1 text-[0.8rem] font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actingReport === r.id ? "…" : "Resolve"}
                    </button>
                    {r.post_id ? (
                      <button
                        type="button"
                        disabled={actingReport === r.id}
                        onClick={() => handleDeletePost(r.post_id!, r.id)}
                        className="cursor-pointer rounded-sm bg-destructive px-3 py-1 text-[0.8rem] font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete post
                      </button>
                    ) : null}
                    {r.comment_id ? (
                      <button
                        type="button"
                        disabled={actingReport === r.id}
                        onClick={() => handleDeleteComment(r.comment_id!, r.id)}
                        className="cursor-pointer rounded-sm bg-destructive px-3 py-1 text-[0.8rem] font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete comment
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}