import type { Bindings } from "../index";
import { newId } from "./id";

interface PostContext {
  title: string;
  body: string;
  categoryName: string;
}

const SCHOOL_KNOWLEDGE = `Our community includes these hospitality management schools:
- Glion Institute of Higher Education: Ranked top 5 globally. Known for luxury brand management, Swiss heritage, campuses in Switzerland and London.
- Les Roches: Innovative hospitality school focused on entrepreneurship. Campuses in Crans-Montana, Switzerland and Marbella, Spain. Students from 100+ countries.
- EHL Hospitality Business School: World's first hotel school (founded 1893). Consistently ranked #1 in hospitality by QS. Campuses in Lausanne, Singapore, and Chur.
- SHMS (Swiss Hotel Management School): Part of Swiss Education Group. Located in a former palace in Caux and Leysin. Focus on events management.
- César Ritz Colleges Switzerland: Named after the legendary hotelier. Ranked 5th globally in QS. Focus on entrepreneurship and sustainable leadership.
- HIM Business School (Montreux): Formerly Hotel Institute Montreux. Blends Swiss hospitality with American business degrees. Majors: hospitality, finance, marketing, management.
- Cornell Nolan School of Hotel Administration: World's first hotel management degree (founded 1922 at Cornell University). Ivy League. Part of SC Johnson College of Business.

Swiss education facts: Teacher-student ratio averages 1:3. Boarding school fees range 50,000-130,000 CHF per year. Swiss Matura and IB programs are both offered.`;

export async function generateSuggestedAnswer(
  env: Bindings,
  post: PostContext,
): Promise<string | null> {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a helpful assistant on HospoGrad, a community forum for Swiss hospitality students and alumni. 
Answer the following forum post in a helpful, concise, and friendly tone (2-4 sentences). 
Be specific and practical. Use the knowledge below to provide accurate information about schools and Swiss education.
If you don't know the answer, suggest where the user might find help.

Knowledge base:
${SCHOOL_KNOWLEDGE}

Category: ${post.categoryName}
Title: ${post.title}
Post: ${post.body}

Write a helpful reply:`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://hospograd.app",
        "X-Title": "HospoGrad",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash:floor",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      console.warn("AI suggestion generation failed", await res.text());
      return null;
    }

    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err) {
    console.warn("AI suggestion error", err);
    return null;
  }
}

export async function generateSuggestionForPost(
  env: Bindings,
  postId: string,
): Promise<void> {
  const post = await env.DB.prepare(
    `SELECT p.title, p.body, c.name as category_name
     FROM posts p
     JOIN categories c ON c.id = p.category_id
     WHERE p.id = ?`
  )
    .bind(postId)
    .first<{ title: string; body: string; category_name: string }>();

  if (!post) return;

  // Check if a suggestion already exists
  const existing = await env.DB.prepare(
    "SELECT id FROM suggested_answers WHERE post_id = ? AND status = 'pending'"
  )
    .bind(postId)
    .first();

  if (existing) return; // Already has a pending suggestion

  const answer = await generateSuggestedAnswer(env, {
    title: post.title,
    body: post.body,
    categoryName: post.category_name,
  });

  if (!answer) return;

  const id = newId();
  await env.DB.prepare(
    "INSERT INTO suggested_answers (id, post_id, body, status, created_at) VALUES (?, ?, ?, 'pending', ?)"
  )
    .bind(id, postId, answer, Date.now())
    .run();
}