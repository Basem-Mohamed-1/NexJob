console.log("JS LOADED");
function showToast(message, type = "success") {
  const toast = document.createElement("div");

  toast.id = "toast";              
  toast.className = type;          
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Form validation only
document.addEventListener("DOMContentLoaded", () => {
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
});