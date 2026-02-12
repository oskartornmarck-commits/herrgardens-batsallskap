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

  if (!header || !hamburger || !nav) {
    return;
  }

  const updateMenuState = (isOpen) => {
    nav.classList.toggle("active", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    hamburger.classList.toggle("is-active", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    hamburger.setAttribute("aria-label", isOpen ? "Stäng meny" : "Öppna meny");
  };

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
    const isOpen = !nav.classList.contains("active");
    updateMenuState(isOpen);
  });

  // Close menu on link click
  document.querySelectorAll(".nav-list a").forEach(link => {
    link.addEventListener("click", () => {
      updateMenuState(false);
    });
  });

  // Close menu when clicking on overlay background (not on links)
  nav.addEventListener("click", (event) => {
    if (event.target === nav) {
      updateMenuState(false);
      hamburger.focus();
    }
  });

  // Close menu with Escape key
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("active")) {
      updateMenuState(false);
      hamburger.focus();
    }
  });
}
