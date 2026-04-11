// put all the Dom function here
document.addEventListener("DOMContentLoaded", function () {
  initSmoothScroll();
});

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
