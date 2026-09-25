(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var lang = (root.getAttribute("lang") || "en").slice(0, 2);
  if (["en", "it", "fa"].indexOf(lang) < 0) lang = "en";

  var L = {
    en: { menu: "Menu", pages: "Pages", secs: "On this page", langs: "Language", theme: "Theme", close: "Close menu", dark: "Switch to dark theme", light: "Switch to light theme", top: "Back to top", sections: "Page sections",
      nav: ["Summary", "Experience", "Services", "Skills", "Products", "Books & content", "Websites", "Design", "Samples"] },
    it: { menu: "Menu", pages: "Pagine", secs: "In questa pagina", langs: "Lingua", theme: "Tema", close: "Chiudi menu", dark: "Passa al tema scuro", light: "Passa al tema chiaro", top: "Torna su", sections: "Sezioni della pagina",
      nav: ["Sintesi", "Esperienza", "Servizi", "Competenze", "Prodotti", "Libri e contenuti", "Siti web", "Design", "Esempi"] },
    fa: { menu: "منو", pages: "صفحه‌ها", secs: "در این صفحه", langs: "زبان", theme: "تم", close: "بستن منو", dark: "تم تیره", light: "تم روشن", top: "بازگشت به بالا", sections: "بخش‌های صفحه",
      nav: ["خلاصه", "تجربه‌ها", "خدمات", "مهارت‌ها", "محصولات", "کتاب و محتوا", "سایت‌ها", "طراحی", "نمونه‌ها"] }
  }[lang];

  function safe(fn) { try { return fn(); } catch (e) { return null; } }

  /* ---------- theme (dark / light) ---------- */
  var KEY = "cv_theme";
  function saved() { return safe(function () { return localStorage.getItem(KEY); }); }
  function prefersDark() { return !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); }
  function setTheme(t, persist) {
    root.setAttribute("data-theme", t);
    if (persist) safe(function () { localStorage.setItem(KEY, t); });
    var label = t === "dark" ? L.light : L.dark;
    [].forEach.call(doc.querySelectorAll(".theme-toggle"), function (b) {
      b.textContent = t === "dark" ? "\u2600" : "\u263e";
      b.setAttribute("aria-label", label);
      b.setAttribute("title", label);
    });
  }
  setTheme(saved() || (prefersDark() ? "dark" : "light"), false);

  function ready(fn) { if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", fn); else fn(); }

  ready(function () {
    var topbar = doc.querySelector(".topbar");
    var nav = doc.querySelector(".topbar .nav");

    /* theme toggle */
    if (nav) {
      var btn = doc.createElement("button");
      btn.type = "button"; btn.className = "theme-toggle";
      btn.addEventListener("click", function () {
        setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
      });
      nav.appendChild(btn);
      setTheme(root.getAttribute("data-theme"), false);
    }

    /* progress bar */
    var bar = doc.createElement("div"); bar.className = "progress"; bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = "<i></i>"; doc.body.appendChild(bar);
    var fill = bar.firstChild;

    /* back to top */
    var top = doc.createElement("button");
    top.type = "button"; top.className = "to-top"; top.textContent = "↑";
    top.setAttribute("aria-label", L.top); top.setAttribute("title", L.top);
    top.addEventListener("click", function () {
      var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    doc.body.appendChild(top);

    /* section navigator (pages with several h2 sections) */
    var secs = [].slice.call(doc.querySelectorAll("main section")).filter(function (s) { return s.querySelector("h2"); });
    var links = [];
    if (topbar && secs.length >= 4) {
      var ids = ["summary", "experience", "services", "skills", "product-projects", "content-books", "website-projects", "design-portfolio", "samples"];
      var useMap = secs.length === ids.length;
      var sub = doc.createElement("div"); sub.className = "subnav";
      var wrap = doc.createElement("div"); wrap.className = "wrap";
      wrap.setAttribute("role", "navigation"); wrap.setAttribute("aria-label", L.sections);
      secs.forEach(function (s, i) {
        if (!s.id) s.id = useMap ? ids[i] : "sec-" + (i + 1);
        var a = doc.createElement("a");
        a.href = "#" + s.id;
        a.textContent = useMap ? L.nav[i] : s.querySelector("h2").textContent.trim();
        a.addEventListener("click", function (e) {
          var t = doc.getElementById(s.id); if (!t) return;
          e.preventDefault();
          var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
          t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
          if (history.replaceState) history.replaceState(null, "", "#" + s.id);
        });
        wrap.appendChild(a); links.push(a);
      });
      sub.appendChild(wrap); topbar.appendChild(sub);
    }

    /* mobile slide-in menu */
    var drawerLinks = [];
    if (topbar && nav) {
      var mbtn = doc.createElement("button");
      mbtn.type = "button"; mbtn.className = "menu-btn";
      mbtn.setAttribute("aria-label", L.menu); mbtn.setAttribute("aria-expanded", "false"); mbtn.setAttribute("aria-controls", "site-drawer");
      mbtn.innerHTML = "<span></span><span></span><span></span>";
      var tbWrap = topbar.querySelector(".wrap"); if (tbWrap) tbWrap.appendChild(mbtn);

      var ov = doc.createElement("div"); ov.className = "drawer-overlay"; ov.setAttribute("aria-hidden", "true");
      var dr = doc.createElement("aside"); dr.className = "drawer"; dr.id = "site-drawer";
      dr.setAttribute("aria-label", L.menu); dr.setAttribute("aria-hidden", "true");
      function esc(x) { return String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
      var html = '<div class="drawer-head"><strong>' + L.menu + '</strong><button type="button" class="drawer-close" aria-label="' + L.close + '">\u00d7</button></div>';
      var allA = [].slice.call(nav.querySelectorAll("a"));
      var pageAs = allA.filter(function (a) { return !/^(FA|EN|IT)$/i.test(a.textContent.trim()); });
      var langAs = allA.filter(function (a) { return /^(FA|EN|IT)$/i.test(a.textContent.trim()); });
      html += '<div class="drawer-group"><span class="drawer-title">' + L.pages + '</span>';
      pageAs.forEach(function (a) {
        html += '<a class="drawer-link' + (a.classList.contains("active") ? " current" : "") + (a.classList.contains("gold") ? " gold" : "") +
          '" href="' + esc(a.getAttribute("href")) + '">' + esc(a.textContent.trim()) + '</a>';
      });
      html += '</div>';
      if (links.length) {
        html += '<div class="drawer-group"><span class="drawer-title">' + L.secs + '</span>';
        links.forEach(function (a, i) { html += '<a class="drawer-link sec" data-i="' + i + '" href="' + esc(a.getAttribute("href")) + '">' + esc(a.textContent) + '</a>'; });
        html += '</div>';
      }
      html += '<div class="drawer-group row"><span class="drawer-title">' + L.langs + '</span><div class="drawer-langs">';
      langAs.forEach(function (a) {
        html += '<a class="drawer-lang' + (a.classList.contains("active") ? " current" : "") + '" href="' + esc(a.getAttribute("href")) + '">' + esc(a.textContent.trim()) + '</a>';
      });
      html += '</div></div>';
      html += '<div class="drawer-group row"><span class="drawer-title">' + L.theme + '</span><button type="button" class="theme-toggle drawer-theme"></button></div>';
      dr.innerHTML = html;
      doc.body.appendChild(ov); doc.body.appendChild(dr);
      drawerLinks = [].slice.call(dr.querySelectorAll(".drawer-link.sec"));
      dr.querySelector(".drawer-theme").addEventListener("click", function () {
        setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
      });
      setTheme(root.getAttribute("data-theme"), false);

      var lastFocus = null;
      var openMenu = function () {
        lastFocus = doc.activeElement;
        doc.body.classList.add("menu-open"); dr.classList.add("open"); ov.classList.add("open");
        mbtn.setAttribute("aria-expanded", "true"); dr.setAttribute("aria-hidden", "false");
        var f = dr.querySelector(".drawer-close"); if (f) f.focus();
      };
      var closeMenu = function (restore) {
        doc.body.classList.remove("menu-open"); dr.classList.remove("open"); ov.classList.remove("open");
        mbtn.setAttribute("aria-expanded", "false"); dr.setAttribute("aria-hidden", "true");
        if (restore !== false && lastFocus && lastFocus.focus) lastFocus.focus();
      };
      mbtn.addEventListener("click", function () { if (dr.classList.contains("open")) closeMenu(); else openMenu(); });
      ov.addEventListener("click", function () { closeMenu(); });
      dr.querySelector(".drawer-close").addEventListener("click", function () { closeMenu(); });
      doc.addEventListener("keydown", function (e) {
        if (!dr.classList.contains("open")) return;
        if (e.key === "Escape") { closeMenu(); return; }
        if (e.key === "Tab") {
          var f = [].slice.call(dr.querySelectorAll("a[href],button")); if (!f.length) return;
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      drawerLinks.forEach(function (a) {
        a.addEventListener("click", function (e) {
          var s = links[+a.getAttribute("data-i")]; if (s) { e.preventDefault(); closeMenu(false); s.click(); }
        });
      });
      dr.addEventListener("click", function (e) {
        var a = e.target.closest && e.target.closest("a.drawer-link:not(.sec), a.drawer-lang"); if (a) closeMenu(false);
      });
      window.addEventListener("resize", function () { if (innerWidth > 720 && dr.classList.contains("open")) closeMenu(false); });
    }

    /* scroll state: progress, topbar shadow, to-top, scroll-spy */
    var ticking = false;
    function onScroll() {
      ticking = false;
      var h = root.scrollHeight - root.clientHeight;
      var y = window.pageYOffset || root.scrollTop;
      fill.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + "%";
      if (topbar) topbar.classList.toggle("scrolled", y > 8);
      top.classList.toggle("show", y > 700);
      if (links.length) {
        var probe = y + (topbar ? topbar.offsetHeight : 80) + 90, cur = 0;
        secs.forEach(function (s, i) { if (s.getBoundingClientRect().top + y <= probe) cur = i; });
        if (h - y < 40) cur = secs.length - 1;
        links.forEach(function (a, i) {
          var on = i === cur; a.classList.toggle("on", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
        drawerLinks.forEach(function (a, i) { a.classList.toggle("current", i === cur); });
        var active = links[cur];
        if (active && active.parentNode.scrollWidth > active.parentNode.clientWidth) {
          var p = active.parentNode, target = active.offsetLeft - p.clientWidth / 2 + active.clientWidth / 2;
          p.scrollLeft = Math.max(0, Math.min(target, p.scrollWidth));
        }
      }
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    /* reveal on scroll */
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if ("IntersectionObserver" in window && !reduce) {
      var els = [].slice.call(doc.querySelectorAll(".card, .item, .stat, .cta, .section-head"));
      root.classList.add("js-reveal");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
      els.forEach(function (el) {
        el.classList.add("rv");
        var sib = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
        el.style.setProperty("--d", Math.min(sib, 5) * 70 + "ms");
        io.observe(el);
      });
      window.addEventListener("beforeprint", function () { els.forEach(function (el) { el.classList.add("in"); }); });
    }

    /* count-up for the landing stats */
    var stats = [].slice.call(doc.querySelectorAll(".stat b"));
    if (stats.length && !reduce && "IntersectionObserver" in window) {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return; so.unobserve(en.target);
          var el = en.target, m = /^(\d+)(.*)$/.exec(el.getAttribute("data-final") || "");
          if (!m) return;
          var to = parseInt(m[1], 10), suffix = m[2], from = to > 1900 ? to - 12 : 0, t0 = null;
          (function step(ts) {
            if (t0 === null) t0 = ts;
            var p = Math.min(1, (ts - t0) / 900), e = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(from + (to - from) * e) + suffix;
            if (p < 1) requestAnimationFrame(step); else el.textContent = m[1] + suffix;
          })(performance.now());
        });
      }, { threshold: 0.6 });
      stats.forEach(function (el) { el.setAttribute("data-final", el.textContent.trim()); so.observe(el); });
    }
  });
})();
