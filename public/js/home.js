initNav();
renderBreadcrumb([{ label: "Home" }]);

function formatTimestamp(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderForumIndex(categories) {
  const table = document.getElementById("forum-index");
  const rows = categories
    .map(
      (c) =>
        "<tr>" +
        '<td class="category-name">' +
        '<a href="/category.html?slug=' + encodeURIComponent(c.slug) + '">' + escapeHtml(c.name) + "</a>" +
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
    table.innerHTML = "<tbody><tr><td>No posts yet. Be the first to post!</td></tr></tbody>";
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

async function loadForumIndex() {
  const data = await apiGet("/api/categories");
  renderForumIndex(data.categories);
}

async function loadFeed() {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get("sort") === "top" ? "top" : "new";
  const data = await apiGet("/api/posts?sort=" + sort);
  renderPostList(data.posts);
}

loadForumIndex();
loadFeed();
