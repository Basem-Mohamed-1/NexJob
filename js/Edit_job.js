document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("main form");

  const minSalary = form.querySelector('input[name="salary_min"]');
  const maxSalary = form.querySelector('input[name="salary_max"]');

  // ==============================
  // TOAST
  // ==============================
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

  toast.hideTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
  // ==============================
  // SALARY VALIDATION
  // ==============================
function validateSalary() {
  const salaryError = document.getElementById("salaryError");

  let min = Number(minSalary.value);
  let max = Number(maxSalary.value);

  const roundedMin = Math.round(min / 500) * 500;
  const roundedMax = Math.round(max / 500) * 500;

  if (roundedMin > roundedMax) {
    salaryError.textContent = "Minimum salary must be ≤ maximum salary";
    salaryError.classList.add("visible");

    minSalary.classList.add("error");
    maxSalary.classList.add("error");

    return false; 
  }

  salaryError.textContent = "";
  salaryError.classList.remove("visible");

  minSalary.classList.remove("error");
  maxSalary.classList.remove("error");

  return true;
}
  // ==============================
  // FORM SUBMIT
  // ==============================
  form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateSalary()) return;

  const jobData = Object.fromEntries(new FormData(form).entries());

  localStorage.setItem("editedJob", JSON.stringify(jobData));

  showToast("Job updated successfully", "success");

  // reset AFTER toast trigger (safe order)
  form.reset();
});});