initNav();

async function init() {
  await requireAuthOrRedirect();
  const data = await apiGet("/api/categories");
  const select = document.getElementById("category");
  select.innerHTML = data.categories
    .map((c) => '<option value="' + escapeHtml(c.id) + '">' + escapeHtml(c.name) + "</option>")
    .join("");
}

document.getElementById("create-post-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("error");
  errorEl.hidden = true;

  const categoryId = parseInt(document.getElementById("category").value, 10);
  const title = document.getElementById("title").value;
  const body = document.getElementById("body").value;

  try {
    const result = await apiPost("/api/posts", { categoryId, title, body });
    window.location.href = "/post.html?id=" + encodeURIComponent(result.post.id);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});

init();
