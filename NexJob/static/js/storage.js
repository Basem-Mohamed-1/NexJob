// ==================== STORAGE KEYS ====================
const JOBS_KEY = "nexjob_jobs";
const CURRENT_USER_KEY = "currentUser";
const APPLICATIONS_KEY = "nexjob_applications";

// ==================== user functions ====================
function getCurrentUser() {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function isCompany() {
  const user = getCurrentUser();
  return user && user.type === "admin";
}

function isJobSeeker() {
  const user = getCurrentUser();
  return user && user.type === "seeker";
}

// ==================== company job functions ====================
function getAllJobs() {
  const data = localStorage.getItem(JOBS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveJob(jobData) {
  const jobs = getAllJobs();
  const currentUser = getCurrentUser();

  jobData.id = "job_" + Date.now();
  jobData.companyId = currentUser ? currentUser.username : "unknown";
  jobData.company = currentUser && currentUser.company ? currentUser.company : "Unknown Company";
  jobData.postedDate = new Date().toISOString().split("T")[0];
  jobData.status = jobData.status || "open";

  jobs.push(jobData);
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  return jobData;
}

function deleteJob(jobId) {
  const jobs = getAllJobs();
  const filtered = jobs.filter((job) => job.id !== jobId);
  localStorage.setItem(JOBS_KEY, JSON.stringify(filtered));
}

function getMyCompanyJobs() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.type !== "admin") return [];

  const jobs = getAllJobs();
  return jobs.filter((job) => job.companyId === currentUser.username);
}

// ==================== company applications ====================
function getApplicationsForMyJobs() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.type !== "admin") return [];

  const myJobs = getMyCompanyJobs();
  const myJobIds = myJobs.map((job) => job.id);

  const data = localStorage.getItem(APPLICATIONS_KEY);
  const applications = data ? JSON.parse(data) : [];
  return applications.filter((app) => myJobIds.includes(app.jobId));
}

function getApplicationsForJob(jobId) {
  const data = localStorage.getItem(APPLICATIONS_KEY);
  const applications = data ? JSON.parse(data) : [];
  return applications.filter((app) => app.jobId === jobId);
}

function updateApplicationStatus(applicationId, newStatus) {
  const data = localStorage.getItem(APPLICATIONS_KEY);
  const applications = data ? JSON.parse(data) : [];
  const index = applications.findIndex((app) => app.id === applicationId);
  if (index !== -1) {
    applications[index].status = newStatus;
    applications[index].statusUpdatedAt = new Date().toISOString();
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
    return true;
  }
  return false;
}