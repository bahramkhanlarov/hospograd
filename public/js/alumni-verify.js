initNav();

const params = new URLSearchParams(window.location.search);
const email = params.get("email");

document.getElementById("alumni-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("error");
  errorEl.hidden = true;

  const linkedinUrl = document.getElementById("linkedinUrl").value;
  const documentInput = document.getElementById("document");

  const formData = new FormData();
  formData.set("email", email);
  if (linkedinUrl) formData.set("linkedinUrl", linkedinUrl);
  if (documentInput.files.length > 0) formData.set("document", documentInput.files[0]);

  try {
    await apiPostForm("/api/auth/alumni-verification", formData);
    document.querySelector(".form-card").innerHTML =
      "<h2>Submitted</h2><p>Your alumni verification is pending admin review. You can log in once approved.</p>" +
      '<a class="btn" href="/login.html">Go to login</a>';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.hidden = false;
  }
});
