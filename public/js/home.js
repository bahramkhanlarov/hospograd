initNav();
renderSidebar(null);

function renderPostList(posts) {
  const list = document.getElementById("post-list");
  if (posts.length === 0) {
    list.innerHTML = "<p>No posts yet. Be the first to post!</p>";
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

async function loadFeed() {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get("sort") === "top" ? "top" : "new";
  const data = await apiGet("/api/posts?sort=" + sort);
  renderPostList(data.posts);
}

loadFeed();
