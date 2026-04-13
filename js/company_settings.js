console.log("JS LOADED");
document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTS
  const desc = document.getElementById("company_desc");
  const counter = document.querySelector(".char-counter");

  const password = document.getElementById("new_password");
  const confirmPassword = document.getElementById("confirm_password");
  const strengthBar = document.getElementById("strengthBar");
  const strengthLabel = document.getElementById("strengthLabel");

  const securityForm = confirmPassword.closest("form");

  // TOAST
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

  // CHARACTER COUNTER
  if (desc) {
    counter.textContent = `${desc.value.length} / 500`;

    desc.addEventListener("input", () => {
      counter.textContent = `${desc.value.length} / 500`;
    });
  }
  // PASSWORD STRENGTH
  function getStrength(pwd) {
    let score = 0;

    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    return score;
  }

  if (password) {
    password.addEventListener("input", () => {
      const strength = getStrength(password.value);

      const levels = [
        { label: "Very Weak", color: "#ef4444", width: "20%" },
        { label: "Weak", color: "#f97316", width: "40%" },
        { label: "Fair", color: "#eab308", width: "60%" },
        { label: "Good", color: "#22c55e", width: "80%" },
        { label: "Strong", color: "#16a34a", width: "100%" },
      ];

      const level = levels[strength - 1] || levels[0];

      strengthBar.style.width = level.width;
      strengthBar.style.background = level.color;
      strengthLabel.textContent = level.label;
    });
  }

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", function () {
    const inputId = this.dataset.target;
    const input = document.getElementById(inputId);

    if (!input) return;

    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";

    this.classList.toggle("fa-eye", !isHidden);
    this.classList.toggle("fa-eye-slash", isHidden);
  });
});
  // SECURITY FORM VALIDATION
  if (securityForm) {
    securityForm.addEventListener("submit", (e) => {
      e.preventDefault();

      if (password.value !== confirmPassword.value) {
        showToast("Passwords do not match", "error");
        return;
      }

      const securityData = {
        password: password.value,
      };

      localStorage.setItem("securitySettings", JSON.stringify(securityData));

      showToast("Security updated successfully", "success");
      securityForm.reset();
      strengthBar.style.width = "0%";
      strengthLabel.textContent = "";
    });
  }
  // SAVE ACCOUNT + PROFILE + NOTIFICATIONS

  const forms = document.querySelectorAll("main form");

  forms.forEach((form, index) => {
    if (form === securityForm) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());

      const keys = [
        "accountInfo",
        "companyProfile",
        "securitySettings",
        "notificationSettings",
      ];

      localStorage.setItem(keys[index] || `form_${index}`, JSON.stringify(data));

      showToast("Saved successfully", "success");
      form.reset();
    });
  });
});
