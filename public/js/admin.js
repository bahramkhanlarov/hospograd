initNav();

async function act(userId, action) {
  await apiPost("/api/admin/verifications/" + encodeURIComponent(userId) + "/" + action);
  await loadQueue();
}

async function loadQueue() {
  const data = await apiGet("/api/admin/verifications");
  const list = document.getElementById("verification-list");
  if (data.users.length === 0) {
    list.innerHTML = "<p>No pending verifications.</p>";
    return;
  }
  list.innerHTML = data.users
    .map(
      (u) =>
        '<div class="post-card">' +
        "<div>" +
        "<strong>" + escapeHtml(u.username) + "</strong> &middot; " + escapeHtml(u.school) + " &middot; " + escapeHtml(u.status) +
        (u.verification_doc_key ? '<p class="meta">Doc key: ' + escapeHtml(u.verification_doc_key) + "</p>" : "") +
        "</div>" +
        '<div style="margin-left: auto;">' +
        '<button type="button" class="btn" data-action="approve" data-id="' + escapeHtml(u.id) + '">Approve</button> ' +
        '<button type="button" class="btn btn-secondary" data-action="reject" data-id="' + escapeHtml(u.id) + '">Reject</button>' +
        "</div>" +
        "</div>"
    )
    .join("");

  list.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => act(btn.getAttribute("data-id"), btn.getAttribute("data-action")));
  });
}

async function init() {
  const me = await requireAdminOrRedirect();
  if (!me) return;
  await loadQueue();
}

init();
