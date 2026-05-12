document.addEventListener("DOMContentLoaded", function () {
  initSmoothScroll();

  const currentPage = window.location.pathname;

  if (!isJobSeeker()) {
    // Only redirect if not on login/signup pages
    if (
      !currentPage.includes("login") &&
      !currentPage.includes("signup") &&
      !currentPage.includes("index")
    ) {
      showToast("Please login as a job seeker", "error");
      window.location.href = "../auth/login.html";
      return;
    }
  }

  if (currentPage.includes("findJob")) {
    setupFindJobPage();
  } else if (currentPage.includes("JobDetails")) {
    setupJobDetailsPage();
  } else if (currentPage.includes("apply-job")) {
    setupApplyJobPage();
  } else if (currentPage.includes("myapplications")) {
    setupMyApplicationsPage();
  }
});

// ==================== FIND JOB PAGE ====================
function setupFindJobPage() {
  loadAllJobs();
  setupJobSearch();
  setupJobFilters();
}

function loadAllJobs() {
  const allJobs = getAllJobs();
  const openJobs = allJobs.filter((job) => job.status === "open");

  const jobListings = document.querySelector(".job-listings");
  if (!jobListings) return;

  const title = jobListings.querySelector("h2");
  jobListings.innerHTML = "";
  if (title) jobListings.appendChild(title);

  if (openJobs.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <i class="fa-solid fa-briefcase" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 20px;"></i>
      <h3>No Jobs Available</h3>
      <p>Check back later for new opportunities.</p>
    `;
    jobListings.appendChild(emptyState);
    return;
  }

  // Sort by newest first
  openJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));

  // Create job cards
  openJobs.forEach((job) => {
    const jobCard = createJobCard(job);
    jobListings.appendChild(jobCard);
  });
}

function createJobCard(job) {
  const card = document.createElement("div");
  card.className = "job-card";

  // Get company initial
  const companyInitial = job.company
    ? job.company.charAt(0).toUpperCase()
    : "C";

  card.innerHTML = `
    <div class="job-header">
      <div class="job-icon job-icon-primary">${companyInitial}</div>
      <div class="job-title-section">
        <h3>${job.title}</h3>
        <p class="company">
          <i class="fa-solid fa-building"></i> ${job.company} - ${job.location}
        </p>
      </div>
    </div>
    <div class="job-tags">
      <span class="job-tag"><i class="fa-solid fa-clock"></i> ${job.type}</span>
      <span class="job-tag"><i class="fa-solid fa-location-dot"></i> ${job.locationType || "On-site"}</span>
      <span class="job-tag"><i class="fa-solid fa-dollar-sign"></i> $${Math.round(job.salaryMin / 1000)}k - $${Math.round(job.salaryMax / 1000)}k</span>
    </div>
    <div class="h-line"></div>
    <div class="show-job">
      <span class="posted-time">
        <i class="fa-regular fa-calendar"></i> Posted ${daysAgo(job.postedDate)}
      </span>
      <a href="JobDetails.html?id=${job.id}" class="view-details">
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
  const allJobs = getAllJobs();
  let filtered = allJobs.filter((job) => job.status === "open");

  // Filter by title (if search term provided)
  if (searchTitle) {
    filtered = filtered.filter(
      (job) =>
        job.title.toLowerCase().includes(searchTitle) ||
        job.company.toLowerCase().includes(searchTitle) ||
        job.location.toLowerCase().includes(searchTitle),
    );
  }

  // Filter by experience (if experience provided)
  if (searchExperience) {
    const requiredYears = parseInt(searchExperience);
    if (requiredYears) {
      filtered = filtered.filter((job) => {
        // Extract years from experience string (e.g., "3+ years", "5 years", "2-4 years")
        const expStr = job.experience || "";

        // Try to extract the first number from the experience string
        const match = expStr.match(/(\d+)/);
        if (match) {
          const jobYears = parseInt(match[1]);
          return jobYears <= requiredYears; // Show jobs requiring less than or equal to entered years
        }
        return true; // If no experience
      });
    }
  }

  // Update the job listings display
  const jobListings = document.querySelector(".job-listings");
  if (!jobListings) return;

  const title = jobListings.querySelector("h2");
  jobListings.innerHTML = "";
  if (title) jobListings.appendChild(title);

  if (filtered.length === 0) {
    let emptyMessage = "No jobs found";
    if (searchTitle && searchExperience) {
      emptyMessage = `No jobs found matching "${searchTitle}" with ${searchExperience} years experience`;
    } else if (searchTitle) {
      emptyMessage = `No jobs found matching "${searchTitle}"`;
    } else if (searchExperience) {
      emptyMessage = `No jobs found requiring ${searchExperience} years experience`;
    }

    const emptyState = document.createElement("div");
    emptyState.className = "empty-state-simple";
    emptyState.innerHTML = `<p>${emptyMessage}</p>`;
    jobListings.appendChild(emptyState);
  } else {
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
  let filteredJobs = getAllJobs().filter((job) => job.status === "open");

  // Filter by job type
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
        job.type.toLowerCase().includes(type.toLowerCase()),
      );
    });
  }

  // Filter by date posted
  const selectedDate = document.querySelector('input[name="date"]:checked');
  if (selectedDate) {
    const dateFilter = selectedDate.value;
    console.log("Date filter selected:", dateFilter);

    filteredJobs = filteredJobs.filter((job) => {
      const postedDate = new Date(job.postedDate);
      const today = new Date();

      postedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      const diffTime = today - postedDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === "24h") {
        return diffDays <= 1; // Posted today or yesterday
      }
      if (dateFilter === "week") {
        return diffDays <= 7; // Posted within last 7 days
      }
      return true;
    });
  }

  // Filter by salary
  const salaryInputs = document.querySelectorAll(".salary-input-group input");
  const minSalary = salaryInputs[0]?.value;
  const maxSalary = salaryInputs[1]?.value;

  if (minSalary || maxSalary) {
    filteredJobs = filteredJobs.filter((job) => {
      if (minSalary && job.salaryMax < parseInt(minSalary)) return false;
      if (maxSalary && job.salaryMin > parseInt(maxSalary)) return false;
      return true;
    });
  }

  // Update display
  const jobListings = document.querySelector(".job-listings");
  if (!jobListings) return;

  const title = jobListings.querySelector("h2");
  jobListings.innerHTML = "";
  if (title) jobListings.appendChild(title);

  if (filteredJobs.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state-simple";
    emptyState.innerHTML = "<p>No jobs match your filters</p>";
    jobListings.appendChild(emptyState);
  } else {
    filteredJobs.forEach((job) => {
      const jobCard = createJobCard(job);
      jobListings.appendChild(jobCard);
    });
  }
}

