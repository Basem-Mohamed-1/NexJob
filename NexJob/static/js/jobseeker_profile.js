document.addEventListener("DOMContentLoaded", function () {
  loadJobSeekerProfile();
  setupProfileForm();
  loadApplicationStats();
});

async function loadJobSeekerProfile() {
  try {
    const response = await fetch('/jobseeker/api/profile/');
    if (!response.ok) throw new Error('Failed to load profile');
    
    const data = await response.json();
    
    document.getElementById("profileName").textContent = data.fullName || data.username || "Job Seeker";
    document.getElementById("profileEmail").textContent = data.email || "";
    document.getElementById("profileAvatar").textContent = (data.fullName || data.username || "J").charAt(0).toUpperCase();
    
    document.getElementById("profileEmailInput").value = data.email || "";
    document.getElementById("fullName").value = data.fullName || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("location").value = data.location || "";
    document.getElementById("skills").value = data.skills || "";
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

function setupProfileForm() {
  document.getElementById("profileForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const formData = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("profileEmailInput").value,
      phone: document.getElementById("phone").value,
      location: document.getElementById("location").value,
      skills: document.getElementById("skills").value,
    };
    
    try {
      const response = await fetch('/jobseeker/api/profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        showToast("Profile saved!", "success");
        loadJobSeekerProfile();
      } else {
        showToast("Error saving profile", "error");
      }
    } catch (error) {
      console.error('Error:', error);
      showToast("Error saving profile", "error");
    }
  });
}

async function loadApplicationStats() {
  try {
    const response = await fetch('/jobseeker/api/applications/');
    const data = await response.json();
    const applications = data.applications || [];
    
    document.getElementById("totalApps").textContent = applications.length;
    document.getElementById("pendingApps").textContent = applications.filter(a => a.status === "PENDING").length;
    document.getElementById("interviewApps").textContent = applications.filter(a => a.status === "INTERVIEW").length;
    document.getElementById("hiredApps").textContent = applications.filter(a => a.status === "HIRED").length;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function getCSRFToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function resetProfileForm() {
  loadJobSeekerProfile();
}