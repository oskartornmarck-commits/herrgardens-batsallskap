fetch("header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header-placeholder").innerHTML = data;
    init();
  });

fetch("footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer-placeholder").innerHTML = data;
  });

function init() {
  const header = document.querySelector(".site-header");
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("primary-navigation");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  hamburger.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}
