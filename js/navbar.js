// Hamburger Menu
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger) {
  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });
}

// Close menu when clicking a link
const navLinks = document.querySelectorAll(".nav-menu a");
navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    if (hamburger) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    }
  });
});

// Navbar scroll effect
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
});

// ============================================
// DARK MODE TOGGLE
// ============================================
const darkModeToggle = document.getElementById("darkModeToggle");

// Check for saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateIcon(savedTheme);
}

// Toggle dark mode
if (darkModeToggle) {
  darkModeToggle.addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateIcon(newTheme);
  });
}

// Update icon based on theme
function updateIcon(theme) {
  const icon = darkModeToggle.querySelector("i");
  if (theme === "dark") {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  } else {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  }
}
