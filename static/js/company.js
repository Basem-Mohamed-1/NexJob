let opps = [];

// loading the pages of company

document.addEventListener("DOMContentLoaded", function () {
  // Fix malformed URLs (browser cache issue)
  if (window.location.pathname.includes('my-jobs/company/')) {
    const jobId = new URLSearchParams(window.location.search).get('jobId');
    if (jobId) {
      window.location.href = `/company/applications/?jobId=${jobId}`;
      return;
    }
  }

  const currentPage = window.location.pathname;

  console.log("im in")
  if (currentPage.includes("create-job")) {
    setupCreateJobPage();
  } else if (currentPage.includes("my-jobs")) {
    console.log("im here")
    setupMyJobsPage();
  } else if (currentPage.includes("dashboard")) {
    setupDashboardPage();
  } else if (currentPage.includes("edit-job")) {
    setupEditJobPage();
  } else if (currentPage.includes("settings")) {
    setupSettingsPage();
  } else if (currentPage.includes("applications")) {
    setupApplicationsPage();
  }
});


// Toast 
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

// ==================== CREATE JOB PAGE ====================
async function setupCreateJobPage() {


  const form = document.querySelector("main form");
  if (!form) {
    console.error("Form not found");
    return;
  }

  // Pre-fill company name from current user
  // const currentUser = getCurrentUser();
  // if (currentUser && currentUser.company) {
  //   const companyInput = document.getElementById("company_name");
  //   if (companyInput) companyInput.value = currentUser.company;
  // }

  const minSalary = form.querySelector('input[name="salary_min"]');
  const maxSalary = form.querySelector('input[name="salary_max"]');

  // Salary validation
  function validateSalary() {
    const salaryError = document.getElementById("salaryError");

    let min = Number(minSalary.value);
    let max = Number(maxSalary.value);

    if (min > max) {
      if (salaryError) {
        salaryError.textContent = "Minimum salary must be ≤ maximum salary";
        salaryError.classList.add("visible");
      }
      minSalary.classList.add("error");
      maxSalary.classList.add("error");
      return false;
    }

    if (salaryError) {
      salaryError.textContent = "";
      salaryError.classList.remove("visible");
    }
    minSalary.classList.remove("error");
    maxSalary.classList.remove("error");
    return true;
  }

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    if (!validateSalary()) {
      console.log("Salary validation failed");
      return;
    }

    // Get form data
    const jobData = {
      title: document.getElementById("job_title")?.value || "",
      company: document.getElementById("company_name")?.value || "",
      status: document.getElementById("status")?.value || "OPEN",
      salaryMin: parseInt(minSalary?.value) || 0,
      salaryMax: parseInt(maxSalary?.value) || 0,
      location: document.getElementById("location")?.value || "",
      type: document.getElementById("employment_type")?.value || "FULL_TIME",
      experience: parseInt(document.getElementById("experience")?.value) || 0,
      description: document.getElementById("description")?.value || "",
      responsibilities: document.getElementById("responsibilities")?.value || "",
      requirements: document.getElementById("requirements")?.value || "",
    };

    if (!jobData.title) {
      showToast("Please enter a job title", "error");
      return;
    }
    if (!jobData.location) {
      showToast("Please enter a location", "error");
      return;
    }
    if (!jobData.description) {
      showToast("Please enter a job description", "error");
      return;
    }

    try {
      const response = await fetch("/company/api/create-job/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken()
        },
        body: JSON.stringify(jobData)
      });

      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || "Error posting job", "error");
        return;
      }

      showToast("Job posted successfully!", "success");
      setTimeout(() => {
        window.location.href = "/company/my-jobs/";
      }, 1000);
    } catch (error) {
      console.error("Error creating job:", error);
      showToast("Error posting job. Please try again.", "error");
    }
  });

  // Cancel button
  const cancelBtn = form.querySelector('input[type="reset"]');
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/company/my-jobs/";
    });
  }
}
// ==================== MY JOBS PAGE ====================
function setupMyJobsPage() {
  loadMyJobs();
  setupSearchFilter();
}



