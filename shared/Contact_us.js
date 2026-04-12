// Toast (uses your existing #toast)

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.className = "";
  toast.classList.add(type, "show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// Form validation only
const form = document.querySelector("form");

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !subject || !message) {
    showToast("Please fill all fields", "error");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast("Invalid email format", "error");
    return;
  }

  showToast("Message sent successfully!", "success");
  form.reset();
});