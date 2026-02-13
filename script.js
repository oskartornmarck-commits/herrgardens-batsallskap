// Konfig: URL till meny-webbapp (Google Apps Script som läser från Google Sheets)
// Fylls i enligt google-apps-script/README.md, t.ex.:
// var MENU_SCRIPT_URL = "https://script.google.com/macros/s/XXXX/exec";
var MENU_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwecYMMVgnhmI9R0LD1acUTHhTeCM7mAGqcSLTr4ceLaP5JmqtzJNIFBDLQkNI_IQul/exec";

// Load header
fetch("header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header-placeholder").innerHTML = data;
    initMenu();
    loadMenuFromSheet();
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

function loadMenuFromSheet() {
  // Om ingen URL är angiven eller om den inte ser ut som en Apps Script-URL – lämna ev. statisk meny orörd.
  if (!MENU_SCRIPT_URL || MENU_SCRIPT_URL.indexOf("script.google.com") === -1) {
    // Fallback: om header.html saknar länkar helt, lägg in en enkel statisk meny.
    const navList = document.querySelector(".nav-list");
    if (navList && navList.children.length === 0) {
      navList.innerHTML = `
        <li><a href="index.html">Start</a></li>
        <li><a href="om.html">Om föreningen</a></li>
        <li><a href="medlemsinformation.html">Medlemsinformation</a></li>
        <li><a href="dokument.html">Dokument</a></li>
        <li><a href="kontakt.html">Kontakt</a></li>
      `;
    }
    return;
  }

  const navList = document.querySelector(".nav-list");
  if (!navList) return;

  // JSONP-callback
  window.__hbsMenuCallback = function(items) {
    window.__hbsMenuCallback = null;
    if (!Array.isArray(items) || !items.length) {
      return;
    }
    navList.innerHTML = "";
    items.forEach(function(item) {
      if (!item || !item.label || !item.href) return;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = item.label;
      a.href = item.href;
      li.appendChild(a);
      navList.appendChild(li);
    });

    // Koppla om klick-hanterare efter att menyn bytts ut
    document.querySelectorAll(".nav-list a").forEach(link => {
      link.addEventListener("click", () => {
        const nav = document.getElementById("primary-navigation");
        const hamburger = document.getElementById("hamburger");
        if (!nav || !hamburger) return;
        nav.classList.remove("active");
        document.body.classList.remove("menu-open");
        hamburger.classList.remove("is-active");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "Öppna meny");
      });
    });
  };

  const script = document.createElement("script");
  script.src = MENU_SCRIPT_URL + (MENU_SCRIPT_URL.indexOf("?") >= 0 ? "&" : "?") + "callback=__hbsMenuCallback";
  script.async = true;
  script.onerror = function() {
    // Vid fel lämnar vi ev. befintlig meny orörd.
  };
  document.head.appendChild(script);
}
