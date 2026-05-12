console.log("JS LOADED");
// ==================== STORAGE KEYS ====================
const JOBS_KEY = "nexjob_jobs"; // job listings
const APPLICATIONS_KEY = "nexjob_applications"; // job applications
const USERS_KEY = "users"; // user accounts
const CURRENT_USER_KEY = "currentUser"; // logged-in user

// ==================== store functions ====================
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getFromStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// ==================== user part ====================
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

// ==================== job functions ====================
function getAllJobs() {
  return getFromStorage(JOBS_KEY);
}

function saveJob(jobData) {
  const jobs = getAllJobs();
  const currentUser = getCurrentUser();

  jobData.id = "job_" + Date.now();

  jobData.companyId = currentUser ? currentUser.username : "unknown";
  jobData.company =
    currentUser && currentUser.company
      ? currentUser.company
      : "Unknown Company";

  jobData.postedDate = new Date().toISOString().split("T")[0];

  jobData.status = jobData.status || "open";

  jobs.push(jobData);
  saveToStorage(JOBS_KEY, jobs);
  return jobData;
}

function getJobById(jobId) {
  const jobs = getAllJobs();
  return jobs.find((job) => job.id === jobId);
}

function deleteJob(jobId) {
  const jobs = getAllJobs();
  const filtered = jobs.filter((job) => job.id !== jobId);
  saveToStorage(JOBS_KEY, filtered);
}

function getMyCompanyJobs() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.type !== "admin") return [];

  const jobs = getAllJobs();
  return jobs.filter((job) => job.companyId === currentUser.username);
}

// ==================== job applications part ====================
function getAllApplications() {
  return getFromStorage(APPLICATIONS_KEY);
}

function saveApplication(jobId, formData) {
  const applications = getAllApplications();
  const currentUser = getCurrentUser();

  const application = {
    id: "app_" + Date.now(),
    jobId: jobId,
    applicantUsername: currentUser ? currentUser.username : "guest",
    fullName: formData.fullname,
    email: formData.email,
    phone: formData.phone,
    resumeFile: formData.resumeFile || "resume.pdf",
    coverLetter: formData.coverletter || "",
    experience: formData.experience,
    expectedSalary: formData.salary,
    startDate: formData.startdate,
    status: "pending",
    appliedDate: new Date().toISOString().split("T")[0],
  };

  applications.push(application);
  saveToStorage(APPLICATIONS_KEY, applications);
  return application;
}

function getMyApplications() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  const applications = getAllApplications();
  return applications.filter(
    (app) => app.applicantUsername === currentUser.username,
  );
}

function getApplicationsForMyJobs() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.type !== "admin") return [];

  const myJobs = getMyCompanyJobs();
  const myJobIds = myJobs.map((job) => job.id);

  const applications = getAllApplications();
  return applications.filter((app) => myJobIds.includes(app.jobId));
}

function getApplicationsForJob(jobId) {
  const applications = getAllApplications();
  return applications.filter((app) => app.jobId === jobId);
}

function updateApplicationStatus(applicationId, newStatus) {
  const applications = getAllApplications();
  const index = applications.findIndex((app) => app.id === applicationId);
  if (index !== -1) {
    applications[index].status = newStatus;
    applications[index].statusUpdatedAt = new Date().toISOString();
    saveToStorage(APPLICATIONS_KEY, applications);
    return true;
  }
  return false;
}