// ==================== JOB DETAILS PAGE ====================

function setupJobDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get("id");

  if (!jobId) {
    showToast("No job selected", "error");
    window.location.href = "findJob.html";
    return;
  }

  const job = getJobById(jobId);
  if (!job) {
    showToast("Job not found", "error");
    window.location.href = "findJob.html";
    return;
  }

  // Populate page with job details
  populateJobDetails(job);
}

function populateJobDetails(job) {
  // Update title
  const titleEl = document.querySelector(".job-title");
  if (titleEl) titleEl.textContent = job.title;

  // Update meta info
  const metaEls = document.querySelectorAll(".job-meta span");
  if (metaEls.length >= 4) {
    metaEls[0].innerHTML = `<i class="fa-solid fa-building"></i> ${job.company}`;
    metaEls[1].innerHTML = `<i class="fa-solid fa-location-dot"></i> ${job.location}`;
    metaEls[2].innerHTML = `<i class="fa-solid fa-clock"></i> ${job.type}`;
    metaEls[3].innerHTML = `<i class="fa-solid fa-dollar-sign"></i> $${Math.round(job.salaryMin / 1000)}k - $${Math.round(job.salaryMax / 1000)}k`;
  }

  // Update description
  const descEl = document.querySelector(".job-description p");
  if (descEl) descEl.textContent = job.description;

  // Update requirements and responsibilities
  const lists = document.querySelectorAll(".job-description ul");
  if (lists.length >= 2) {
    // Requirements
    if (job.requirements) {
      const reqList = job.requirements.split(",").map((r) => r.trim());
      lists[1].innerHTML = reqList.map((r) => `<li>${r}</li>`).join("");
    }

    // Responsibilities
    if (job.responsibilities) {
      const respList = job.responsibilities.split(",").map((r) => r.trim());
      lists[0].innerHTML = respList.map((r) => `<li>${r}</li>`).join("");
    }
  }

  // Update apply button link
  const applyBtn = document.querySelector(".apply-btn");
  if (applyBtn) {
    applyBtn.href = `apply-job.html?id=${job.id}`;
  }
}

// ==================== APPLY JOB PAGE ====================
function setupApplyJobPage() {
  console.log("Setting up Apply Job page");

  // Get job ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get("id");

  if (!jobId) {
    showToast("No job selected", "error");
    window.location.href = "findJob.html";
    return;
  }

  const job = getJobById(jobId);
  if (!job) {
    showToast("Job not found", "error");
    window.location.href = "findJob.html";
    return;
  }

  // Update header with job info
  const header = document.querySelector(".job-header");
  if (header) {
    header.innerHTML = `
      <h1>Apply for ${job.title}</h1>
      <p>${job.company} - ${job.location}</p>
    `;
  }

  // Setup form submission
  setupApplicationForm(jobId);
}

