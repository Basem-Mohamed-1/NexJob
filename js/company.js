console.log("JS LOADED");
document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname;

  if (!isCompany()) {
    if (!currentPage.includes("login") && !currentPage.includes("signup")) {
      alert("Please login as a company");
      window.location.href = "../auth/login.html";
      return;
    }
  }

  if (currentPage.includes("create_a_new_opportunity")) {
    setupCreateJobPage();
  } else if (currentPage.includes("my_job_postings")) {
    setupMyJobsPage();
  } else if (currentPage.includes("Dashboard")) {
    setupDashboardPage();
  } else if (currentPage.includes("Edit_job")) {
    setupEditJobPage();
  } else if (currentPage.includes("Company_settings")) {
    setupSettingsPage();
  }
});

// ==================== TOAST ====================
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
function setupCreateJobPage() {
  console.log("Setting up Create Job page");

  const form = document.querySelector("main form");
  if (!form) {
    console.error("Form not found");
    return;
  }

  // Pre-fill company name from current user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.company) {
    const companyInput = document.getElementById("company_name");
    if (companyInput) companyInput.value = currentUser.company;
  }

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
  form.addEventListener("submit", (e) => {
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
      status: document.getElementById("status")?.value || "open",
      salaryMin: parseInt(minSalary?.value) || 0,
      salaryMax: parseInt(maxSalary?.value) || 0,
      location: document.getElementById("location")?.value || "",
      type: document.getElementById("employment_type")?.value || "Full-Time",
      experience:
        document.getElementById("experience")?.value || "Not specified",
      description: document.getElementById("description")?.value || "",
      responsibilities:
        document.getElementById("responsibilities")?.value ||
        "See job description",
      requirements:
        document.getElementById("requirements")?.value || "See job description",
    };

    console.log("Job data:", jobData);

    // Validate required fields
    if (!jobData.title) {
      alert("Please enter a job title");
      return;
    }
    if (!jobData.location) {
      alert("Please enter a location");
      return;
    }
    if (!jobData.description) {
      alert("Please enter a job description");
      return;
    }

    // Save job
    saveJob(jobData);

    alert("Job posted successfully!");
    window.location.href = "my_job_postings.html";
  });

  // Cancel button
  const cancelBtn = form.querySelector('input[type="reset"]');
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "my_job_postings.html";
    });
  }
}
// ==================== MY JOBS PAGE ====================
function setupMyJobsPage() {
  loadMyJobs();
  setupSearchFilter();
}

