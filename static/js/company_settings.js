console.log("Company Settings JS LOADED");
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();

  const desc = document.getElementById("company_desc");
  const counter = document.querySelector(".char-counter");

  const password = document.getElementById("new_password");
  const confirmPassword = document.getElementById("confirm_password");
  const strengthBar = document.getElementById("strengthBar");
  const strengthLabel = document.getElementById("strengthLabel");

  const securityForm = confirmPassword ? confirmPassword.closest("form") : null;

  if (desc && counter) {
    counter.textContent = `${desc.value.length} / 500`;
    desc.addEventListener("input", () => {
      counter.textContent = `${desc.value.length} / 500`;
    });
  }

  function getStrength(pwd) {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }

  if (password && strengthBar && strengthLabel) {
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

  document.querySelectorAll(".toggle-password").forEach((icon) => {
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

  if (securityForm) {
    securityForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (password.value !== confirmPassword.value) {
        showToast("Passwords do not match", "error");
        return;
      }
      if (password.value.length < 6) {
        showToast("Password must be at least 6 characters", "error");
        return;
      }
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex((u) => u.username === currentUser.username);
      if (userIndex !== -1) {
        users[userIndex].password = password.value;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));
      }
      showToast("Password updated successfully", "success");
      securityForm.reset();
      if (strengthBar) strengthBar.style.width = "0%";
      if (strengthLabel) strengthLabel.textContent = "";
    });
  }

  const forms = document.querySelectorAll("main form");
  forms.forEach((form) => {
    if (form === securityForm) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      if (form.querySelector("#username") || form.querySelector("#email")) {
        if (currentUser) {
          const users = JSON.parse(localStorage.getItem("users")) || [];
          const userIndex = users.findIndex((u) => u.username === currentUser.username);
          if (userIndex !== -1) {
            if (data.username) users[userIndex].username = data.username;
            if (data.email) users[userIndex].email = data.email;
            localStorage.setItem("users", JSON.stringify(users));
            localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));
          }
        }
        showToast("Account settings saved", "success");
        form.reset();
      }

      if (form.querySelector("#company_name") || form.querySelector("#company_desc")) {
        if (currentUser) {
          localStorage.setItem(
            `company_profile_${currentUser.username}`,
            JSON.stringify({
              companyName: data.company_name,
              website: data.website,
              location: data.location,
              description: data.company_desc,
            }),
          );
        }
        showToast("Company profile saved", "success");
        form.reset();
        if (desc && counter) counter.textContent = "0 / 500";
      }

      if (form.querySelector('input[name="email_notif"]')) {
        if (currentUser) {
          localStorage.setItem(
            `notification_settings_${currentUser.username}`,
            JSON.stringify(data),
          );
        }
        showToast("Notification preferences saved", "success");
      }
    });
  });
});
