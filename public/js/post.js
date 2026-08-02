initNav();

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

function initials(username) {
  return (username || "?").slice(0, 2).toUpperCase();
}

function formatTimestamp(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

async function vote(targetType, targetId, value) {
  try {
    await apiPost("/api/votes", { targetType, targetId, value });
    await loadPost();
    await loadComments();
  } catch (err) {
    window.location.href = "/login.html";
  }
}

async function loadPost() {
  const data = await apiGet("/api/posts/" + encodeURIComponent(postId));
  const p = data.post;
  renderBreadcrumb([{ label: "Home", href: "/index.html" }, { label: p.title }]);
  document.getElementById("post-detail").innerHTML =
    '<div class="post-card">' +
    '<div class="vote-controls">' +
    '<button type="button" id="upvote">&#9650;</button>' +
    '<span class="score">' + p.score + "</span>" +
    '<button type="button" id="downvote">&#9660;</button>' +
    "</div>" +
    "<div>" +
    "<h2>" + escapeHtml(p.title) + "</h2>" +
    '<div class="meta">u/' + escapeHtml(p.username) + " &middot; " + escapeHtml(p.school) + " &middot; " + escapeHtml(p.status) + " &middot; " + formatTimestamp(p.created_at) + "</div>" +
    "<p>" + escapeHtml(p.body) + "</p>" +
    "</div>" +
    "</div>";
  document.getElementById("upvote").addEventListener("click", () => vote("post", postId, 1));
  document.getElementById("downvote").addEventListener("click", () => vote("post", postId, -1));
}

function buildCommentTree(comments) {
  const byId = {};
  comments.forEach((c) => (byId[c.id] = Object.assign({}, c, { children: [] })));
  const roots = [];
  comments.forEach((c) => {
    if (c.parent_comment_id && byId[c.parent_comment_id]) {
      byId[c.parent_comment_id].children.push(byId[c.id]);
    } else {
      roots.push(byId[c.id]);
    }
  });
  return roots;
}

function renderComment(c) {
  const childrenHtml = c.children.map(renderComment).join("");
  return (
    '<div class="comment-row">' +
    '<div class="comment-rail">' +
    '<div class="avatar-placeholder">' + escapeHtml(initials(c.username)) + "</div>" +
    '<div class="comment-username">u/' + escapeHtml(c.username) + "</div>" +
    "<div>" + escapeHtml(c.school) + "</div>" +
    "<div>" + escapeHtml(c.status) + "</div>" +
    "</div>" +
    '<div class="comment-body">' +
    "<p>" + escapeHtml(c.body) + "</p>" +
    '<div class="meta">' + formatTimestamp(c.created_at) + "</div>" +
    '<div style="margin-left: 1.25rem;">' + childrenHtml + "</div>" +
    "</div>" +
    "</div>"
  );
}

async function loadComments() {
  const data = await apiGet("/api/posts/" + encodeURIComponent(postId) + "/comments");
  const tree = buildCommentTree(data.comments);
  document.getElementById("comment-list").innerHTML = tree.map(renderComment).join("");
}

document.getElementById("comment-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("comment-error");
  errorEl.hidden = true;
  const body = document.getElementById("comment-body").value;
  try {
    await apiPost("/api/posts/" + encodeURIComponent(postId) + "/comments", { body });
    document.getElementById("comment-body").value = "";
    await loadComments();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});

loadPost();
loadComments();
