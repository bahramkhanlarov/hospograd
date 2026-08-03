initNav();
renderBreadcrumb([{ label: "Home" }]);

function formatTimestamp(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const CATEGORY_ICONS = {
  accommodation: "🏠",
  "health-insurance": "🩺",
  "visa-legal": "📋",
  "jobs-internships": "💼",
  "money-taxes": "💰",
  "school-life": "🎓",
  general: "💬",
};

function categoryIcon(slug) {
  return CATEGORY_ICONS[slug] || "📌";
}

function renderForumIndex(categories) {
  const table = document.getElementById("forum-index");
  const rows = categories
    .map(
      (c) =>
        "<tr>" +
        '<td class="category-name">' +
        '<a href="/category.html?slug=' + encodeURIComponent(c.slug) + '">' + categoryIcon(c.slug) + " " + escapeHtml(c.name) + "</a>" +
        '<div class="category-description">' + escapeHtml(c.description || "") + "</div>" +
        "</td>" +
        '<td class="num-col">' + c.post_count + "</td>" +
        '<td class="num-col">' + formatTimestamp(c.last_post_at) + "</td>" +
        "</tr>"
    )
    .join("");
  table.innerHTML =
    "<thead><tr><th>Category</th><th class=\"num-col\">Threads</th><th class=\"num-col\">Latest thread</th></tr></thead>" +
    "<tbody>" + rows + "</tbody>";
}

function renderPostList(posts) {
  const table = document.getElementById("post-list");
  if (posts.length === 0) {
    table.innerHTML =
      "<thead><tr><th>Thread</th><th class=\"num-col\">Replies</th><th class=\"num-col\">Votes</th><th class=\"num-col\">Started</th></tr></thead>" +
      "<tbody><tr><td colspan=\"4\">No posts yet. Be the first to post!</td></tr></tbody>";
    return;
  }
  const rows = posts
    .map(
      (p) =>
        "<tr>" +
        '<td class="thread-title">' +
        '<a href="/post.html?id=' + encodeURIComponent(p.id) + '">' + escapeHtml(p.title) + "</a>" +
        '<div class="thread-byline">u/' + escapeHtml(p.username) + " &middot; " + escapeHtml(p.school) + " &middot; " + escapeHtml(p.status) + "</div>" +
        "</td>" +
        '<td class="num-col">' + p.comment_count + "</td>" +
        '<td class="num-col">' + p.score + "</td>" +
        '<td class="num-col">' + formatTimestamp(p.created_at) + "</td>" +
        "</tr>"
    )
    .join("");
  table.innerHTML =
    "<thead><tr><th>Thread</th><th class=\"num-col\">Replies</th><th class=\"num-col\">Votes</th><th class=\"num-col\">Started</th></tr></thead>" +
    "<tbody>" + rows + "</tbody>";
}

function updateSortToggle(sort) {
  document.getElementById("sort-new").classList.toggle("active", sort === "new");
  document.getElementById("sort-top").classList.toggle("active", sort === "top");
}

async function loadForumIndex() {
  const data = await apiGet("/api/categories");
  renderForumIndex(data.categories);
}

async function loadFeed() {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get("sort") === "top" ? "top" : "new";
  updateSortToggle(sort);
  const data = await apiGet("/api/posts?sort=" + sort);
  renderPostList(data.posts);
}

loadForumIndex();
loadFeed();
