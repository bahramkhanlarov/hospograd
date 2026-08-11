"use client";

// Client sub-component for the post page. Fetches /api/posts/:id and renders
// the post detail (title, body, author, score, timestamp, category), a comment
// form (POST /api/posts/:id/comments), and a threaded comment list with vote
// buttons. Ported from public/js/post.js.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Post {
  id: number;
  title: string;
  body: string;
  username: string;
  school: string;
  status: string;
  score: number;
  created_at: number | null;
  category_slug: string;
  category_name: string;
}

interface Comment {
  id: number;
  body: string;
  username: string;
  school: string;
  status: string;
  score: number;
  created_at: number | null;
  parent_comment_id: number | null;
}

interface CommentNode extends Comment {
  children: CommentNode[];
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatTimestamp(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Build a threaded tree from a flat comment list (ported from post.js). */
function buildCommentTree(comments: Comment[]): CommentNode[] {
  const byId = new Map<number, CommentNode>();
  for (const c of comments) {
    byId.set(c.id, { ...c, children: [] });
  }
  const roots: CommentNode[] = [];
  for (const c of comments) {
    const node = byId.get(c.id)!;
    if (c.parent_comment_id != null && byId.has(c.parent_comment_id)) {
      byId.get(c.parent_comment_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/* -------------------------------------------------------------------------- */
/*  Post Detail                                                               */
/* -------------------------------------------------------------------------- */

export function PostDetail({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [postError, setPostError] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsError, setCommentsError] = useState(false);

  /* ---------- fetch post ---------- */

  useEffect(() => {
    let cancelled = false;
    setPostError(false);
    apiGet<{ post: Post }>(`/api/posts/${encodeURIComponent(id)}`)
      .then((data) => {
        if (!cancelled) setPost(data.post);
      })
      .catch(() => {
        if (!cancelled) setPostError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ---------- fetch comments ---------- */

  const loadComments = useCallback(() => {
    apiGet<{ comments: Comment[] }>(
      `/api/posts/${encodeURIComponent(id)}/comments`,
    )
      .then((data) => {
        setComments(data.comments);
        setCommentsError(false);
      })
      .catch(() => {
        setCommentsError(true);
      });
  }, [id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  /* ---------- vote ---------- */

  async function handleVote(
    targetType: "post" | "comment",
    targetId: number | string,
    value: number,
  ) {
    try {
      await apiPost("/api/votes", { targetType, targetId, value });
      if (targetType === "post") {
        const data = await apiGet<{ post: Post }>(
          `/api/posts/${encodeURIComponent(id)}`,
        );
        setPost(data.post);
      } else {
        loadComments();
      }
    } catch {
      window.location.href = "/login.html";
    }
  }

  /* ---------- submit comment ---------- */

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCommentError(null);
    const trimmed = commentText.trim();
    if (!trimmed) return;

    try {
      await apiPost(`/api/posts/${encodeURIComponent(id)}/comments`, {
        body: trimmed,
      });
      setCommentText("");
      loadComments();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to post comment.";
      setCommentError(message);
    }
  }

  /* ---------- render ---------- */

  if (postError) {
    return (
      <p className="py-12 text-center italic text-muted-foreground">
        Couldn&rsquo;t load post.
      </p>
    );
  }

  if (!post) {
    return (
      <p className="py-12 text-center italic text-muted-foreground">
        Loading…
      </p>
    );
  }

  const commentTree = buildCommentTree(comments);

  return (
    <div>
      {/* ── Post card ── */}
      <div className="mb-6 rounded-md border border-border bg-card shadow-sm">
        <div className="flex gap-4 p-4">
          {/* Vote column */}
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => handleVote("post", post.id, 1)}
              className="text-lg leading-none text-muted-foreground transition-colors hover:text-primary"
              aria-label="Upvote"
            >
              ▲
            </button>
            <span className="min-w-[2ch] text-center text-[0.82rem] font-semibold tabular-nums text-foreground">
              {post.score}
            </span>
            <button
              type="button"
              onClick={() => handleVote("post", post.id, -1)}
              className="text-lg leading-none text-muted-foreground transition-colors hover:text-destructive"
              aria-label="Downvote"
            >
              ▼
            </button>
          </div>

          {/* Content column */}
          <div className="min-w-0 flex-1">
            <h2 className="mb-1 text-[1.1rem] font-semibold text-foreground">
              {post.title}
            </h2>
            <div className="mb-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[0.8rem] text-muted-foreground">
              <Link
                href={`/profile/${encodeURIComponent(post.username)}`}
                className="font-medium text-link hover:underline"
              >
                u/{post.username}
              </Link>
              <span>&middot; {post.school}</span>
              <span>&middot; {post.status}</span>
              <span>&middot; {formatTimestamp(post.created_at)}</span>
              <span>&middot;</span>
              <Link
                href={`/category/${encodeURIComponent(post.category_slug)}`}
                className="text-link hover:underline"
              >
                {post.category_name}
              </Link>
            </div>
            <p className="whitespace-pre-wrap text-[0.88rem] leading-relaxed text-foreground">
              {post.body}
            </p>
          </div>
        </div>
      </div>

      {/* ── Comment form ── */}
      <h3 className="mb-2 text-[0.95rem] font-semibold text-foreground">
        Comments
      </h3>
      <form
        onSubmit={handleCommentSubmit}
        className="mb-5 rounded-md border border-border bg-card p-4 shadow-sm"
      >
        <div className="mb-2">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment"
            required
            rows={3}
            className="w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary"
          />
        </div>
        {commentError && (
          <p className="mb-2 text-[0.82rem] text-destructive">
            {commentError}
          </p>
        )}
        <button
          type="submit"
          className="inline-block rounded-sm bg-primary px-[0.9rem] py-[0.4rem] text-[0.82rem] font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Post reply
        </button>
      </form>

      {/* ── Comment list ── */}
      {commentsError ? (
        <p className="text-center italic text-muted-foreground">
          Couldn&rsquo;t load comments.
        </p>
      ) : commentTree.length === 0 ? (
        <p className="text-center text-[0.85rem] italic text-muted-foreground">
          No comments yet.
        </p>
      ) : (
        <div className="space-y-1">
          {commentTree.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              parentId={id}
              onVote={(value) => handleVote("comment", c.id, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Recursive Comment Item                                                    */
/* -------------------------------------------------------------------------- */

function CommentItem({
  comment,
  parentId,
  onVote,
}: {
  comment: CommentNode;
  parentId: string;
  onVote: (value: number) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-card shadow-sm">
      <div className="flex gap-3 p-3">
        {/* Vote controls */}
        <div className="flex shrink-0 flex-col items-center gap-0.5">
          <button
            type="button"
            onClick={() => onVote(1)}
            className="text-xs leading-none text-muted-foreground transition-colors hover:text-primary"
            aria-label="Upvote"
          >
            ▲
          </button>
          <span className="min-w-[2ch] text-center text-[0.75rem] font-semibold tabular-nums text-foreground">
            {comment.score}
          </span>
          <button
            type="button"
            onClick={() => onVote(-1)}
            className="text-xs leading-none text-muted-foreground transition-colors hover:text-destructive"
            aria-label="Downvote"
          >
            ▼
          </button>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[0.78rem] text-muted-foreground">
            <Link
              href={`/profile/${encodeURIComponent(comment.username)}`}
              className="font-medium text-link hover:underline"
            >
              u/{comment.username}
            </Link>
            <span>&middot; {comment.school}</span>
            <span>&middot; {comment.status}</span>
            <span>&middot; {formatTimestamp(comment.created_at)}</span>
          </div>
          <p className="whitespace-pre-wrap text-[0.85rem] leading-relaxed text-foreground">
            {comment.body}
          </p>

          {/* Nested children — threaded replies */}
          {comment.children.length > 0 && (
            <div className="ml-4 mt-2 space-y-1 border-l-2 border-border pl-3">
              {comment.children.map((child) => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  parentId={parentId}
                  onVote={(value) => onVote(value)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}