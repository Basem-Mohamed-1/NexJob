let cachedJobs = [];

document.addEventListener("DOMContentLoaded", function () {
  initSmoothScroll();

  const currentPage = window.location.pathname;

  if (currentPage.includes("find-jobs")) {
    setupFindJobPage();
  } else if (currentPage.includes("job-details")) {
    setupJobDetailsPage();
  } else if (currentPage.includes("apply")) {
    setupApplyJobPage();
  } else if (currentPage.includes("my-applications")) {
    setupMyApplicationsPage();
  } else if (currentPage.includes("profile")) {
    setupProfilePage();
  }
});

// ==================== FIND JOB PAGE ====================
function setupFindJobPage() {
  loadAllJobs();
  setupJobSearch();
  setupJobFilters();
}

async function loadAllJobs() {
  const jobListings = document.getElementById("jobs-container");
  if (!jobListings) return;

  try {
    const response = await fetch('/jobseeker/api/jobs/');
    const data = await response.json();
    cachedJobs = data.jobs;

    if (cachedJobs.length === 0) {
      jobListings.innerHTML = '<p>No jobs available at the moment.</p>';
      return;
    }

    jobListings.innerHTML = '';
    cachedJobs.forEach((job) => {
      const jobCard = createJobCard(job);
      jobListings.appendChild(jobCard);
    });
  } catch (error) {
    console.error('Error loading jobs:', error);
    jobListings.innerHTML = "<p>Error loading jobs. Please try again.</p>";
  }
}

function createJobCard(job) {
  const card = document.createElement("div");
  card.className = "job-card";

  const companyInitial = job.companyName ? job.companyName.charAt(0).toUpperCase() : "C";

  card.innerHTML = `
    <div class="job-header">
      <div class="job-icon job-icon-primary">${companyInitial}</div>
      <div class="job-title-section">
        <h3>${job.title}</h3>
        <p class="company">
          <i class="fa-solid fa-building"></i> ${job.companyName} - ${job.location}
        </p>
      </div>
    </div>
    <div class="job-tags">
      <span class="job-tag"><i class="fa-solid fa-clock"></i> ${job.employment_type}</span>
      <span class="job-tag"><i class="fa-solid fa-dollar-sign"></i> $${job.salary_min} - $${job.salary_max}</span>
      <span class="job-tag"><i class="fa-regular fa-calendar"></i> ${job.postedDate}</span>
    </div>
    <div class="h-line"></div>
    <div class="show-job">
      <a href="/jobseeker/job-details/${job.id}/" class="view-details">
        View Details <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  `;

  return card;
}

function setupJobSearch() {
  const searchForm = document.querySelector(".search-box form");
  const searchTitleInput = document.getElementById("search-title");
  const searchExperienceInput = document.getElementById("search-experience");

  if (searchForm) {
    searchForm.onsubmit = function (e) {
      e.preventDefault();

      const searchTitle = searchTitleInput
        ? searchTitleInput.value.toLowerCase().trim()
        : "";
      const searchExperience = searchExperienceInput
        ? searchExperienceInput.value.trim()
        : "";

      filterJobsBySearch(searchTitle, searchExperience);
    };
  }
}

function filterJobsBySearch(searchTitle, searchExperience) {
  let filtered = [...cachedJobs];

  if (searchTitle) {
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(searchTitle) ||
        job.companyName.toLowerCase().includes(searchTitle) ||
        job.location.toLowerCase().includes(searchTitle),
    );
  }

  const jobListings = document.getElementById("jobs-container");
  if (!jobListings) return;

  if (filtered.length === 0) {
    jobListings.innerHTML = '<p>No jobs found matching your search.</p>';
  } else {
    jobListings.innerHTML = '';
    filtered.forEach((job) => {
      const jobCard = createJobCard(job);
      jobListings.appendChild(jobCard);
    });
  }
}

function setupJobFilters() {
  // Setup filter checkboxes
  const filterCheckboxes = document.querySelectorAll(".filter-checkbox input");
  filterCheckboxes.forEach((cb) => {
    cb.addEventListener("change", applyFilters);
  });

  // Setup radio buttons
  const filterRadios = document.querySelectorAll(".filter-radio input");
  filterRadios.forEach((radio) => {
    radio.addEventListener("change", applyFilters);
  });

  // Setup salary filter
  const salaryInputs = document.querySelectorAll(".salary-input-group input");
  if (salaryInputs) {
    salaryInputs.forEach((input) => {
      input.addEventListener("change", applyFilters);
    });
  }
}

