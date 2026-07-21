initNav();

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

renderSidebar(slug);

function renderPostList(posts) {
  const list = document.getElementById("post-list");
  if (posts.length === 0) {
    list.innerHTML = "<p>No posts in this category yet.</p>";
    return;
  }
  list.innerHTML = posts
    .map(
      (p) =>
        '<div class="post-card">' +
        '<div class="vote-controls"><span class="score">' + p.score + "</span></div>" +
        "<div>" +
        '<h3><a href="/post.html?id=' + encodeURIComponent(p.id) + '">' + escapeHtml(p.title) + "</a></h3>" +
        '<div class="meta">' +
        '<span class="badge">u/' + escapeHtml(p.username) + " &middot; " + escapeHtml(p.school) + " &middot; " + escapeHtml(p.status) + "</span>" +
        "</div>" +
        "</div>" +
        "</div>"
    )
    .join("");
}

async function loadCategory() {
  const catData = await apiGet("/api/categories");
  const category = catData.categories.find((c) => c.slug === slug);
  if (category) {
    document.getElementById("category-name").textContent = category.name;
    document.getElementById("category-description").textContent = category.description;
  }
  const feedData = await apiGet("/api/categories/" + encodeURIComponent(slug) + "/posts");
  renderPostList(feedData.posts);
}

loadCategory();
