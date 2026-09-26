(function () {
  "use strict";
  var doc = document;
  var all = [].slice.call(doc.querySelectorAll(".shot-btn"));
  if (!all.length) return;
  var btns = all;
  var lang = (doc.documentElement.getAttribute("lang") || "en").slice(0, 2);
  var L = { en: ["Close", "Previous", "Next"], it: ["Chiudi", "Precedente", "Successiva"], fa: ["بستن", "قبلی", "بعدی"] }[lang] || ["Close", "Previous", "Next"];
  var idx = 0, lb, img, cap, opener;

  function build() {
    lb = doc.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.hidden = true;
    lb.innerHTML = '<button type="button" class="lb-close" aria-label="' + L[0] + '">×</button>' +
      '<button type="button" class="lb-nav lb-prev" aria-label="' + L[1] + '">‹</button>' +
      '<figure><img alt=""/><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-nav lb-next" aria-label="' + L[2] + '">›</button>';
    doc.body.appendChild(lb);
    img = lb.querySelector("img"); cap = lb.querySelector("figcaption");
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest(".lb-close")) close(); });
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
  }
  function show(i) {
    idx = (i + btns.length) % btns.length;
    var b = btns[idx];
    img.src = b.getAttribute("data-full");
    img.alt = b.getAttribute("aria-label") || "";
    cap.textContent = b.getAttribute("aria-label") || "";
  }
  function open(i) {
    if (!lb) build();
    opener = doc.activeElement;
    show(i); lb.hidden = false; doc.body.classList.add("lb-open");
    lb.querySelector(".lb-close").focus();
  }
  function close() {
    if (!lb || lb.hidden) return;
    lb.hidden = true; doc.body.classList.remove("lb-open");
    if (opener && opener.focus) opener.focus();
  }
  all.forEach(function (b) {
    b.addEventListener("click", function () {
      var g = b.closest(".shots, .nv-grid");
      btns = g ? [].slice.call(g.querySelectorAll(".shot-btn")).filter(function (x) { return !x.closest("[hidden]"); }) : all;
      open(btns.indexOf(b));
    });
  });
  doc.addEventListener("keydown", function (e) {
    if (!lb || lb.hidden) return;
    var rtl = doc.documentElement.getAttribute("dir") === "rtl";
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(idx + (rtl ? -1 : 1));
    else if (e.key === "ArrowLeft") show(idx + (rtl ? 1 : -1));
  });
})();

/* preview language switch: swaps the FA / EN screenshots inside one card */
(function () {
  "use strict";
  [].forEach.call(document.querySelectorAll(".site-preview[data-langs]"), function (box) {
    [].forEach.call(box.querySelectorAll(".lang-switch button"), function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        var l = btn.getAttribute("data-set");
        box.setAttribute("data-show", l);
        var scope = box.closest(".dash-item") || box;
        [].forEach.call(scope.querySelectorAll("a[data-href-" + l + "]"), function (a) { a.setAttribute("href", a.getAttribute("data-href-" + l)); });
        [].forEach.call(box.querySelectorAll(".lang-switch button"), function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
      });
    });
  });
})();

/* NeuroVerse gallery: category filter */
(function () {
  "use strict";
  var bar = document.querySelector(".nv-filters");
  var grid = document.querySelector(".nv-grid");
  if (!bar || !grid) return;
  bar.addEventListener("click", function (e) {
    var btn = e.target.closest(".nv-filter");
    if (!btn) return;
    var f = btn.getAttribute("data-filter");
    [].forEach.call(bar.querySelectorAll(".nv-filter"), function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
    [].forEach.call(grid.querySelectorAll(".nv-item"), function (it) {
      var show = f === "all" || it.getAttribute("data-cat") === f;
      if (show) it.removeAttribute("hidden"); else it.setAttribute("hidden", "");
    });
  });
})();

/* slider arrows for horizontal strips */
(function () {
  "use strict";
  [].forEach.call(document.querySelectorAll(".slider"), function (box) {
    var strip = box.querySelector(".shots"), prev = box.querySelector(".slide-nav.prev"), next = box.querySelector(".slide-nav.next");
    if (!strip || !prev || !next) return;
    function step() { return Math.max(200, strip.clientWidth * 0.8); }
    function isRtl() { return getComputedStyle(strip).direction === "rtl"; }
    function upd() {
      var max = strip.scrollWidth - strip.clientWidth, x = Math.abs(strip.scrollLeft);
      prev.hidden = x < 4; next.hidden = x > max - 4;
      if (max <= 4) { prev.hidden = true; next.hidden = true; }
    }
    prev.addEventListener("click", function () { strip.scrollBy({ left: isRtl() ? step() : -step(), behavior: "smooth" }); });
    next.addEventListener("click", function () { strip.scrollBy({ left: isRtl() ? -step() : step(), behavior: "smooth" }); });
    strip.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd(); setTimeout(upd, 400);
  });
})();

/* book: island explorer tabs */
(function () {
  "use strict";
  var ex = document.querySelector(".isl-explorer");
  if (!ex) return;
  var tabs = [].slice.call(ex.querySelectorAll(".isl-tab")), panels = [].slice.call(ex.querySelectorAll(".isl-panel"));
  function pick(i, focus) {
    tabs.forEach(function (t, k) { t.setAttribute("aria-selected", k === i ? "true" : "false"); t.tabIndex = k === i ? 0 : -1; });
    panels.forEach(function (p, k) { if (k === i) p.removeAttribute("hidden"); else p.setAttribute("hidden", ""); });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { pick(i); });
    t.addEventListener("keydown", function (e) {
      var n = tabs.length;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); pick((i + 1) % n, true); }
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); pick((i + n - 1) % n, true); }
    });
  });
  pick(0);
})();