function applyFilters() {
  let filteredJobs = [...cachedJobs];

  const jobTypeChecks = document.querySelectorAll(".filter-checkbox input");
  const selectedTypes = [];
  jobTypeChecks.forEach((cb) => {
    if (cb.checked) {
      selectedTypes.push(cb.parentElement.textContent.trim());
    }
  });

  if (selectedTypes.length > 0) {
    filteredJobs = filteredJobs.filter((job) => {
      return selectedTypes.some((type) =>
        job.employment_type.toLowerCase().includes(type.toLowerCase()),
      );
    });
  }

  const salaryInputs = document.querySelectorAll(".salary-input-group input");
  const minSalary = salaryInputs[0]?.value;
  const maxSalary = salaryInputs[1]?.value;

  if (minSalary || maxSalary) {
    filteredJobs = filteredJobs.filter((job) => {
      if (minSalary && job.salary_max < parseInt(minSalary)) return false;
      if (maxSalary && job.salary_min > parseInt(maxSalary)) return false;
      return true;
    });
  }

  const jobListings = document.getElementById("jobs-container");
  if (!jobListings) return;

  if (filteredJobs.length === 0) {
    jobListings.innerHTML = "<p>No jobs match your filters</p>";
  } else {
    jobListings.innerHTML = '';
    filteredJobs.forEach((job) => {
      const jobCard = createJobCard(job);
      jobListings.appendChild(jobCard);
    });
  }
}

// ==================== JOB DETAILS PAGE ====================

function setupJobDetailsPage() {
  const pathParts = window.location.pathname.split('/').filter(p => p);
  const jobId = pathParts[pathParts.length - 1];

  if (!jobId) {
    showToast("No job selected", "error");
    window.location.href = "/jobseeker/find-jobs/";
    return;
  }

  loadJobDetails(jobId);
}

async function loadJobDetails(jobId) {
  try {
    const response = await fetch(`/jobseeker/api/job/${jobId}/`);
    if (!response.ok) throw new Error('Job not found');
    
    const job = await response.json();
    populateJobDetails(job);
  } catch (error) {
    showToast("Job not found", "error");
    console.error('Error loading job details:', error);
    window.location.href = "/jobseeker/find-jobs/";
  }
}

function populateJobDetails(job) {
  const titleEl = document.querySelector(".job-title");
  if (titleEl) titleEl.textContent = job.title;

  const metaEls = document.querySelectorAll(".job-meta span");
  if (metaEls.length >= 4) {
    metaEls[0].innerHTML = `<i class="fa-solid fa-building"></i> ${job.companyName}`;
    metaEls[1].innerHTML = `<i class="fa-solid fa-location-dot"></i> ${job.location}`;
    metaEls[2].innerHTML = `<i class="fa-solid fa-dollar-sign"></i> $${job.salary_min} - $${job.salary_max}`;
    metaEls[3].innerHTML = `<i class="fa-solid fa-clock"></i> ${job.employment_type}`;
  }

  const descEl = document.querySelector(".job-description p");
  if (descEl) descEl.textContent = job.jobDescription || "No description available.";

  const respEl = document.querySelector(".job-description");
  if (respEl && job.responsibilities) {
    const respHtml = job.responsibilities.split('\n').filter(r => r.trim()).map(r => `<li>${r}</li>`).join('');
    const existingUl = respEl.querySelector('ul');
    if (existingUl) {
      existingUl.innerHTML = respHtml;
    }
  }

  const applyBtn = document.querySelector(".apply-btn");
  if (applyBtn) {
    applyBtn.href = `/jobseeker/apply/${job.id}/`;
  }
}

// ==================== APPLY JOB PAGE ====================
function setupApplyJobPage() {
  const pathParts = window.location.pathname.split('/').filter(p => p);
  const jobId = pathParts[pathParts.length - 1];

  if (!jobId) {
    showToast("No job selected", "error");
    window.location.href = "/jobseeker/find-jobs/";
    return;
  }

  window.currentJobId = jobId;
  setupApplicationForm();
}

function setupApplicationForm() {
  const form = document.querySelector(".application-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      job_id: window.currentJobId,
      full_name: document.getElementById("fullname")?.value,
      email: document.getElementById("email")?.value,
      phone: document.getElementById("phone")?.value,
      cover_letter: document.getElementById("coverletter")?.value,
      experience: document.getElementById("experience")?.value || 0,
      expected_salary: document.getElementById("salary")?.value,
      start_date: document.getElementById("startdate")?.value || null,
    };

    try {
      const response = await fetch('/jobseeker/api/apply/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCSRFToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        showToast("Application submitted successfully!", "success");
        setTimeout(() => {
          window.location.href = "/jobseeker/my-applications/";
        }, 1500);
      } else {
        showToast(result.error || "Error submitting application", "error");
      }
    } catch (error) {
      console.error('Error:', error);
      showToast("Error submitting application. Please try again.", "error");
    }
  });
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

