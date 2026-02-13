// Konfig: URL till webbapp (samma som config.js för preload)
var MENU_SCRIPT_URL = (typeof HBS_CONFIG !== "undefined" && HBS_CONFIG.menuScriptUrl) ? HBS_CONFIG.menuScriptUrl : "";
var CONFIG_CACHE_KEY = "hbs_config";

// Load header – config-anropet startas redan i <head> (preload) för snabbare första laddning
fetch("header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header-placeholder").innerHTML = data;
    initMenu();
    loadConfig();
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

function applyConfig(data, navList) {
  if (!data) return;
  var menuItems = Array.isArray(data.menu) ? data.menu : (Array.isArray(data) ? data : []);
  if (menuItems.length && navList) {
    navList.innerHTML = "";
    menuItems.forEach(function(item) {
      if (!item || !item.label || !item.href) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.textContent = item.label;
      a.href = item.href;
      li.appendChild(a);
      navList.appendChild(li);
    });
    document.querySelectorAll(".nav-list a").forEach(function(link) {
      link.addEventListener("click", function() {
        var nav = document.getElementById("primary-navigation");
        var hamburger = document.getElementById("hamburger");
        if (nav && hamburger) {
          nav.classList.remove("active");
          document.body.classList.remove("menu-open");
          hamburger.classList.remove("is-active");
          hamburger.setAttribute("aria-expanded", "false");
          hamburger.setAttribute("aria-label", "Öppna meny");
        }
      });
    });
  }
  var content = data.content;
  if (content && typeof content === "object") {
    var set = function(attr, value, useHtml) {
      if (!value) return;
      var el = document.querySelector("[data-content=\"" + attr + "\"]");
      if (el) (useHtml ? (el.innerHTML = value) : (el.textContent = value));
    };
    set("heroTitle", content.herotitle);
    set("heroKicker", content.herokicker);
    set("heroLead", content.herolead);
    set("body", content.bodyhtml, true);
  }
}

function prefetchOtherPages(currentPageId) {
  var pages = ["index", "om", "medlemsinformation", "kontakt", "dokument"];
  pages.forEach(function(pid) {
    if (pid === currentPageId) return;
    var sep = MENU_SCRIPT_URL.indexOf("?") >= 0 ? "&" : "?";
    var cb = "__hbsPrefetch_" + pid;
    window[cb] = function(data) {
      window[cb] = null;
      if (data) try { localStorage.setItem(CONFIG_CACHE_KEY + "_" + pid, JSON.stringify(data)); } catch (e) {}
    };
    var s = document.createElement("script");
    s.src = MENU_SCRIPT_URL + sep + "page=" + encodeURIComponent(pid) + "&callback=" + cb + "&_=" + Date.now();
    s.async = true;
    document.head.appendChild(s);
  });
}

function loadConfig() {
  if (!MENU_SCRIPT_URL || MENU_SCRIPT_URL.indexOf("script.google.com") === -1) {
    var navList = document.querySelector(".nav-list");
    if (navList && navList.children.length === 0) {
      navList.innerHTML = "<li><a href=\"index.html\">Start</a></li><li><a href=\"om.html\">Om föreningen</a></li><li><a href=\"medlemsinformation.html\">Medlemsinformation</a></li><li><a href=\"dokument.html\">Dokument</a></li><li><a href=\"kontakt.html\">Kontakt</a></li>";
    }
    return;
  }

  var path = window.location.pathname || "";
  var pageId = (path.split("/").pop() || "").replace(/\.html$/i, "") || "index";
  var navList = document.querySelector(".nav-list");

  // Visa cached innehåll direkt – ingen väntan
  try {
    var cached = localStorage.getItem(CONFIG_CACHE_KEY + "_" + pageId);
    if (cached) {
      var data = JSON.parse(cached);
      applyConfig(data, navList);
    }
  } catch (e) {}

  // Preload i <head> har redan startat anropet – vi tar över callback
  window.__hbsConfigCallback = function(data) {
    window.__hbsConfigCallback = null;
    if (!data) return;
    applyConfig(data, navList);
    try {
      localStorage.setItem(CONFIG_CACHE_KEY + "_" + pageId, JSON.stringify(data));
    } catch (e) {}
    prefetchOtherPages(pageId);
  };

  var fallbackMenu = function() {
    if (navList && navList.children.length === 0) {
      navList.innerHTML = "<li><a href=\"index.html\">Start</a></li><li><a href=\"om.html\">Om föreningen</a></li><li><a href=\"medlemsinformation.html\">Medlemsinformation</a></li><li><a href=\"dokument.html\">Dokument</a></li><li><a href=\"kontakt.html\">Kontakt</a></li>";
    }
  };

  // Om preload redan returnerat finns data i kön – använd direkt
  if (window.__hbsConfigQueue && window.__hbsConfigQueue.length) {
    var data = window.__hbsConfigQueue.shift();
    if (data) {
      applyConfig(data, navList);
      try {
        localStorage.setItem(CONFIG_CACHE_KEY + "_" + pageId, JSON.stringify(data));
      } catch (e) {}
      prefetchOtherPages(pageId);
    }
  } else {
    setTimeout(function() {
      if (navList && navList.children.length === 0) fallbackMenu();
    }, 5000);
  }
}
