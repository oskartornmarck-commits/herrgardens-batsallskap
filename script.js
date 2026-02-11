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
    if (document.body.classList.contains("menu-open")) return;

    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  hamburger.addEventListener("click", () => {
    nav.classList.toggle("active");
    document.body.classList.toggle("menu-open");

    // När meny öppnas → ta bort scrolled state
    if (document.body.classList.contains("menu-open")) {
      header.classList.remove("scrolled");
    } else {
      updateHeaderOnScroll();
    }
  });

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



// Google Drive integration
const folderId = "1CvLkxQ2u9AZbajQIQIod2r9yh_TV1QX";
const apiKey = "AIzaSyBtN2zKjUaDPLtxbhNagALvRfyvHUCoXh0";

async function loadDocuments() {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${apiKey}&fields=files(id,name,webViewLink)`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const container = document.getElementById("document-list");
    container.innerHTML = "";

    data.files.forEach(file => {
      const div = document.createElement("div");
      div.classList.add("document-item");
      div.innerHTML = `<a href="${file.webViewLink}" target="_blank">${file.name}</a>`;
      container.appendChild(div);
    });

  } catch (error) {
    console.error("Drive error:", error);
  }
}

if (document.getElementById("document-list")) {
  loadDocuments();
}
