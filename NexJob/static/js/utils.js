console.log("Utils loaded");

// ==================== TOAST SYSTEM ====================
function showToast(message, type = "success", duration = 3000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const icons = {
    success: "fa-check-circle",
    error: "fa-times-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="toast-icon fas ${icons[type] || icons.info}"></i>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="dismissToast(this.parentElement)">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    dismissToast(toast);
  }, duration);

  return toast;
}

function dismissToast(toast) {
  if (!toast || toast.classList.contains("removing")) return;
  toast.classList.add("removing");
  setTimeout(() => toast.remove(), 300);
}

// ==================== LOADER ====================
function showLoader() {
  let overlay = document.querySelector(".loader-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "loader-overlay";
    overlay.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(overlay);
  }
  overlay.classList.add("active");
}

function hideLoader() {
  const overlay = document.querySelector(".loader-overlay");
  if (overlay) {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 300);
  }
}

// ==================== CONFIRM DIALOG ====================
function showConfirm(title, message, onConfirm, confirmText = "Delete", type = "danger") {
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay";

  overlay.innerHTML = `
    <div class="confirm-dialog">
      <h3 class="confirm-title">${title}</h3>
      <p class="confirm-message">${message}</p>
      <div class="confirm-actions">
        <button class="confirm-cancel">Cancel</button>
        <button class="confirm-ok ${type}">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add("active");
  });

  overlay.querySelector(".confirm-cancel").onclick = () => {
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 300);
  };
  overlay.querySelector(".confirm-ok").onclick = () => {
    onConfirm();
    overlay.classList.remove("active");
    setTimeout(() => overlay.remove(), 300);
  };
}

// ==================== DATE FORMATTING ====================
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

// ==================== PROTECTED ROUTE ====================
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please login to continue", "warning");
    setTimeout(() => {
      window.location.href = "../auth/login.html";
    }, 1500);
    return false;
  }
  return true;
}

function requireCompany() {
  if (!requireAuth()) return false;
  const user = getCurrentUser();
  if (user.type !== "admin") {
    showToast("Access denied. Company only.", "error");
    setTimeout(() => {
      window.location.href = "../jobseeker/home.html";
    }, 1500);
    return false;
  }
  return true;
}

function requireJobSeeker() {
  if (!requireAuth()) return false;
  const user = getCurrentUser();
  if (user.type !== "seeker") {
    showToast("Access denied. Job seeker only.", "error");
    setTimeout(() => {
      window.location.href = "../company/Dashboard.html";
    }, 1500);
    return false;
  }
  return true;
}