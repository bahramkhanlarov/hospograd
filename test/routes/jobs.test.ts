import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import {
  FREE_POST_LIMIT_PER_HOUR,
  buildJobPostBody,
  countRecentFreePosts,
  createPendingListing,
  getListingBySession,
  listingToJobInput,
  publishJob,
  type JobInput,
  type JobListingRow,
} from "../../src/lib/jobs";

const validJob: JobInput = {
  company: "Lakeside Palace",
  title: "Front Office Trainee",
  location: "Montreux",
  employmentType: "Internship",
  description: "6-month internship on the front desk, French and English required.",
  contactEmail: "hr@lakeside.example",
  applyUrl: "https://lakeside.example/careers",
};

async function insertSession(listingId: string, sessionId: string) {
  await env.DB.prepare(
    "UPDATE job_listings SET stripe_session_id = ? WHERE id = ?"
  )
    .bind(sessionId, listingId)
    .run();
}

async function createListingRow(job: JobInput = validJob): Promise<JobListingRow> {
  const listing = await createPendingListing(env, job);
  await insertSession(listing.id, `cs_${listing.id}`);
  return listing;
}

describe("lib/jobs", () => {
  it("buildJobPostBody includes company, role, location and contact", () => {
    const body = buildJobPostBody(validJob);
    expect(body).toContain("Lakeside Palace is hiring");
    expect(body).toContain("**Role:** Front Office Trainee");
    expect(body).toContain("**Location:** Montreux");
    expect(body).toContain("hr@lakeside.example");
    expect(body).toContain("https://lakeside.example/careers");
  });

  it("createPendingListing inserts a pending row", async () => {
    const listing = await createPendingListing(env, validJob);
    const row = await env.DB.prepare(
      "SELECT * FROM job_listings WHERE id = ?"
    )
      .bind(listing.id)
      .first();
    expect(row).not.toBeNull();
    expect(row?.status).toBe("pending");
    expect(row?.company).toBe("Lakeside Palace");
  });

  it("listingToJobInput round-trips the stored fields", async () => {
    const listing = await createPendingListing(env, validJob);
    expect(listingToJobInput(listing)).toEqual(validJob);
  });

  it("publishJob creates a featured post by the team account, idempotently", async () => {
    const listing = await createListingRow();
    const postId = await publishJob(env, validJob, { listing, featured: true });
    const post = await env.DB.prepare("SELECT * FROM posts WHERE id = ?")
      .bind(postId)
      .first<{ author_id: string; featured: number; featured_until: number; category_id: number; title: string }>();

    expect(post).not.toBeNull();
    expect(post?.author_id).toBe("hospograd-team");
    expect(post?.featured).toBe(1);
    expect(post?.featured_until).toBeGreaterThan(Date.now());
    expect(post?.title).toBe("Front Office Trainee");

    const category = await env.DB.prepare(
      "SELECT name FROM categories WHERE id = ?"
    )
      .bind(post?.category_id)
      .first<{ name: string }>();
    expect(category?.name).toContain("Jobs");

    // Listing is marked paid and linked to the post.
    const updated = await getListingBySession(env, `cs_${listing.id}`);
    expect(updated?.status).toBe("paid");
    expect(updated?.post_id).toBe(postId);

    // Idempotent: second publish with the fresh listing returns the same post.
    const fresh = (await getListingBySession(env, `cs_${listing.id}`))!;
    const again = await publishJob(env, validJob, { listing: fresh, featured: true });
    expect(again).toBe(postId);
  });

  it("publishJob with featured=false creates a non-featured post", async () => {
    const postId = await publishJob(env, validJob, { featured: false });
    const post = await env.DB.prepare("SELECT featured, featured_until FROM posts WHERE id = ?")
      .bind(postId)
      .first<{ featured: number; featured_until: number | null }>();
    expect(post?.featured).toBe(0);
    expect(post?.featured_until).toBeNull();
  });

  it("countRecentFreePosts counts only recent team posts in jobs category", async () => {
    const before = await countRecentFreePosts(env);
    await publishJob(env, validJob, { featured: false });
    const after = await countRecentFreePosts(env);
    expect(after).toBe(before + 1);
  });
});

