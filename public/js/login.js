initNav();

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("error");
  errorEl.hidden = true;

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    await apiPost("/api/auth/login", { username, password });
    window.location.href = "/index.html";
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});
