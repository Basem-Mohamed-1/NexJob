console.log("Company Profile JS LOADED");

function showToast(message, type = "success") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.className = type;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast.hideTimeout);
  toast.hideTimeout = setTimeout(() => toast.classList.remove("show"), 2500);
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

document.addEventListener("DOMContentLoaded", function () {
  loadCompanyProfile();
  setupProfileForms();
});

async function loadCompanyProfile() {
  try {
    const response = await fetch('/company/api/settings/');
    
    if (!response.ok) {
      console.error("Failed to load settings");
      return;
    }
    
    const data = await response.json();
    console.log("Profile data loaded:", data);
    
    // Update header
    const companyName = data.company_name || "Company";
    document.getElementById("profileName").textContent = companyName;
    document.getElementById("profileEmail").textContent = data.email || "";
    document.getElementById("profileAvatar").textContent = companyName.charAt(0).toUpperCase();
    
    // Account form
    document.getElementById("profileUsername").value = data.username || "";
    document.getElementById("profileEmailInput").value = data.email || "";
    
    // Company form
    document.getElementById("companyName").value = data.company_name || "";
    document.getElementById("companyWebsite").value = data.website || "";
    document.getElementById("companyLocation").value = data.location || "";
    document.getElementById("companyDesc").value = data.description || "";
    
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

function setupProfileForms() {
  // Company form
  document.getElementById("companyForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const companyName = document.getElementById("companyName").value.trim();
    if (!companyName) {
      showToast("Company name is required", "error");
      return;
    }
    
    const formData = {
      company_name: companyName,
      website: document.getElementById("companyWebsite").value.trim(),
      location: document.getElementById("companyLocation").value.trim(),
      description: document.getElementById("companyDesc").value.trim(),
    };
    
    try {
      const response = await fetch('/company/api/settings/company/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        showToast("Company profile saved!", "success");
        // Update header with new company name
        document.getElementById("profileName").textContent = formData.company_name;
        document.getElementById("profileAvatar").textContent = formData.company_name.charAt(0).toUpperCase();
      } else {
        showToast(result.error || "Failed to save", "error");
      }
    } catch (error) {
      console.error("Error saving company:", error);
      showToast("Error saving company profile", "error");
    }
  });

  // Account form
  document.getElementById("accountForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const username = document.getElementById("profileUsername").value.trim();
    const email = document.getElementById("profileEmailInput").value.trim();
    
    if (!username || !email) {
      showToast("Username and email are required", "error");
      return;
    }
    
    try {
      const response = await fetch('/company/api/settings/account/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
          username: username,
          email: email
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        showToast("Account updated!", "success");
        document.getElementById("profileEmail").textContent = email;
      } else {
        showToast(result.error || "Failed to update account", "error");
      }
    } catch (error) {
      console.error("Error updating account:", error);
      showToast("Error updating account", "error");
    }
  });
}

function resetCompanyForm() {
  loadCompanyProfile();
  showToast("Form reset", "info");
}

// Fix logout - make it work properly
function logoutUser() {
  fetch('/logout/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': getCSRFToken()
    }
  }).then(() => {
    window.location.href = '/login/';
  }).catch(() => {
    window.location.href = '/login/';
  });
}