async function loadMyJobs() {

  try {
    
    const response = await fetch("/company/api/my-jobs/");
    const data = await response.json();
    
    opps = data.opportunities;

    console.log(data);
  

    const tbody = document.querySelector(".job-table tbody");
    if (!tbody) return;

    // Empty state
    if (data.count === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-postings">
            <p>No jobs posted yet.</p>
            <a href="/company/create-job/" class="btn-post-first">
              Post Your First Job
            </a>
          </td>
        </tr>
      `;
      return;
    }

    // Clear table
    tbody.innerHTML = "";

    // Render jobs
    data.opportunities.forEach(op => {
      createJobTableRow(op)
    });

  } catch (error) {
    console.error("Error loading jobs:", error);
  }
}

function createJobTableRow(job) {

    const tbody = document.querySelector(".job-table tbody");

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>
          <div class="job-title-cell">${job.title}</div>
          <span class="job-meta">${job.location}</span>
        </td>

        <td>
          <span class="status-badge status-${job.status}">
            ${job.status}
          </span>
        </td>

        <td>${formatDate(job.postedDate)}</td>

        <td>
          <span class="total-count" id="applicant-count-${job.id}">
            <i class="fa-solid fa-spinner fa-spin"></i>
          </span>
        </td>

        <td>
          <div class="action-buttons">
            <button class="action-icon" onclick="viewApplicants(${job.id})">
              <i class="fas fa-users"></i>
            </button>

            <button class="action-icon" onclick="editJob(${job.id})">
              <i class="fas fa-edit"></i>
            </button>

            <button class="action-icon" onclick="deleteJobConfirm(${job.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(row);

      fetchApplicantCount(job.id);

      return row

}

async function fetchApplicantCount(jobId) {
  try {
    const response = await fetch(`/company/api/job/${jobId}/applicant-count/`);
    const data = await response.json();
    const countEl = document.getElementById(`applicant-count-${jobId}`);
    if (countEl) {
      countEl.innerHTML = `<span>${data.count} applicant${data.count !== 1 ? 's' : ''}</span>`;
    }
  } catch (error) {
    const countEl = document.getElementById(`applicant-count-${jobId}`);
    if (countEl) {
      countEl.innerHTML = `<span>0 applicants</span>`;
    }
  }
}

function setupSearchFilter() {
  const searchInput = document.querySelector(".search-wrapper input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) =>
      filterJobs(e.target.value.toLowerCase()),
    );
  }
}

function filterJobs(searchTerm) {
 
  const filtered = opps.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm) ||
      job.location.toLowerCase().includes(searchTerm),
  );
  console.log(filtered)
  const tbody = document.querySelector(".job-table tbody");
  tbody.innerHTML = "";

  filtered.forEach((job) => tbody.appendChild(createJobTableRow(job)));


  updateResultsInfo(filtered.length);
}

function updateResultsInfo(count) {
  const resultsInfo = document.querySelector(".results-info");
  if (resultsInfo)
    resultsInfo.textContent = `Showing 1 to ${count} of ${count} results`;
}

// ==================== ACTION FUNCTIONS ====================
let viewApplicants = function (jobId) {
  window.location.href = `/company/applications/?jobId=${jobId}`;
};

let editJob = function (jobId) {
  window.location.href = `/company/edit-job/?id=${jobId}`;
};

let deleteJobConfirm = function (jobId) {
  showConfirm(
    "Delete Job",
    "Are you sure you want to delete this job? This action cannot be undone.",
    async () => {
      try {
        await fetch(`/company/api/job/${jobId}/delete/`, {
          method: 'POST',
          headers: {
            'X-CSRFToken': getCSRFToken()
          }
        });
        showToast("Job deleted successfully", "success");
        setTimeout(() => location.reload(), 1000);
      } catch (error) {
        showToast("Error deleting job", "error");
      }
    },
  );
};

// ==================== EDIT JOB PAGE ====================
async function setupEditJobPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get("id");

  if (!jobId) {
    window.location.href = "/company/my-jobs/";
    return;
  }

  let job;
  try {
    const res = await fetch(`/company/api/job/${jobId}/`);
    if (!res.ok) throw new Error("Job not found");
    job = await res.json();
  } catch (error) {
    console.error("Error loading job:", error);
    showToast("Job not found", "error");
    window.location.href = "/company/my-jobs/";
    return;
  }

  document.getElementById("job_title").value = job.title || "";
  document.getElementById("company_name").value = job.companyName || "";
  document.getElementById("status").value = job.status || "OPEN";
  document.querySelector('input[name="salary_min"]').value = job.salary_min || "";
  document.querySelector('input[name="salary_max"]').value = job.salary_max || "";
  document.getElementById("location").value = job.location || "";
  document.getElementById("employment_type").value = job.employment_type || "FULL_TIME";
  document.getElementById("experience").value = job.experience || "";
  document.getElementById("description").value = job.jobDescription || "";
  document.getElementById("responsibilities").value = job.responsibilities || "";
  document.getElementById("requirements").value = job.requirements || "";

  const form = document.querySelector("main form");
  const minSalary = form.querySelector('input[name="salary_min"]');
  const maxSalary = form.querySelector('input[name="salary_max"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const min = Number(minSalary.value);
    const max = Number(maxSalary.value);
    if (min > max) {
      document.getElementById("salaryError").textContent = "Minimum must be <= maximum";
      document.getElementById("salaryError").classList.add("visible");
      return;
    }

    const updatedJob = {
      title: document.getElementById("job_title").value,
      company: document.getElementById("company_name").value,
      status: document.getElementById("status").value,
      salaryMin: min,
      salaryMax: max,
      location: document.getElementById("location").value,
      type: document.getElementById("employment_type").value,
      experience: document.getElementById("experience").value,
      description: document.getElementById("description").value,
      responsibilities: document.getElementById("responsibilities").value,
      requirements: document.getElementById("requirements").value,
    };

    try {
      const res = await fetch(`/company/api/job/${jobId}/edit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify(updatedJob),
      });

      if (!res.ok) throw new Error("Update failed");

      showToast("Job updated successfully!", "success");
      setTimeout(() => (window.location.href = "/company/my-jobs/"), 1500);
    } catch (error) {
      console.error("Error updating job:", error);
      showToast("Error updating job", "error");
    }
  });
}

