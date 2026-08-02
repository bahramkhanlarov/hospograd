initNav();

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

function formatTimestamp(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderPostList(posts) {
  const table = document.getElementById("post-list");
  if (posts.length === 0) {
    table.innerHTML = "<tbody><tr><td>No posts in this category yet.</td></tr></tbody>";
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

async function loadCategory() {
  const catData = await apiGet("/api/categories");
  const category = catData.categories.find((c) => c.slug === slug);
  renderBreadcrumb([
    { label: "Home", href: "/index.html" },
    { label: category ? category.name : slug },
  ]);
  const feedData = await apiGet("/api/categories/" + encodeURIComponent(slug) + "/posts");
  renderPostList(feedData.posts);
}

loadCategory();
