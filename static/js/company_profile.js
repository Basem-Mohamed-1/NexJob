document.addEventListener("DOMContentLoaded", function () {
  loadCompanyProfile();
});

async function loadCompanyProfile() {
  try {
    const response = await fetch('/company/api/settings/');
    const data = await response.json();

    if (data.error) {
      console.error('Error loading profile:', data.error);
      return;
    }

    // Update header
    document.getElementById("profileName").textContent = data.company_name || "Company";
    document.getElementById("profileEmail").textContent = data.email || "";
    document.getElementById("profileAvatar").textContent = (data.company_name || "C").charAt(0).toUpperCase();

    // Update company information
    document.getElementById("companyName").textContent = data.company_name || "-";
    document.getElementById("companyWebsite").textContent = data.website || "-";
    document.getElementById("companyLocation").textContent = data.location || "-";
    document.getElementById("companyDesc").textContent = data.description || "-";

    // Update account information
    document.getElementById("profileUsername").textContent = data.username || "-";
    document.getElementById("profileEmailInput").textContent = data.email || "-";

  } catch (error) {
    console.error('Error loading profile:', error);
  }
}