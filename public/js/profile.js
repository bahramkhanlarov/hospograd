initNav();

const params = new URLSearchParams(window.location.search);
const username = params.get("username");

async function loadProfile() {
  const errorTarget = document.getElementById("profile-header");
  try {
    const data = await apiGet("/api/users/" + encodeURIComponent(username));
    errorTarget.innerHTML =
      "<h2>u/" + escapeHtml(data.user.username) + "</h2>" +
      '<p class="badge">' + escapeHtml(data.user.school) + " &middot; " + escapeHtml(data.user.status) +
      " &middot; " + escapeHtml(data.user.verification_state) + "</p>";

    document.getElementById("profile-posts").innerHTML = data.posts.length
      ? data.posts
          .map(
            (p) =>
              '<div class="post-card"><a href="/post.html?id=' + encodeURIComponent(p.id) + '">' +
              escapeHtml(p.title) + "</a></div>"
          )
          .join("")
      : "<p>No posts yet.</p>";

    document.getElementById("profile-comments").innerHTML = data.comments.length
      ? data.comments
          .map(
            (c) =>
              '<div class="post-card"><a href="/post.html?id=' + encodeURIComponent(c.post_id) + '">' +
              escapeHtml(c.body) + "</a></div>"
          )
          .join("")
      : "<p>No comments yet.</p>";
  } catch (err) {
    errorTarget.innerHTML = "<p>User not found.</p>";
  }
}

loadProfile();
