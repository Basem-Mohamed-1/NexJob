document.addEventListener("DOMContentLoaded", function () {
  loadCompanyProfile();
  setupProfileForms();
});

function loadCompanyProfile() {
  const user = getCurrentUser();
  if (!user) return;

  document.getElementById("profileName").textContent = user.company || "Company";
  document.getElementById("profileEmail").textContent = user.email || "";
  document.getElementById("profileAvatar").textContent = (user.company || "C").charAt(0).toUpperCase();

  document.getElementById("profileUsername").value = user.username || "";
  document.getElementById("profileEmailInput").value = user.email || "";

  const profile = getCompanyProfile();
  if (profile) {
    document.getElementById("companyName").value = profile.companyName || "";
    document.getElementById("companyWebsite").value = profile.website || "";
    document.getElementById("companyLocation").value = profile.location || "";
    document.getElementById("companyDesc").value = profile.description || "";
  }
}

function setupProfileForms() {
  document.getElementById("companyForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = {
      companyName: document.getElementById("companyName").value,
      website: document.getElementById("companyWebsite").value,
      location: document.getElementById("companyLocation").value,
      description: document.getElementById("companyDesc").value,
    };
    saveCompanyProfile(formData);
    showToast("Company profile saved!", "success");
    loadCompanyProfile();
  });

  document.getElementById("accountForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = getCurrentUser();
    const userIndex = users.findIndex((u) => u.username === user.username);

    if (userIndex !== -1) {
      users[userIndex].username = document.getElementById("profileUsername").value;
      users[userIndex].email = document.getElementById("profileEmailInput").value;
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));
      showToast("Account updated!", "success");
      loadCompanyProfile();
    }
  });
}

function resetCompanyForm() {
  loadCompanyProfile();
}