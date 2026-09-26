(function () {
  "use strict";
  var doc = document, root = doc.documentElement, KEY = "cv_theme";
  var lang = (root.getAttribute("lang") || "en").slice(0, 2);
  var L = { en: ["Switch to dark theme", "Switch to light theme"], it: ["Passa al tema scuro", "Passa al tema chiaro"], fa: ["تم تیره", "تم روشن"] }[lang] || ["Switch to dark theme", "Switch to light theme"];
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(t, persist) {
    root.setAttribute("data-theme", t);
    if (persist) { try { localStorage.setItem(KEY, t); } catch (e) {} }
    [].forEach.call(doc.querySelectorAll(".ac-theme"), function (b) {
      b.textContent = t === "dark" ? "☀" : "☾";
      b.setAttribute("aria-label", t === "dark" ? L[1] : L[0]); b.setAttribute("title", t === "dark" ? L[1] : L[0]);
    });
  }
  function toggle() { set(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true); }
  function make(cls) { var b = doc.createElement("button"); b.type = "button"; b.className = "ac-theme" + (cls ? " " + cls : ""); b.addEventListener("click", toggle); return b; }
  function ready(fn) { if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", fn); else fn(); }
  ready(function () {
    var sw = doc.querySelector(".lang-switch"); if (sw) sw.appendChild(make());
    var hc = doc.querySelector('header .header-content');
    if (hc) { var b = make("in-header"); var ham = hc.querySelector(".am-btn"); if (ham) hc.insertBefore(b, ham); else hc.appendChild(b); }
    set(root.getAttribute("data-theme") || "light", false);
    // the phone drawer is built later by academic-mobile.js; keep header button order after it appears
    setTimeout(function () { var h = doc.querySelector(".in-header"), ham = doc.querySelector(".am-btn"); if (h && ham && h.nextSibling !== ham) ham.parentNode.insertBefore(h, ham); }, 400);
  });
})();
