initNav();

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
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
  document.getElementById("post-detail").innerHTML =
    '<div class="post-card">' +
    '<div class="vote-controls">' +
    '<button type="button" id="upvote">&#9650;</button>' +
    '<span class="score">' + p.score + "</span>" +
    '<button type="button" id="downvote">&#9660;</button>' +
    "</div>" +
    "<div>" +
    "<h2>" + escapeHtml(p.title) + "</h2>" +
    "<p>" + escapeHtml(p.body) + "</p>" +
    '<div class="meta"><span class="badge">u/' + escapeHtml(p.username) + " &middot; " + escapeHtml(p.school) + " &middot; " + escapeHtml(p.status) + "</span></div>" +
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
    '<div class="post-card" style="margin-left: 0;">' +
    "<div><p>" + escapeHtml(c.body) + "</p>" +
    '<div class="meta"><span class="badge">u/' + escapeHtml(c.username) + " &middot; " + escapeHtml(c.school) + "</span></div>" +
    '<div style="margin-left: 1.5rem;">' + childrenHtml + "</div>" +
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