// ==================== MY APPLICATIONS PAGE ====================
function setupMyApplicationsPage() {
  loadMyApplications();
}

async function loadMyApplications() {
  const container = document.querySelector(".Applied_Jobs_Cards");
  if (!container) return;

  try {
    const response = await fetch('/jobseeker/api/applications/');
    if (!response.ok) throw new Error('Failed to load applications');
    
    const data = await response.json();
    const applications = data.applications;

    const stats = {
      applied: applications.length,
      interview: applications.filter((app) => app.status === "INTERVIEW").length,
      pending: applications.filter((app) => app.status === "PENDING" || app.status === "REVIEWING").length,
      hired: applications.filter((app) => app.status === "HIRED").length,
    };

    const statApplied = document.getElementById("stat-applied");
    const statInterview = document.getElementById("stat-interview");
    const statPending = document.getElementById("stat-pending");
    const statHired = document.getElementById("stat-hired");
    if (statApplied) statApplied.textContent = stats.applied;
    if (statInterview) statInterview.textContent = stats.interview;
    if (statPending) statPending.textContent = stats.pending;
    if (statHired) statHired.textContent = stats.hired;

    if (applications.length === 0) {
      container.innerHTML = `
        <div class="no-applications-empty">
          <i class="fa-solid fa-file-alt"></i>
          <h3>No Applications Yet</h3>
          <p>Start applying to jobs to track your applications here.</p>
          <a href="/jobseeker/find-jobs/" class="btn-primary">Browse Jobs</a>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    for (const app of applications) {
      const card = createApplicationCard(app);
      container.appendChild(card);
    }
  } catch (error) {
    console.error('Error loading applications:', error);
    container.innerHTML = '<p>Error loading applications.</p>';
  }
}

function createApplicationCard(application) {
  const card = document.createElement("div");
  card.className = "Applied_Jobs_Card-1";

  const statusColors = {
    PENDING: "#f39c12",
    REVIEWING: "#3498db",
    INTERVIEW: "#9b59b6",
    REJECTED: "#e74c3c",
    HIRED: "#27ae60",
  };

  const statusColor = statusColors[application.status] || "#95a5a6";
  const statusDisplay = application.status_display || application.status;

  const job = application.job;
  let jobTitle, jobCompany, jobLocation, viewLink, jobType;

  if (job) {
    jobTitle = job.title;
    jobCompany = job.companyName;
    jobLocation = job.location;
    jobType = job.employment_type;
    viewLink = `/jobseeker/job-details/${job.id}/`;
  } else {
    jobTitle = "Job No Longer Available";
    jobCompany = "Company";
    jobLocation = "";
    jobType = "";
    viewLink = "#";
  }

  card.innerHTML = `
    <div class="Applied_Jobs_Card_Role">
      <h3>${jobTitle}</h3>
      <p>${jobCompany}${jobLocation ? ' - ' + jobLocation : ''}</p>
    </div>
    <div class="Applied_Jobs_Card_Date">
      <p class="applied-time">${application.applied_at}</p>
    </div>
    <div class="Applied_Jobs_Card_Status">
      <p>${jobType || ''}</p>
      <p style="color: ${statusColor}; font-weight: bold;">${statusDisplay}</p>
    </div>
    <div class="Applied_Jobs_Card_Action">
      <a href="${viewLink}" class="${viewLink === '#' ? 'disabled-link' : ''}">${viewLink === '#' ? 'Job Removed' : 'View Job →'}</a>
    </div>
  `;

  return card;
}

async function updateApplicationStats() {
  try {
    const response = await fetch('/jobseeker/api/applications/');
    const data = await response.json();
    const applications = data.applications;

    const stats = {
      applied: applications.length,
      interview: applications.filter((app) => app.status === "INTERVIEW").length,
      pending: applications.filter((app) => app.status === "PENDING" || app.status === "REVIEWING").length,
      hired: applications.filter((app) => app.status === "HIRED").length,
    };

    const statCards = document.querySelectorAll(".Statistics > div p");
    if (statCards.length >= 4) {
      statCards[0].textContent = stats.applied;
      statCards[1].textContent = stats.interview;
      statCards[2].textContent = stats.pending;
      statCards[3].textContent = stats.hired;
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// ==================== HELPER FUNCTIONS ====================
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function daysAgo(dateString) {
  const today = new Date().toISOString().split("T")[0]; // "2026-04-12"

  if (dateString === today) {
    return "today";
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (dateString === yesterdayStr) {
    return "yesterday";
  }

  const posted = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - posted) / (1000 * 60 * 60 * 24));

  return `${diffDays} days ago`;
}

// smooth

function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetSection = document.getElementById("main");
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}