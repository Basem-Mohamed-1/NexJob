document.addEventListener("DOMContentLoaded", () => {

  /* ===== PASSWORD VALIDATION ===== */
  const securityForm = document.querySelector(
    ".settings-card:nth-of-type(3) form"
  );

  if (securityForm) {
    securityForm.addEventListener("submit", function (e) {
      const passwords = securityForm.querySelectorAll(
        "input[type='password']"
      );

      const pass1 = passwords[0].value;
      const pass2 = passwords[1].value;

      if (pass1 !== pass2) {
        e.preventDefault();
        alert("Passwords do not match!");
      } else {
        alert("Security settings updated successfully!");
      }
    });
  }

  /* ===== GENERIC FORM SUCCESS ===== */
  const forms = document.querySelectorAll("form");

  forms.forEach(form => {
    form.addEventListener("submit", function () {
      console.log("Form submitted:", form);
    });
  });

});
/*=======================================================================*/
const form = document.querySelector("form");

form.addEventListener("submit", function (e) {
  const minSalary = Number(
    document.querySelector('[name="salary_min"]').value
  );

  const maxSalary = Number(
    document.querySelector('[name="salary_max"]').value
  );

  const experience = Number(
    document.getElementById("experience").value
  );

  /* Salary validation */
  if (minSalary >= maxSalary) {
    alert("Maximum salary must be greater than minimum salary.");
    e.preventDefault();
    return;
  }

  /* Experience validation */
  if (experience < 0) {
    alert("Experience cannot be negative.");
    e.preventDefault();
    return;
  }

  /* Success simulation */
  alert("Job updated successfully!");
});