// ==================== DASHBOARD PAGE ====================
async function setupDashboardPage() {
  try {
    const response = await fetch("/company/api/my-jobs/");
    const data = await response.json();
    const jobs = data.opportunities || [];

    jobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    const latestJobs = jobs.slice(0, 3);
    const cardsContainer = document.getElementById("cards");
    if (!cardsContainer) return;

    cardsContainer.querySelectorAll(".job-card").forEach((card) => card.remove());

    for (const job of latestJobs) {
      let applicantCount = 0;
      try {
        const countRes = await fetch(`/company/api/job/${job.id}/applicant-count/`);
        const countData = await countRes.json();
        applicantCount = countData.count;
      } catch (e) {}

      const card = document.createElement("div");
      card.className = "job-card";
      const minK = Math.round(job.salary_min / 1000);
      const maxK = Math.round(job.salary_max / 1000);

      card.innerHTML = `
        <div class="job-content">
          <div>
            <i class="company-icons fa-solid fa-building"></i>
            <div class="left-content">
              <h3>${job.title}</h3>
              <div class="job-details">
                <div class="company"><i class="fa-solid fa-building"></i><h6>${job.companyName}</h6></div>
                <div class="company"><i class="fa-solid fa-location-dot"></i><h6>${job.location}</h6></div>
                <div class="company"><i class="fa-solid fa-clock"></i><h6>${job.employment_type}</h6></div>
              </div>
            </div>
          </div>
          <hr class="horizontal-line" />
          <div class="job-applying">
            <div class="job-salary">
              <h4>$${minK}k - $${maxK}k</h4>
              <p>${applicantCount} applicant${applicantCount !== 1 ? 's' : ''}</p>
            </div>
            <h3>Apply Now</h3>
          </div>
        </div>
      `;
      const position = document.querySelector(".browse-more");
      cardsContainer.insertBefore(card, position);
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
}

// ==================== SETTINGS PAGE ====================
async function setupSettingsPage() {
  // Load settings from Django API
  await loadSettingsFromAPI();
  
  // Setup character counter for company description
  const desc = document.getElementById("company_desc");
  const counter = document.querySelector(".char-counter");
  if (desc && counter) {
    counter.textContent = `${desc.value.length} / 500`;
    desc.addEventListener("input", () => {
      counter.textContent = `${desc.value.length} / 500`;
    });
  }
  
  // Setup password strength indicator
  const password = document.getElementById("new_password");
  const confirmPassword = document.getElementById("confirm_password");
  const strengthBar = document.getElementById("strengthBar");
  const strengthLabel = document.getElementById("strengthLabel");
  
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
  
  // Setup toggle password visibility
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

  // Setup form submissions
  document.querySelectorAll("main form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // Account form (username, email)
      if (form.querySelector("#username") || form.querySelector("#email")) {
        await saveAccountSettings(data);
      }
      
      // Company Profile form
      if (form.querySelector("#company_name") || form.querySelector("#company_desc")) {
        await saveCompanySettings({
          company_name: data.company_name,
          website: data.website,
          location: data.location,
          description: data.company_desc
        });
      }
      
      // Notifications form (can be expanded later)
      if (form.querySelector('input[name="email_notif"]')) {
        showToast("Notification preferences saved", "success");
      }
    });
  });
  
  // Setup security form (password change)
  const securityForm = document.querySelector('input[name="new_password"]')?.closest("form");
  if (securityForm) {
    securityForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await changePassword(securityForm);
    });
  }
}

