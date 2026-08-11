"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";

interface Post {
  id: string;
  title: string;
  body: string;
  image_keys: string;
  score: number;
  created_at: number;
  username: string;
  school: string;
  status: string;
}

interface Comment {
  id: string;
  post_id: string;
  parent_comment_id: string | null;
  author_id: string;
  body: string;
  score: number;
  created_at: number;
  username: string;
  school: string;
  status: string;
}

export function PostDetail({ id }: { id: string }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voteSubmitting, setVoteSubmitting] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ post: Post }>(`/api/posts/${encodeURIComponent(id)}`);
        if (!cancelled) setPost(data.post);
      } catch {
        if (!cancelled) setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  // Fetch comments separately
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ comments: Comment[] }>(`/api/posts/${encodeURIComponent(id)}/comments`);
        if (!cancelled) setComments(data.comments);
      } catch {
        if (!cancelled) setComments([]);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCommentError(null);
    if (!commentBody.trim()) return;
    setSubmitting(true);
    try {
      await apiPost(`/api/posts/${encodeURIComponent(id)}/comments`, { body: commentBody.trim() });
      setCommentBody("");
      // Re-fetch comments
      const data = await apiGet<{ comments: Comment[] }>(`/api/posts/${encodeURIComponent(id)}/comments`);
      setComments(data.comments);
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(targetType: "post" | "comment", targetId: string, value: number) {
    setVoteSubmitting(targetId);
    try {
      await apiPost("/api/votes", { targetType, targetId, value });
      // Re-fetch to show updated scores
      const pdata = await apiGet<{ post: Post }>(`/api/posts/${encodeURIComponent(id)}`);
      setPost(pdata.post);
      const cdata = await apiGet<{ comments: Comment[] }>(`/api/posts/${encodeURIComponent(id)}/comments`);
      setComments(cdata.comments);
    } catch {
      // silent — user may not be authenticated
    } finally {
      setVoteSubmitting(null);
    }
  }

  function formatTimestamp(ms: number) {
    if (!ms) return "—";
    return new Date(ms).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Build threaded comment tree
  const topLevelComments = comments.filter((c) => !c.parent_comment_id);
  const childComments = (parentId: string) => comments.filter((c) => c.parent_comment_id === parentId);

  function renderComment(comment: Comment, depth = 0) {
    const children = childComments(comment.id);
    return (
      <div key={comment.id} style={{ marginLeft: depth * 20 }}>
        <div className="rounded-sm border border-border bg-card px-4 py-3 shadow-sm">
          <div className="mb-1 text-[0.75rem] text-muted-foreground">
            <a href={`/profile/${encodeURIComponent(comment.username)}`} className="text-link hover:underline">
              {comment.username}
            </a>{" "}
            &middot; {comment.school} &middot; {formatTimestamp(comment.created_at)}
          </div>
          <p className="text-[0.85rem] leading-relaxed text-foreground">{comment.body}</p>
          <div className="mt-1 flex items-center gap-3 text-[0.75rem] text-muted-foreground">
            <button
              type="button"
              disabled={voteSubmitting === comment.id}
              onClick={() => handleVote("comment", comment.id, 1)}
              className="cursor-pointer text-link hover:underline disabled:opacity-50"
            >
              ▲
            </button>
            <span>{comment.score}</span>
            <button
              type="button"
              disabled={voteSubmitting === comment.id}
              onClick={() => handleVote("comment", comment.id, -1)}
              className="cursor-pointer text-destructive hover:underline disabled:opacity-50"
            >
              ▼
            </button>
          </div>
        </div>
        {children.map((child) => renderComment(child, depth + 1))}
      </div>
    );
  }

  if (loading) {
    return <p className="italic text-muted-foreground">Loading post…</p>;
  }

  if (!post) {
    return (
      <div className="rounded-md border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post */}
      <div className="rounded-md border border-border bg-card p-5 shadow-sm">
        <h1 className="mb-2 text-[1.4rem] font-semibold leading-tight text-foreground">
          {post.title}
        </h1>
        <div className="mb-3 text-[0.8rem] text-muted-foreground">
          <a href={`/profile/${encodeURIComponent(post.username)}`} className="text-link hover:underline">
            {post.username}
          </a>{" "}
          &middot; {post.school} &middot; {post.status} &middot;{" "}
          {formatTimestamp(post.created_at)}
        </div>
        <p className="whitespace-pre-wrap text-[0.85rem] leading-relaxed text-foreground">
          {post.body}
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-border pt-3 text-[0.8rem]">
          <button
            type="button"
            disabled={voteSubmitting === post.id}
            onClick={() => handleVote("post", post.id, 1)}
            className="cursor-pointer text-link hover:underline disabled:opacity-50"
          >
            ▲ Upvote
          </button>
          <span className="font-medium text-foreground">{post.score}</span>
          <button
            type="button"
            disabled={voteSubmitting === post.id}
            onClick={() => handleVote("post", post.id, -1)}
            className="cursor-pointer text-destructive hover:underline disabled:opacity-50"
          >
            ▼ Downvote
          </button>
        </div>
      </div>

      {/* Comment form */}
      <div className="rounded-md border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-[0.9rem] font-semibold text-foreground">Add a comment</h3>
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="What are your thoughts?"
            rows={3}
            required
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-[0.85rem] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {commentError && (
            <p className="text-[0.82rem] text-destructive">{commentError}</p>
          )}
          <button
            type="submit"
            disabled={submitting || !commentBody.trim()}
            className="rounded-sm bg-primary px-4 py-2 text-[0.85rem] font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post reply"}
          </button>
        </form>
      </div>

      {/* Comments */}
      <div>
        <h3 className="mb-3 text-[0.9rem] font-semibold text-foreground">
          Comments ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <p className="italic text-muted-foreground">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {topLevelComments.map((c) => renderComment(c))}
          </div>
        )}
      </div>
    </div>
  );
}