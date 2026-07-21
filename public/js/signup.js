initNav();

document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("error");
  errorEl.hidden = true;

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const school = document.getElementById("school").value;
  const status = document.getElementById("status").value;

  try {
    await apiPost("/api/auth/signup", { username, email, password, school, status });
    if (status === "student") {
      window.location.href = "/verify-otp.html?email=" + encodeURIComponent(email);
    } else {
      window.location.href = "/alumni-verify.html?email=" + encodeURIComponent(email);
    }
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});
