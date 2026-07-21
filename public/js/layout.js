async function initNav() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;
  try {
    const me = await apiGet("/api/auth/me");
    nav.innerHTML =
      '<a href="/index.html" class="nav-brand">HospoGrad</a>' +
      '<span>' +
      '<a href="/profile.html?username=' + encodeURIComponent(me.username) + '">u/' + me.username +
      ' &middot; ' + me.school + ' &middot; ' + me.status + '</a>' +
      '<a href="/create-post.html">New post</a>' +
      (me.isAdmin ? '<a href="/admin.html">Admin</a>' : '') +
      '<a href="#" id="logout-link">Log out</a>' +
      '</span>';
    const logoutLink = document.getElementById("logout-link");
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await apiPost("/api/auth/logout");
      window.location.href = "/index.html";
    });
  } catch (e) {
    nav.innerHTML =
      '<a href="/index.html" class="nav-brand">HospoGrad</a>' +
      '<span><a href="/login.html">Log in</a><a href="/signup.html">Sign up</a></span>';
  }
}

async function renderSidebar(activeSlug) {
  const sidebar = document.getElementById("category-sidebar");
  if (!sidebar) return;
  const data = await apiGet("/api/categories");
  const items = data.categories
    .map((c) => {
      const activeClass = c.slug === activeSlug ? " class=\"active\"" : "";
      return '<li><a href="/category.html?slug=' + encodeURIComponent(c.slug) + '"' + activeClass + '>' + c.name + "</a></li>";
    })
    .join("");
  sidebar.innerHTML = "<h3>Categories</h3><ul>" + items + "</ul>";
}

async function requireAuthOrRedirect() {
  try {
    return await apiGet("/api/auth/me");
  } catch (e) {
    window.location.href = "/login.html";
    return null;
  }
}

async function requireAdminOrRedirect() {
  const me = await requireAuthOrRedirect();
  if (me && !me.isAdmin) {
    window.location.href = "/index.html";
    return null;
  }
  return me;
}