/* header: hide on scroll down (whole bar on phones, top row on desktop), show on scroll up; keep the active section tab in view */
(function () {
  "use strict";
  var bar = document.querySelector(".topbar");
  if (!bar) return;
  var mq = window.matchMedia ? matchMedia("(max-width: 720px)") : { matches: false };
  var row1 = bar.querySelector(".wrap");
  var sub = bar.querySelector(".subnav");
  var lastY = window.scrollY || 0, tick = false;
  function measure() {
    var h = bar.offsetHeight;
    bar.style.setProperty("--hide", h + "px");
  }
  function onScroll() {
    if (tick) return; tick = true;
    requestAnimationFrame(function () {
      tick = false;
      if (document.body.classList.contains("menu-open")) { bar.classList.remove("hide"); lastY = window.scrollY || 0; return; }
      var y = window.scrollY || 0, dy = y - lastY;
      if (y <= 10) bar.classList.remove("hide");
      else if (dy > 8 && y > 120) bar.classList.add("hide");
      else if (dy < -6) bar.classList.remove("hide");
      lastY = y;
    });
  }
  measure();
  bar.addEventListener("cv:relayout", measure);
  window.addEventListener("resize", measure);
  window.addEventListener("scroll", onScroll, { passive: true });
  bar.addEventListener("focusin", function () { bar.classList.remove("hide"); });
  if (window.ResizeObserver) { try { new ResizeObserver(measure).observe(bar); } catch (e) {} }
  var strip = sub && sub.querySelector(".wrap");
  function centerActive(smooth) {
    if (!strip) return;
    var a = strip.querySelector("a.on"); if (!a) return;
    var target = a.offsetLeft - (strip.clientWidth - a.offsetWidth) / 2;
    try { strip.scrollTo({ left: target, behavior: smooth ? "smooth" : "auto" }); } catch (e) { strip.scrollLeft = target; }
  }
  if (strip && window.MutationObserver) new MutationObserver(function () { centerActive(true); }).observe(strip, { attributes: true, subtree: true, attributeFilter: ["class"] });
  setTimeout(function () { measure(); centerActive(false); }, 500);
})();

/* desktop: the section tabs join the top row; phones keep them as a strip under it */
(function () {
  "use strict";
  var bar = document.querySelector(".topbar"), sub = bar && bar.querySelector(".subnav");
  var row = bar && bar.querySelector(":scope > .wrap");
  if (!sub || !row) return;
  var mq = window.matchMedia ? matchMedia("(max-width: 720px)") : { matches: false };
  function place() {
    if (mq.matches) { if (sub.parentNode !== bar) bar.appendChild(sub); }
    else { var nav = row.querySelector(".nav"); if (sub.parentNode !== row) row.insertBefore(sub, nav || null); }
    bar.dispatchEvent(new Event("cv:relayout"));
    var strip = sub.querySelector(".wrap"), a = strip && strip.querySelector("a.on");
    if (a) { var t = a.offsetLeft - (strip.clientWidth - a.offsetWidth) / 2; strip.scrollLeft = t; }
  }
  place();
  try { mq.addEventListener("change", place); } catch (e) { try { mq.addListener(place); } catch (e2) {} }
})();
