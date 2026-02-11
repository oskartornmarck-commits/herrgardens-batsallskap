// Load header
fetch("header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header-placeholder").innerHTML = data;
    initMenu();
  });

// Load footer
fetch("footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer-placeholder").innerHTML = data;
  });

function initMenu() {
  const header = document.querySelector(".site-header");
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("primary-navigation");

  // Scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Toggle menu
  hamburger.addEventListener("click", () => {
    nav.classList.toggle("active");
    document.body.classList.toggle("menu-open");
  });

  // Close menu on link click
  document.querySelectorAll(".nav-list a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
      document.body.classList.remove("menu-open");
    });
  });
}
