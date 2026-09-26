(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var L = {
    en: { menu: "Menu", sections: "Sections", pages: "Pages", langs: "Language", close: "Close menu" },
    it: { menu: "Menu", sections: "Sezioni", pages: "Pagine", langs: "Lingua", close: "Chiudi menu" },
    fa: { menu: "منو", sections: "بخش‌ها", pages: "صفحه‌ها", langs: "زبان", close: "بستن منو" }
  };
  function lang() { var l = (root.getAttribute("lang") || "en").slice(0, 2); return L[l] ? l : "en"; }
  function esc(x) { return String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  var mq = window.matchMedia ? matchMedia("(max-width: 768px)") : { matches: false };

  function ready(fn) { if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", fn); else fn(); }

  ready(function () {
    var header = doc.querySelector('header[role="banner"]') || doc.querySelector("header");
    var content = header && header.querySelector(".header-content");
    if (!header || !content) return;

    /* pad the body so the fixed header never covers the content on phones */
    function pad() {
      if (mq.matches) { doc.body.style.paddingTop = header.offsetHeight + "px"; root.style.setProperty("--header-offset", header.offsetHeight + "px"); }
      else if (doc.body.style.paddingTop && !/^\d+px$/.test(doc.body.style.paddingTop)) doc.body.style.paddingTop = "";
    }

    /* quick links (Home / Professional) live inside the header row on every width; phones hide them via CSS and use the drawer */
    var ql = doc.querySelector(".landing-links");
    if (ql && ql.parentNode !== content) content.appendChild(ql);
    if (ql) [].forEach.call(ql.querySelectorAll("a"), function (a) { a.setAttribute("title", a.textContent.trim()); a.setAttribute("aria-label", a.textContent.trim()); });

    var btn = doc.createElement("button");
    btn.type = "button"; btn.className = "am-btn"; btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "am-drawer");
    btn.innerHTML = "<span></span><span></span><span></span>";
    content.appendChild(btn);

    var ov = doc.createElement("div"); ov.className = "am-overlay"; ov.setAttribute("aria-hidden", "true");
    var dr = doc.createElement("aside"); dr.className = "am-drawer"; dr.id = "am-drawer"; dr.setAttribute("aria-hidden", "true");
    doc.body.appendChild(ov); doc.body.appendChild(dr);
    var lastFocus = null;

    function build() {
      var t = L[lang()];
      btn.setAttribute("aria-label", t.menu);
      var h = '<div class="am-head"><strong>' + t.menu + '</strong><button type="button" class="am-close" aria-label="' + t.close + '">×</button></div>';
      var tabs = [].slice.call(doc.querySelectorAll(".nav-btn[data-section]"));
      if (tabs.length) {
        h += '<div class="am-group"><span class="am-title">' + t.sections + '</span>';
        tabs.forEach(function (b, i) {
          var label = (b.getAttribute("data-full-text") || b.textContent || "").trim();
          h += '<button type="button" class="am-link' + (b.classList.contains("active") ? " current" : "") + '" data-tab="' + i + '">' + esc(label) + '</button>';
        });
        h += '</div>';
      }
      var pl = [].slice.call(doc.querySelectorAll(".landing-links a"));
      if (pl.length) {
        h += '<div class="am-group"><span class="am-title">' + t.pages + '</span>';
        pl.forEach(function (a) {
          h += '<a class="am-link' + (a.classList.contains("pro") ? " gold" : "") + '" href="' + esc(a.getAttribute("href")) + '">' + esc(a.textContent.trim()) + '</a>';
        });
        h += '</div>';
      }
      var lb = [].slice.call(doc.querySelectorAll(".lang-switch .lang-btn"));
      if (lb.length) {
        h += '<div class="am-group row"><span class="am-title">' + t.langs + '</span><div class="am-langs">';
        lb.forEach(function (b, i) {
          h += '<button type="button" class="am-lang' + (b.getAttribute("aria-pressed") === "true" ? " current" : "") + '" data-lang="' + i + '">' + esc(b.textContent.trim()) + '</button>';
        });
        h += '</div></div>';
      }
      dr.innerHTML = h;
      dr.setAttribute("aria-label", t.menu);
    }

    function open() {
      build(); lastFocus = doc.activeElement;
      doc.body.classList.add("am-open"); dr.classList.add("open"); ov.classList.add("open");
      btn.setAttribute("aria-expanded", "true"); dr.setAttribute("aria-hidden", "false");
      var f = dr.querySelector(".am-close"); if (f) f.focus();
    }
    function close(restore) {
      doc.body.classList.remove("am-open"); dr.classList.remove("open"); ov.classList.remove("open");
      btn.setAttribute("aria-expanded", "false"); dr.setAttribute("aria-hidden", "true");
      if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus();
    }

    btn.addEventListener("click", function () { if (dr.classList.contains("open")) close(); else open(); });
    ov.addEventListener("click", function () { close(); });
    dr.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("button,a") : null; if (!t) return;
      if (t.classList.contains("am-close")) { close(); return; }
      if (t.hasAttribute("data-tab")) {
        var tabs = doc.querySelectorAll(".nav-btn[data-section]"), b = tabs[+t.getAttribute("data-tab")];
        close(false); window.scrollTo(0, 0); if (b) b.click(); return;
      }
      if (t.hasAttribute("data-lang")) {
        var lbs = doc.querySelectorAll(".lang-switch .lang-btn"), lb = lbs[+t.getAttribute("data-lang")];
        if (lb) lb.click();
        setTimeout(function () { if (dr.classList.contains("open")) build(); pad(); }, 450);
        return;
      }
      if (t.tagName === "A") close(false);
    });
    doc.addEventListener("keydown", function (e) {
      if (!dr.classList.contains("open")) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {
        var f = [].slice.call(dr.querySelectorAll("a[href],button")); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    /* keep the padding right when the layout or language changes */
    window.addEventListener("resize", function () { pad(); if (!mq.matches && dr.classList.contains("open")) close(false); });
    doc.addEventListener("cv:langchange", function () { setTimeout(pad, 60); });
    if (window.ResizeObserver) { try { new ResizeObserver(pad).observe(header); } catch (e) {} }
    /* scroll: hide on the way down, show on the way up (phones only) */
    var lastY = window.scrollY || 0, tick = false;
    function onScroll() {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        tick = false;
        if (!mq.matches || doc.body.classList.contains("am-open")) { header.classList.remove("am-hide"); lastY = window.scrollY || 0; return; }
        var y = window.scrollY || 0, dy = y - lastY;
        if (y <= 10) header.classList.remove("am-hide");
        else if (dy > 8 && y > header.offsetHeight) header.classList.add("am-hide");
        else if (dy < -6) header.classList.remove("am-hide");
        lastY = y;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    header.addEventListener("focusin", function () { header.classList.remove("am-hide"); });

    /* keep the active tab in view inside the strip */
    var strip = header.querySelector('nav [role="tablist"]');
    function centerActive(smooth) {
      if (!strip || !mq.matches) return;
      var a = strip.querySelector(".nav-btn.active"); if (!a) return;
      var target = a.offsetLeft - (strip.clientWidth - a.offsetWidth) / 2;
      try { strip.scrollTo({ left: target, behavior: smooth ? "smooth" : "auto" }); } catch (e) { strip.scrollLeft = target; }
    }
    if (strip && window.MutationObserver) {
      new MutationObserver(function () { header.classList.remove("am-hide"); centerActive(true); }).observe(strip, { attributes: true, subtree: true, attributeFilter: ["class"] });
    }
    doc.addEventListener("cv:langchange", function () { setTimeout(function () { centerActive(false); }, 120); });

    build(); pad();
    setTimeout(pad, 300); setTimeout(pad, 1200); setTimeout(function () { centerActive(false); }, 500);
  });
})();
