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
function showConfirm(
  title,
  message,
  onConfirm,
  confirmText = "Delete",
  type = "danger",
) {
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