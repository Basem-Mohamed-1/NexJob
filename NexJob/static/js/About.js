console.log("JS LOADED");
const blocks = document.querySelectorAll(
  ".about-block-container1, .about-block-container2, .about-block-container3, .about-block-container4"
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.2 }
);

blocks.forEach((block) => observer.observe(block));