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
      var g = b.closest(".shots");
      btns = g ? [].slice.call(g.querySelectorAll(".shot-btn")) : all;
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
