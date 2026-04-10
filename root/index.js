document.addEventListener("DOMContentLoaded", function () {
  initSmoothScroll();
  initScrollAnimations();
});

function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href="index.html"]');

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

// ============================================
// 2. SCROLL ANIMATIONS (Fade-in effects)
// ============================================
// Purpose: Elements fade in as user scrolls down
// How it works:
// - Intersection Observer watches for elements entering viewport
// - When element becomes visible, adds "visible" class
// - CSS handles the actual animation (opacity/transform)

function initScrollAnimations() {
  // Options for the observer
  const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  };

  // Create the observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // If element is visible in viewport
      if (entry.isIntersecting) {
        // Add "visible" class to trigger CSS animation
        entry.target.classList.add("visible");

        // Optional: Stop watching after animation (performance)
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Find all elements we want to animate
  // Category cards
  document.querySelectorAll(".category-card").forEach((card) => {
    observer.observe(card);
  });

  // Step cards
  document.querySelectorAll(".step-card").forEach((card) => {
    observer.observe(card);
  });

  // CTA section
  const ctaContent = document.querySelector(".cta-content");
  if (ctaContent) {
    observer.observe(ctaContent);
  }
}
