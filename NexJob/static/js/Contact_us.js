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

// submit form data to backend
document.addEventListener("DOMContentLoaded", () => {
  emailjs.init("ZpwXnIswvTFYwx_7N");

  const submitBtn = document.querySelector(".submit-btn");

  submitBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const form = document.querySelector("form");
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

    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    const formData = {
      name: name,
      email: email,
      subject: subject,
      message: message,
    };
    try {
      // Send with EmailJS
      const response = await emailjs.send(
        "service_x1wl48k",
        "template_5u06cv5",
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
      );
      if (response.status === 200) {
        showToast("Message sent successfully", "success");
        form.reset();
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      showToast("Failed to send message", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
});
