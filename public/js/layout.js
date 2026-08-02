async function initNav() {
  const nav = document.getElementById("site-nav");
  if (!nav) return;
  try {
    const me = await apiGet("/api/auth/me");
    nav.innerHTML =
      '<a href="/index.html" class="nav-brand">HospoGrad</a>' +
      '<span>' +
      '<a href="/profile.html?username=' + encodeURIComponent(me.username) + '">u/' + escapeHtml(me.username) +
      ' &middot; ' + escapeHtml(me.school) + ' &middot; ' + escapeHtml(me.status) + '</a>' +
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

function renderBreadcrumb(items) {
  const strip = document.getElementById("breadcrumb-strip");
  if (!strip) return;
  const trail = items
    .map((item, i) => {
      const isLast = i === items.length - 1;
      if (isLast || !item.href) {
        return '<span class="current">' + escapeHtml(item.label) + "</span>";
      }
      return '<a href="' + escapeAttr(item.href) + '">' + escapeHtml(item.label) + "</a>";
    })
    .join(" <span>&rsaquo;</span> ");
  strip.innerHTML =
    '<div class="breadcrumb">' + trail + "</div>" +
    '<input class="search-input" type="text" placeholder="Search HospoGrad" disabled />';
}

async function renderSidebar(activeSlug) {
  const sidebar = document.getElementById("category-sidebar");
  if (!sidebar) return;
  const data = await apiGet("/api/categories");
  const items = data.categories
    .map((c) => {
      const activeClass = c.slug === activeSlug ? " class=\"active\"" : "";
      return '<li><a href="/category.html?slug=' + encodeURIComponent(c.slug) + '"' + activeClass + '>' + escapeHtml(c.name) + "</a></li>";
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