function setupApplicationForm(jobId) {
  const form = document.querySelector(".application-form");
  if (!form) return;

  form.onsubmit = function (e) {
    e.preventDefault();

    // Get current user
    const currentUser = getCurrentUser();
    if (!currentUser) {
      showToast("Please login to apply", "warning");
      window.location.href = "../auth/login.html";
      return;
    }

    // Get form data
    const formData = {
      fullname: document.getElementById("fullname")?.value,
      email: document.getElementById("email")?.value,
      phone: document.getElementById("phone")?.value,
      coverletter: document.getElementById("coverletter")?.value,
      experience: document.getElementById("experience")?.value,
      salary: document.getElementById("salary")?.value,
      startdate: document.getElementById("startdate")?.value,
    };

    // Get file name
    const fileInput = document.getElementById("resume");
    const resumeFile = fileInput?.files[0]?.name || "resume.pdf";

    // Create application object
    const application = {
      id: "app_" + Date.now(),
      jobId: jobId,
      applicantId: currentUser.id || currentUser.username,
      applicantUsername: currentUser.username,
      fullName: formData.fullname,
      email: formData.email,
      phone: formData.phone,
      resumeFile: resumeFile,
      coverLetter: formData.coverletter,
      experience: formData.experience,
      expectedSalary: formData.salary,
      startDate: formData.startdate,
      status: "pending",
      appliedDate: new Date().toISOString().split("T")[0],
    };

    // Save application
    const applications = getAllApplications();
    applications.push(application);
    localStorage.setItem("nexjob_applications", JSON.stringify(applications));

    showToast("Application submitted successfully!", "success");
    setTimeout(() => {
      window.location.href = "myapplications.html";
    }, 1500);
  };
}

// ==================== MY APPLICATIONS PAGE ====================
function setupMyApplicationsPage() {
  console.log("Setting up My Applications page");
  loadMyApplications();
  updateApplicationStats();
}

function loadMyApplications() {
  const myApps = getMyApplications();
  const container = document.querySelector(".Applied_Jobs_Cards");

  if (!container) return;

  if (myApps.length === 0) {
    container.innerHTML = `
      <div class="no-applications-empty">
        <i class="fa-solid fa-file-alt"></i>
        <h3>No Applications Yet</h3>
        <p>Start applying to jobs to track your applications here.</p>
        <a href="findJob.html" class="btn-primary">Browse Jobs</a>
      </div>
    `;
    return;
  }

  // Sort by newest first
  myApps.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

  container.innerHTML = "";

  myApps.forEach((app) => {
    const job = getJobById(app.jobId);
    if (!job) return;

    const card = createApplicationCard(app, job);
    container.appendChild(card);
  });
}

function createApplicationCard(application, job) {
  const card = document.createElement("div");
  card.className = "Applied_Jobs_Card-1";

  // Get status color
  const statusColors = {
    pending: "#f39c12",
    reviewed: "#3498db",
    interview: "#9b59b6",
    hired: "#27ae60",
    rejected: "#e74c3c",
  };

  const statusColor = statusColors[application.status] || "#95a5a6";

  card.innerHTML = `
    <div class="Applied_Jobs_Card_Role">
      <h3>${job.title}</h3>
      <p>${job.company} - ${job.location}</p>
    </div>
    <div class="Applied_Jobs_Card_Date">
      <p class="applied-time">${formatDate(application.appliedDate)}</p>
    </div>
    <div class="Applied_Jobs_Card_Status">
      <p>${job.type}</p>
      <p style="color: ${statusColor}; font-weight: bold;">${application.status.toUpperCase()}</p>
    </div>
    <div class="Applied_Jobs_Card_Action">
      <a href="JobDetails.html?id=${job.id}">View Job →</a>
    </div>
  `;

  return card;
}

function updateApplicationStats() {
  const myApps = getMyApplications();

  // Update stats cards
  const stats = {
    applied: myApps.length,
    interview: myApps.filter((app) => app.status === "interview").length,
    offer: myApps.filter(
      (app) => app.status === "hired" || app.status === "offer",
    ).length,
    hired: myApps.filter((app) => app.status === "hired").length,
  };

  // Find stats elements
  const statCards = document.querySelectorAll(".Statistics > div p");
  if (statCards.length >= 4) {
    statCards[0].textContent = stats.applied;
    statCards[1].textContent = stats.interview;
    statCards[2].textContent = stats.offer;
    statCards[3].textContent = stats.hired;
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