async function loadSettingsFromAPI() {
  try {
    const response = await fetch('/company/api/settings/');
    
    if (!response.ok) {
      console.error("Failed to load settings");
      return;
    }
    
    const data = await response.json();
    console.log("Settings loaded:", data);
    
    // Account form
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    if (usernameInput && data.username) usernameInput.value = data.username;
    if (emailInput && data.email) emailInput.value = data.email;
    
    // Company profile form
    const companyNameInput = document.getElementById("company_name");
    const websiteInput = document.getElementById("website");
    const locationInput = document.getElementById("location");
    const descInput = document.getElementById("company_desc");
    
    if (companyNameInput && data.company_name) companyNameInput.value = data.company_name;
    if (websiteInput && data.website) websiteInput.value = data.website;
    if (locationInput && data.location) locationInput.value = data.location;
    if (descInput && data.description) {
      descInput.value = data.description;
      const counter = document.querySelector(".char-counter");
      if (counter) counter.textContent = `${descInput.value.length} / 500`;
    }
    
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

async function saveAccountSettings(data) {
  try {
    const response = await fetch('/company/api/settings/account/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.success) {
      showToast("Account settings saved", "success");
    } else {
      showToast(result.error || "Failed to save account settings", "error");
    }
  } catch (error) {
    console.error("Error saving account:", error);
    showToast("Error saving account settings", "error");
  }
}

async function saveCompanySettings(data) {
  try {
    const response = await fetch('/company/api/settings/company/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.success) {
      showToast("Company profile saved", "success");
      // Update character counter
      const descInput = document.getElementById("company_desc");
      const counter = document.querySelector(".char-counter");
      if (descInput && counter) counter.textContent = `${descInput.value.length} / 500`;
    } else {
      showToast(result.error || "Failed to save company profile", "error");
    }
  } catch (error) {
    console.error("Error saving company:", error);
    showToast("Error saving company profile", "error");
  }
}

async function changePassword(form) {
  const newPassword = form.querySelector('input[name="new_password"]')?.value;
  const confirmPassword = form.querySelector('input[name="confirm_password"]')?.value;
  const strengthBar = form.querySelector(".strength-bar");
  const strengthLabel = form.querySelector(".strength-label");
  
  if (!newPassword || !confirmPassword) {
    showToast("Please fill in both password fields", "error");
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showToast("Passwords do not match", "error");
    return;
  }
  
  if (newPassword.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return;
  }
  
  try {
    const response = await fetch("/api/change-password/", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify({
        new_password: newPassword,
        confirm_password: confirmPassword
      })
    });

    const result = await response.json();
    
    if (result.success) {
      showToast("Password updated successfully", "success");
      form.reset();
      if (strengthBar) strengthBar.style.width = "0%";
      if (strengthLabel) strengthLabel.textContent = "";
    } else {
      showToast(result.error || "Failed to update password", "error");
    }
  } catch (error) {
    console.error("Error updating password:", error);
    showToast("Error updating password", "error");
  }
}

// ==================== HELPERS ====================
function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysAgo(dateString) {
  if (!dateString) return "recently";
  const today = new Date().toISOString().split("T")[0];
  if (dateString === today) return "today";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateString === yesterday.toISOString().split("T")[0]) return "yesterday";

  const diffDays = Math.floor(
    (new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24),
  );
  return `${diffDays} days ago`;
}

// ==================== APPLICATIONS PAGE ====================
function setupApplicationsPage() {
  loadJobSelector();
  loadApplications();
}