describe("POST /api/jobs (free tier)", () => {
  it("publishes a free post immediately without Stripe", async () => {
    const res = await SELF.fetch("https://example.com/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validJob),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { postId: string; featured: boolean };
    expect(body.featured).toBe(false);
    const post = await env.DB.prepare("SELECT * FROM posts WHERE id = ?")
      .bind(body.postId)
      .first<{ featured: number }>();
    expect(post?.featured).toBe(0);
  });

  it("validates required fields and email format", async () => {
    const missing = await SELF.fetch("https://example.com/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: "X" }),
    });
    expect(missing.status).toBe(400);

    const badEmail = await SELF.fetch("https://example.com/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validJob, contactEmail: "not-an-email" }),
    });
    expect(badEmail.status).toBe(400);
  });

  it("rate-limits free posts per hour", async () => {
    // Remove posts created by earlier tests so the hourly budget is clean.
    // Delete referencing job_listings rows first to satisfy the FK.
    await env.DB.prepare(
      `DELETE FROM job_listings WHERE post_id IN (SELECT id FROM posts WHERE author_id = 'hospograd-team')`
    ).run();
    await env.DB.prepare(
      `DELETE FROM posts WHERE author_id = 'hospograd-team'`
    ).run();

    for (let i = 0; i < FREE_POST_LIMIT_PER_HOUR; i += 1) {
      const res = await SELF.fetch("https://example.com/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validJob, title: `Rate limit job ${i}` }),
      });
      expect(res.status).toBe(201);
    }
    const over = await SELF.fetch("https://example.com/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validJob),
    });
    expect(over.status).toBe(429);
  });
});

describe("POST /api/jobs (featured tier)", () => {
  it("returns 503 when Stripe is not configured", async () => {
    const res = await SELF.fetch("https://example.com/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validJob, featured: true }),
    });
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("not configured");
  });
});

describe("GET /api/jobs/status", () => {
  it("requires session_id", async () => {
    const res = await SELF.fetch("https://example.com/api/jobs/status");
    expect(res.status).toBe(400);
  });

  it("returns the published post for an already-paid listing without Stripe", async () => {
    const listing = await createListingRow();
    const postId = await publishJob(env, validJob, { listing, featured: true });

    const res = await SELF.fetch(
      `https://example.com/api/jobs/status?session_id=cs_${listing.id}`
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; postId: string };
    expect(body.status).toBe("paid");
    expect(body.postId).toBe(postId);
  });

  it("returns 404 for an unknown session", async () => {
    const res = await SELF.fetch(
      "https://example.com/api/jobs/status?session_id=cs_unknown"
    );
    expect(res.status).toBe(404);
  });
});

describe("featured ordering in category feed", () => {
  it("pins a featured job above a newer non-featured post", async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, username, email, password_hash, school, status, verification_state, created_at)
       VALUES ('feed-user', 'feed-user', 'feed@ehl.ch', 'x', 'EHL', 'student', 'verified', 0)`
    ).run();

    // Non-featured post, newer.
    const category = await env.DB.prepare(
      "SELECT id FROM categories WHERE slug = 'jobs-internships'"
    ).first<{ id: number }>();
    await env.DB.prepare(
      `INSERT INTO posts (id, author_id, category_id, title, body, image_keys, score, created_at)
       VALUES ('newer-post', 'feed-user', ?, 'Newer manual post', 'b', '[]', 0, ?)`
    )
      .bind(category!.id, Date.now() + 5000)
      .run();

    // Featured job, older.
    const listing = await createListingRow();
    const featuredId = await publishJob(env, validJob, { listing, featured: true });

    const res = await SELF.fetch(
      "https://example.com/api/categories/jobs-internships/posts?sort=new"
    );
    const body = (await res.json()) as {
      posts: { id: string; title: string; featured: number }[];
    };
    const ids = body.posts.map((p) => p.id);
    expect(ids[0]).toBe(featuredId);
    expect(ids).toContain("newer-post");
    const featuredPost = body.posts.find((p) => p.id === featuredId);
    expect(featuredPost?.featured).toBe(1);
  });
});