// Load header
fetch("header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header-placeholder").innerHTML = data;
    initHeader();
  });

// Load footer
fetch("footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer-placeholder").innerHTML = data;
  });

function initHeader() {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("primary-navigation");
  const header = document.querySelector(".site-header");
  const links = document.querySelectorAll(".nav-list a");

  function updateHeaderOnScroll() {
    if (document.body.classList.contains("menu-open")) {
      header.classList.remove("scrolled");
      return;
    }

    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  hamburger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("active");
    document.body.classList.toggle("menu-open", isOpen);

    if (!isOpen) {
      updateHeaderOnScroll();
    }
  });

  // Klick på mörk bakgrund stänger menyn
  nav.addEventListener("click", (e) => {
    if (e.target === nav) {
      nav.classList.remove("active");
      document.body.classList.remove("menu-open");
      updateHeaderOnScroll();
    }
  });

  // Klick på länk stänger menyn
  links.forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("active");
      document.body.classList.remove("menu-open");
      updateHeaderOnScroll();
    });
  });

  window.addEventListener("scroll", updateHeaderOnScroll);
  updateHeaderOnScroll();

  // Active link
  const current = window.location.pathname.split("/").pop();
  links.forEach(link => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });
}