function loadMyJobs() {
  const myJobs = getMyCompanyJobs();
  const tbody = document.querySelector(".job-table tbody");
  if (!tbody) return;

  if (myJobs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 40px;">
      <p>No jobs posted yet.</p>
      <a href="create_a_new_opportunity.html" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: var(--primary); color: white; text-decoration: none; border-radius: 8px;">Post Your First Job</a>
    </td></tr>`;
    updateResultsInfo(0);
    return;
  }

  tbody.innerHTML = "";
  myJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
  myJobs.forEach((job) => tbody.appendChild(createJobTableRow(job)));
  updateResultsInfo(myJobs.length);
}

function createJobTableRow(job) {
  const row = document.createElement("tr");
  const applications = getAllApplications();
  const jobApps = applications.filter((app) => app.jobId === job.id);

  const statusClass =
    job.status === "open"
      ? "status-open"
      : job.status === "closed"
        ? "status-closed"
        : "status-draft";

  row.innerHTML = `
    <td><div class="job-title-cell">${job.title}</div><span class="job-meta">${job.location} • ${job.type}</span></td>
    <td><span class="status-badge ${statusClass}">${job.status}</span></td>
    <td>${formatDate(job.postedDate)}</td>
    <td><span class="total-count">${jobApps.length} applicant${jobApps.length !== 1 ? "s" : ""}</span></td>
    <td>
      <div class="action-buttons">
        <button class="action-icon" onclick="viewApplicants('${job.id}')"><i class="fas fa-users"></i></button>
        <button class="action-icon" onclick="editJob('${job.id}')"><i class="fas fa-edit"></i></button>
        <button class="action-icon" onclick="deleteJobConfirm('${job.id}')"><i class="fas fa-trash"></i></button>
      </div>
    </td>
  `;
  return row;
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
  const myJobs = getMyCompanyJobs();
  const filtered = myJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm) ||
      job.location.toLowerCase().includes(searchTerm),
  );
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
  const job = getJobById(jobId);
  const applications = getAllApplications().filter(
    (app) => app.jobId === jobId,
  );
  let message = `Applicants for ${job.title}:\n\n`;
  if (applications.length === 0) {
    message += "No applicants yet.";
  } else {
    applications.forEach((app, i) => {
      message += `${i + 1}. ${app.fullName} (${app.email})\n   Applied: ${app.appliedDate} | Status: ${app.status}\n\n`;
    });
  }
  alert(message);
};

let editJob = function (jobId) {
  window.location.href = `Edit_job.html?id=${jobId}`;
};

let deleteJobConfirm = function (jobId) {
  if (confirm("Delete this job? This cannot be undone.")) {
    deleteJob(jobId);
    location.reload();
  }
};

// ==================== EDIT JOB PAGE ====================
function setupEditJobPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get("id");

  if (!jobId) {
    window.location.href = "my_job_postings.html";
    return;
  }

  const job = getJobById(jobId);
  if (!job) {
    window.location.href = "my_job_postings.html";
    return;
  }

  // Fill form
  document.getElementById("job_title").value = job.title || "";
  document.getElementById("company_name").value = job.company || "";
  document.getElementById("status").value = job.status || "open";
  document.querySelector('input[name="salary_min"]').value =
    job.salaryMin || "";
  document.querySelector('input[name="salary_max"]').value =
    job.salaryMax || "";
  // document.getElementById("location").value = job.location || "";
  // document.getElementById("employment_type").value = job.type || "Full-Time";
  document.getElementById("experience").value = job.experience || "";
  document.getElementById("description").value = job.description || "";
  document.getElementById("responsibilities").value =
    job.responsibilities || "";
  document.getElementById("requirements").value = job.requirements || "";

  // Setup submit
  const form = document.querySelector("main form");
  const minSalary = form.querySelector('input[name="salary_min"]');
  const maxSalary = form.querySelector('input[name="salary_max"]');

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const min = Number(minSalary.value);
    const max = Number(maxSalary.value);
    if (min > max) {
      document.getElementById("salaryError").textContent =
        "Minimum must be ≤ maximum";
      document.getElementById("salaryError").classList.add("visible");
      return;
    }

    const updatedJob = {
      title: document.getElementById("job_title").value,
      company: document.getElementById("company_name").value,
      status: document.getElementById("status").value,
      salaryMin: min,
      salaryMax: max,
      // location: document.getElementById("location").value,
      // type: document.getElementById("employment_type").value,
      experience: document.getElementById("experience").value,
      description: document.getElementById("description").value,
      responsibilities: document.getElementById("responsibilities").value,
      requirements: document.getElementById("requirements").value,
    };

    const jobs = getAllJobs();
    const index = jobs.findIndex((j) => j.id === jobId);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updatedJob };
      saveToStorage(JOBS_KEY, jobs);
      showToast("Job updated successfully!", "success");
      setTimeout(() => (window.location.href = "my_job_postings.html"), 1500);
    }
  });
}

// ==================== DASHBOARD PAGE ====================
function setupDashboardPage() {
  const myJobs = getMyCompanyJobs();
  myJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
  const latestJobs = myJobs.slice(0, 3);
  const cardsContainer = document.getElementById("cards");
  if (!cardsContainer) return;

  // Clear existing cards
  cardsContainer.querySelectorAll(".job-card").forEach((card) => card.remove());

  latestJobs.forEach((job) => {
    const card = document.createElement("div");
    card.className = "job-card";
    const minK = Math.round(job.salaryMin / 1000);
    const maxK = Math.round(job.salaryMax / 1000);

    card.innerHTML = `
      <div class="job-content">
        <div>
          <i class="company-icons fa-solid fa-building"></i>
          <div class="left-content">
            <h3>${job.title}</h3>
            <div class="job-details">
              <div class="company"><i class="fa-solid fa-building"></i><h6>${job.company}</h6></div>
              <div class="company"><i class="fa-solid fa-location-dot"></i><h6>${job.location}</h6></div>
              <div class="company"><i class="fa-solid fa-clock"></i><h6>${job.type}</h6></div>
            </div>
          </div>
        </div>
        <hr class="horizontal-line" />
        <div class="job-applying">
          <div class="job-salary">
            <h4>$${minK}k - $${maxK}k</h4>
            <p>Posted ${daysAgo(job.postedDate)}</p>
          </div>
          <h3>Apply Now</h3>
        </div>
      </div>
    `;
    const position = document.querySelector(".browse-more");
    cardsContainer.insertBefore(card, position);
  });
}

// ==================== SETTINGS PAGE ====================
function setupSettingsPage() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  document.getElementById("username").value = currentUser.username || "";
  document.getElementById("email").value = currentUser.email || "";

  document.querySelectorAll("form").forEach((form) => {
    form.onsubmit = (e) => {
      e.preventDefault();
      alert("Settings saved! (Demo mode)");
    };
  });
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
