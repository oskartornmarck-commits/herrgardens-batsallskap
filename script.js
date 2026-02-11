fetch("header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header-placeholder").innerHTML = data;

    const hamburger = document.getElementById("hamburger");
    const nav = document.getElementById("primary-navigation");
    const header = document.querySelector(".site-header");

    hamburger.addEventListener("click", () => {
      nav.classList.toggle("active");

      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", !expanded);
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  });

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
