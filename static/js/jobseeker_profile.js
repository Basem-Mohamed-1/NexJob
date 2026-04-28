document.addEventListener("DOMContentLoaded", function () {
  loadJobSeekerProfile();
  setupProfileForm();
  loadApplicationStats();
});

function loadJobSeekerProfile() {
  const user = getCurrentUser();
  if (!user) return;

  document.getElementById("profileName").textContent = user.username || "Job Seeker";
  document.getElementById("profileEmail").textContent = user.email || "";
  document.getElementById("profileAvatar").textContent = (user.username || "J").charAt(0).toUpperCase();

  document.getElementById("profileEmailInput").value = user.email || "";

  const profile = getJobSeekerProfile();
  if (profile) {
    document.getElementById("fullName").value = profile.fullName || "";
    document.getElementById("phone").value = profile.phone || "";
    document.getElementById("location").value = profile.location || "";
    document.getElementById("skills").value = profile.skills || "";
  }
}

function getJobSeekerProfile() {
  const user = getCurrentUser();
  if (!user) return null;
  const data = localStorage.getItem(`jobseeker_profile_${user.username}`);
  return data ? JSON.parse(data) : null;
}

function saveJobSeekerProfile(profileData) {
  const user = getCurrentUser();
  if (!user) return;
  localStorage.setItem(`jobseeker_profile_${user.username}`, JSON.stringify(profileData));
}

function setupProfileForm() {
  document.getElementById("profileForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const profileData = {
      fullName: document.getElementById("fullName").value,
      phone: document.getElementById("phone").value,
      location: document.getElementById("location").value,
      skills: document.getElementById("skills").value,
    };
    saveJobSeekerProfile(profileData);
    showToast("Profile saved!", "success");
  });
}

function loadApplicationStats() {
  const applications = getMyApplications();
  document.getElementById("totalApps").textContent = applications.length;
  document.getElementById("pendingApps").textContent = applications.filter(a => a.status === "pending").length;
  document.getElementById("interviewApps").textContent = applications.filter(a => a.status === "interview").length;
  document.getElementById("hiredApps").textContent = applications.filter(a => a.status === "hired").length;
}

function resetProfileForm() {
  loadJobSeekerProfile();
}