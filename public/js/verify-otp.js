initNav();

const params = new URLSearchParams(window.location.search);
const email = params.get("email");

document.getElementById("verify-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("error");
  errorEl.hidden = true;
  const code = document.getElementById("code").value;

  try {
    await apiPost("/api/auth/verify-otp", { email, code });
    window.location.href = "/login.html";
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});