async function loadJobSelector() {
  try {
    const response = await fetch("/company/api/my-jobs/");
    const data = await response.json();
    const myJobs = data.opportunities || [];
    
    const select = document.getElementById("jobSelect");
    if (!select) return;

    select.innerHTML = '<option value="">Select a job</option>';

    myJobs.forEach((job) => {
      const option = document.createElement("option");
      option.value = job.id;
      option.textContent = `${job.title} (${job.location})`;
      select.appendChild(option);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get("jobId");
    if (jobId) {
      select.value = jobId;
      loadApplicationsForJob(jobId);
    }

    select.addEventListener("change", () => {
      const selectedJobId = select.value;
      if (selectedJobId) {
        loadApplicationsForJob(selectedJobId);
      } else {
        loadApplications();
      }
    });
  } catch (error) {
    console.error("Error loading job selector:", error);
  }
}

async function loadApplications() {
  const container = document.querySelector(".applications-container");
  if (!container) return;

  try {
    const response = await fetch('/company/api/applications/');
    const data = await response.json();
    
    if (data.error) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <h3>Error</h3>
          <p>${data.error}</p>
        </div>
      `;
      return;
    }
    
    const applications = data.applications || [];

    if (applications.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-users"></i>
          <h3>No Applications Yet</h3>
          <p>Post a job to start receiving applications.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    for (const app of applications) {
      const card = await createApplicationCard(app, '');
      container.appendChild(card);
    }
  } catch (error) {
    console.error("Error loading applications:", error);
  }
}

async function loadApplicationsForJob(jobId) {
  const container = document.querySelector(".applications-container");
  if (!container) return;

  try {
    const response = await fetch(`/company/api/applications/?opportunity_id=${jobId}`);
    const data = await response.json();
    
    if (data.error) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <h3>Error</h3>
          <p>${data.error}</p>
        </div>
      `;
      return;
    }
    
    const applications = data.applications || [];

    if (applications.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-user-slash"></i>
          <h3>No Applicants</h3>
          <p>No one has applied to this job yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    for (const app of applications) {
      const card = await createApplicationCard(app, '');
      container.appendChild(card);
    }
  } catch (error) {
    console.error("Error loading applications for job:", error);
  }
}

async function createApplicationCard(application, companyName) {
  const card = document.createElement("div");
  card.className = "application-card";

  let jobTitle = `Job #${application.opportunity_id}`;
  try {
    const jobRes = await fetch(`/company/api/job/${application.opportunity_id}/`);
    if (jobRes.ok) {
      const job = await jobRes.json();
      jobTitle = job.title;
    }
  } catch (e) {}

  const statusColors = {
    PENDING: "#f59e0b",
    REVIEWING: "#3b82f6",
    INTERVIEW: "#8b5cf6",
    HIRED: "#22c55e",
    REJECTED: "#ef4444",
  };

  const statusLabels = {
    PENDING: "Pending",
    REVIEWING: "Reviewing",
    INTERVIEW: "Interview",
    HIRED: "Hired",
    REJECTED: "Rejected",
  };

  const statusColor = statusColors[application.status] || statusColors.PENDING;
  const statusLabel = statusLabels[application.status] || "Pending";

  card.innerHTML = `
    <div class="app-header">
      <div class="app-info">
        <h3>${application.full_name || "Applicant"}</h3>
        <p><i class="fa-solid fa-envelope"></i> ${application.email || "No email"}</p>
        <p><i class="fa-solid fa-phone"></i> ${application.phone || "No phone"}</p>
      </div>
      <div class="app-job">${jobTitle}</div>
    </div>
    <div class="app-details">
      <div class="detail-item">
        <span class="label">Experience:</span>
        <span>${application.experience || "Not specified"}</span>
      </div>
      <div class="detail-item">
        <span class="label">Expected Salary:</span>
        <span>${application.expected_salary || "Not specified"}</span>
      </div>
      <div class="detail-item">
        <span class="label">Start Date:</span>
        <span>${application.start_date || "Flexible"}</span>
      </div>
      <div class="detail-item">
        <span class="label">Applied:</span>
        <span>${application.applied_at}</span>
      </div>
      ${application.resume ? `
      <div class="detail-item">
        <span class="label">Resume:</span>
        <a href="${application.resume}" target="_blank" class="resume-link">
          <i class="fa-solid fa-file-pdf"></i> Download CV
        </a>
      </div>
      ` : ''}
    </div>
    ${application.cover_letter ? `<div class="app-cover-letter"><p>${application.cover_letter}</p></div>` : ""}
    <div class="app-footer">
      <div class="app-status-badge" style="background-color: ${statusColor}">
        ${statusLabel}
      </div>
      <div class="app-actions">
        <select class="status-select" onchange="updateStatus(${application.id}, this.value)">
          <option value="PENDING" ${application.status === "PENDING" ? "selected" : ""}>Pending</option>
          <option value="REVIEWING" ${application.status === "REVIEWING" ? "selected" : ""}>Reviewing</option>
          <option value="INTERVIEW" ${application.status === "INTERVIEW" ? "selected" : ""}>Interview</option>
          <option value="HIRED" ${application.status === "HIRED" ? "selected" : ""}>Hired</option>
          <option value="REJECTED" ${application.status === "REJECTED" ? "selected" : ""}>Rejected</option>
        </select>
      </div>
    </div>
  `;

  return card;
}

async function updateStatus(applicationId, newStatus) {
  try {
    await fetch(`/company/api/application/${applicationId}/status/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify({ status: newStatus })
    });
    showToast(`Application status updated to ${newStatus}`, "success");
  } catch (error) {
    showToast("Failed to update status", "error");
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