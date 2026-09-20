(function () {
  const STORAGE_KEY = "cv_lang";
  const SUPPORTED = new Set(["en", "it", "fa"]);
  const ATTRS = ["aria-label", "title", "placeholder", "alt", "data-full-text"];

  // Per-page in HTML so relative paths work from subdirectories.
  const I18N_DIR = (window.__I18N_DIR__ || "i18n/");
  const CACHE_BUSTER = "20260920-v21-bilingual-fixes-r";

  function ensureFaTypography() {
    // Fonts are self-hosted (assets/fonts/fonts.css); load them only if the page did not already.
    if (!document.getElementById("cv-fa-font") && !document.querySelector('link[href*="fonts.css"]')) {
      const link = document.createElement("link");
      link.id = "cv-fa-font";
      link.rel = "stylesheet";
      link.href = I18N_DIR.replace(/i18n\/$/, "") + "assets/fonts/fonts.css?v=1";
      document.head.appendChild(link);
    }
    if (!document.getElementById("cv-fa-typography")) {
      const style = document.createElement("style");
      style.id = "cv-fa-typography";
      style.textContent = `
        html[data-lang="fa"], html[data-lang="fa"] body {
          direction: rtl;
          text-align: right;
        }
        html[data-lang="fa"] body,
        html[data-lang="fa"] button,
        html[data-lang="fa"] input,
        html[data-lang="fa"] textarea,
        html[data-lang="fa"] select,
        html[data-lang="fa"] .card,
        html[data-lang="fa"] .section,
        html[data-lang="fa"] .detail-view {
          font-family: 'Vazirmatn', 'Inter', system-ui, -apple-system, 'Segoe UI', Tahoma, Arial, sans-serif !important;
          letter-spacing: 0 !important;
        }
        html[data-lang="fa"] code,
        html[data-lang="fa"] pre,
        html[data-lang="fa"] kbd,
        html[data-lang="fa"] samp {
          font-family: 'JetBrains Mono', 'Courier New', monospace !important;
          direction: ltr;
          text-align: left;
        }
      `;
      document.head.appendChild(style);
    }
  }

  function norm(s) {
    return (s || "")
      .replace(/[\u00A0\u2007\u202F]/g, " ")
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeDict(obj) {
    const out = {};
    if (!obj) return out;
    for (const [k, v] of Object.entries(obj)) {
      const nk = norm(k);
      if (nk && !(nk in out)) out[nk] = v;
      // Common variant: & vs and
      const nk2 = norm(String(k).replace(/&/g, "and"));
      if (nk2 && !(nk2 in out)) out[nk2] = v;
      // Variant: en-dash/em-dash -> hyphen
      const nk3 = norm(String(k).replace(/[–—]/g, "-"));
      if (nk3 && !(nk3 in out)) out[nk3] = v;
      // Variant: remove decorative emoji/icons around labels (e.g., "🧠 Research" -> "Research")
      try {
        const nk4 = norm(String(k).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""));
        if (nk4 && !(nk4 in out)) out[nk4] = v;
      } catch (_) {}
    }
    return out;
  }



  function pageKey() {
    const p = location.pathname.replace(/\/+$/, "/");
    if (p.includes("/deap/")) return "deap";
    if (p.includes("/hrv/")) return "hrv";
    if (p.includes("/pfc/")) return "pfc";
    if (p.includes("/emerge/")) return "emerge";
    if (p.includes("/theori/")) return "theori";
    if (p.includes("/think360/")) return "think360";
    return "index";
  }

  function getMainRoot() {
    return document.getElementById("main-content") || document.body;
  }

  function getActiveDetailRoot() {
    return document.querySelector(".detail-view.active") || null;
  }

  async function fetchJson(url) {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error("Failed to load i18n map: " + res.status);
    return await res.json();
  }

  // Cache maps to avoid re-fetching.
  const MAP_CACHE = new Map(); // key -> data

  async function loadMap(lang) {
    if (lang === "en") return { title: null, nav: null, text: {} };
    const key = pageKey();
    const cacheKey = key + ":base:" + lang;
    if (MAP_CACHE.has(cacheKey)) return MAP_CACHE.get(cacheKey);

    const url = I18N_DIR + key + "." + lang + ".json?v=" + encodeURIComponent(CACHE_BUSTER);
    const data = await fetchJson(url);
    const shaped = {
      title: data.title || null,
      nav: data.nav || null,
      text: normalizeDict(data.text || {})
    };
    MAP_CACHE.set(cacheKey, shaped);
    return shaped;
  }

  // Optional, lazy-loaded chunks (e.g., details).
  async function loadChunk(lang, chunkName) {
    if (lang === "en") return { text: {} };
    const key = pageKey();
    const cacheKey = key + ":" + chunkName + ":" + lang;
    if (MAP_CACHE.has(cacheKey)) return MAP_CACHE.get(cacheKey);

    const url = I18N_DIR + key + "." + chunkName + "." + lang + ".json?v=" + encodeURIComponent(CACHE_BUSTER);
    const data = await fetchJson(url);
    const shaped = { text: normalizeDict(data.text || data || {}) };
    MAP_CACHE.set(cacheKey, shaped);
    return shaped;
  }

  
  
  // Section chunks (index page): lazy-load per tab/section to keep initial i18n light.
  function getActiveSectionId() {
    const sec = document.querySelector(".section.active");
    return (sec && sec.id) ? sec.id : "about";
  }

  async function applySectionChunk(sectionId) {
    if (CURRENT_LANG === "en") return;
    if (pageKey() !== "index") return;
    if (!sectionId) sectionId = getActiveSectionId();

    const rootEl = document.getElementById(sectionId);
    if (!rootEl) return;

    try {
      const chunk = await loadChunk(CURRENT_LANG, sectionId);
      if (chunk && chunk.text) {
        translateTextNodes(chunk.text, rootEl, { skipInactiveDetails: true });
        translateAttributes(chunk.text, rootEl, { skipInactiveDetails: true });
      }
    } catch (_) {}
  }

// Detail HTML (lazy, per-detail) to avoid huge string tables for long detail views.
  const DETAIL_HTML_CACHE = new Map(); // detailId -> it HTML string
  const ORIGINAL_DETAIL_HTML = new Map(); // detailId -> original innerHTML (EN)
  async function loadDetailHtmlLocalized(detailId) {
    const cacheKey = "detail:" + detailId + ":" + CURRENT_LANG;
    if (DETAIL_HTML_CACHE.has(cacheKey)) return DETAIL_HTML_CACHE.get(cacheKey);
    const url = I18N_DIR + "details/" + encodeURIComponent(detailId) + "." + CURRENT_LANG + ".html?v=" + encodeURIComponent(CACHE_BUSTER);
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error("Failed to load detail i18n html: " + res.status);
    const html = await res.text();
    DETAIL_HTML_CACHE.set(cacheKey, html);
    return html;
  }

  async function applyDetailHtmlLocalized(activeDetailEl) {
    const detailId = activeDetailEl && activeDetailEl.id;
    if (!detailId) return;

    // Avoid re-applying if already Italian.
    if (activeDetailEl.getAttribute("data-i18n-detail-lang") === CURRENT_LANG) return;

    if (!ORIGINAL_DETAIL_HTML.has(detailId)) {
      ORIGINAL_DETAIL_HTML.set(detailId, activeDetailEl.innerHTML);
    }

    const localizedHtml = await loadDetailHtmlLocalized(detailId);
    // Replace detail view with localized HTML. (EN is available via language toggle.)
    activeDetailEl.innerHTML = localizedHtml;
    activeDetailEl.setAttribute("data-i18n-detail-lang", CURRENT_LANG);
  }

  function restoreDetailHtmlEn() {
    ORIGINAL_DETAIL_HTML.forEach((html, id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = html;
      el.removeAttribute("data-i18n-detail-lang");
    });
    ORIGINAL_DETAIL_HTML.clear();
  }


  // Store original values so EN restore is exact.
  const ORIGINAL = {
    text: new Map(),  // TextNode -> original string
    attrs: new Map(), // Element -> {attr: value}
    title: null
  };

  function storeAttr(el, attr) {
    let bag = ORIGINAL.attrs.get(el);
    if (!bag) {
      bag = {};
      ORIGINAL.attrs.set(el, bag);
    }
    if (!(attr in bag)) bag[attr] = el.getAttribute(attr);
  }

  function applyNav(nav) {
    if (!nav) return;
    Object.entries(nav).forEach(([id, label]) => {
      const el = document.getElementById(id);
      if (!el) return;
      storeAttr(el, "data-full-text");
      storeAttr(el, "aria-label");
      el.setAttribute("data-full-text", label);
      el.setAttribute("aria-label", label);
    });
  }

  function makeWalker(root, opts) {
    const options = opts || {};
    const skipInactiveDetails = !!options.skipInactiveDetails;

    return document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node || !node.parentElement) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (p.closest && p.closest("script, style, noscript")) return NodeFilter.FILTER_REJECT;

        // Avoid translating the live typewriter output (prevents race conditions under rapid language switching)
        if (p.closest && p.closest(".typing-cursor")) return NodeFilter.FILTER_REJECT;

        // Skip blocks explicitly marked as not translatable (e.g., original EN fallback)
        if (p.closest && p.closest(".i18n-skip")) return NodeFilter.FILTER_REJECT;

        if (skipInactiveDetails) {
          const dv = p.closest(".detail-view");
          if (dv && !dv.classList.contains("active")) return NodeFilter.FILTER_REJECT;
        }

        const v = norm(node.nodeValue);
        if (!v) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
  }

  function translateTextNodes(dict, root, opts) {
    if (!dict) return;
    const walker = makeWalker(root, opts);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    function autoIt(s) {
      let m;
      // 11 Courses -> 11 Corsi
      if ((m = s.match(/^(\d+)\s+Courses$/))) return `${m[1]} Corsi`;
      // 22 Credits -> 22 Crediti
      if ((m = s.match(/^(\d+)\s+Credits$/))) return `${m[1]} Crediti`;
      // 142 units -> 142 unità
      if ((m = s.match(/^(\d+)\s+units$/i))) return `${m[1]} unità`;
      // ~368 Hours / ~2,100 hours -> ~368 Ore / ~2,100 ore
      if ((m = s.match(/^~\s*([\d,]+)\s+Hours$/))) return `~${m[1]} Ore`;
      if ((m = s.match(/^~\s*([\d,]+)\s+hours$/))) return `~${m[1]} ore`;
      // - Grade: 19.5/20 -> - Voto: 19.5/20
      if ((m = s.match(/^(-\s*)Grade:\s*(.+)$/))) return `${m[1]}Voto: ${m[2]}`;
      // GPA: 18.23/20 (...) -> Media (GPA): 18.23/20 (...)
      if ((m = s.match(/^GPA:\s*(.+)$/))) return `Media (GPA): ${m[1]}`;
      return null;
    }

    function autoFa(s) {
      let m;
      if ((m = s.match(/^(\d+)\s+Courses$/))) return `${m[1]} دوره`;
      if ((m = s.match(/^(\d+)\s+Credits$/))) return `${m[1]} واحد`;
      if ((m = s.match(/^(\d+)\s+units$/i))) return `${m[1]} واحد`;
      if ((m = s.match(/^~\s*([\d,]+)\s+Hours$/))) return `حدود ${m[1]} ساعت`;
      if ((m = s.match(/^~\s*([\d,]+)\s+hours$/))) return `حدود ${m[1]} ساعت`;
      if ((m = s.match(/^(-\s*)Grade:\s*(.+)$/))) return `${m[1]}نمره: ${m[2]}`;
      if ((m = s.match(/^GPA:\s*(.+)$/))) return `معدل: ${m[1]}`;
      return null;
    }


    nodes.forEach((node) => {
      if (!ORIGINAL.text.has(node)) ORIGINAL.text.set(node, node.nodeValue);
      const raw = norm(node.nodeValue);
      if (!raw) return;
      const t = dict[raw];
      const auto = (CURRENT_LANG === "it") ? autoIt(raw) : autoFa(raw);
      const out = t || auto;
      if (out) {
        const orig = ORIGINAL.text.get(node);
        const lead = (orig.match(/^\s+/) || [""])[0];
        const trail = (orig.match(/\s+$/) || [""])[0];
        node.nodeValue = lead + out + trail;
      }
    });
  }

  function translateAttributes(dict, root, opts) {
    if (!dict) return;
    const scope = root || document;
    const skipInactiveDetails = !!(opts && opts.skipInactiveDetails);

    scope.querySelectorAll("[aria-label],[title],[placeholder],[alt],[data-full-text]").forEach((el) => {
      if (skipInactiveDetails) {
        const dv = el.closest && el.closest(".detail-view");
        if (dv && !dv.classList.contains("active")) return;
      }
      if (el.closest && el.closest(".i18n-skip")) return;
      ATTRS.forEach((attr) => {
        const v = el.getAttribute(attr);
        if (!v) return;
        storeAttr(el, attr);
        const key = norm(v);
        if (dict[key]) el.setAttribute(attr, dict[key]);
      });
    });
  }

  function restoreEnglish() {
    // Restore any swapped detail-view HTML.
    try { restoreDetailHtmlEn(); } catch (_) {}
    if (ORIGINAL.title != null) document.title = ORIGINAL.title;

    ORIGINAL.text.forEach((val, node) => {
      try { node.nodeValue = val; } catch (_) {}
    });

    ORIGINAL.attrs.forEach((bag, el) => {
      Object.entries(bag).forEach(([attr, v]) => {
        try {
          if (v === null || typeof v === "undefined") el.removeAttribute(attr);
          else el.setAttribute(attr, v);
        } catch (_) {}
      });
    });
  }

  // Floating "Home / Professional résumé" links on the academic pages: keep them in the active language.
  const LANDING_LABELS = {
    en: { home: "Home", pro: "Professional résumé" },
    it: { home: "Home", pro: "Curriculum professionale" },
    fa: { home: "صفحه آغازین", pro: "رزومه شغلی" }
  };

  function updateLandingLinks(lang) {
    const labels = LANDING_LABELS[lang] || LANDING_LABELS.en;
    const back = {
      en: "← Back to academic résumé",
      it: "← Torna al curriculum accademico",
      fa: "← بازگشت به رزومه آکادمیک"
    };
    document.querySelectorAll("a[data-academic]").forEach((a) => {
      a.setAttribute("href", "../academic-" + lang + ".html#section-" + a.getAttribute("data-academic"));
    });
    document.querySelectorAll("a.cv-back").forEach((a) => {
      a.setAttribute("href", "../academic-" + lang + ".html#section-dashboards");
      a.setAttribute("aria-label", back[lang].replace(/^←\s*/, ""));
      a.textContent = back[lang];
    });
    document.querySelectorAll("a[data-pro-link]").forEach((a) => {
      a.setAttribute("href", "./professional-" + lang + ".html#product-projects");
    });
    document.querySelectorAll(".landing-home-link[data-nav]").forEach((a) => {
      const kind = a.getAttribute("data-nav");
      a.setAttribute("href", "./" + (kind === "pro" ? "professional-" : "index-") + lang + ".html");
      a.textContent = kind === "pro" ? labels.pro : labels.home;
    });
  }

  // Detail pages build "fold" summaries from the (truncated) English first paragraph when they open.
  // That truncated text can never match a dictionary key, so rebuild it from the current (translated) body.
  function refreshFoldSummaries(root) {
    (root || document).querySelectorAll("details.detail-fold").forEach((fold) => {
      const summary = fold.querySelector(":scope > summary > .fold-summary");
      const body = fold.querySelector(":scope > .fold-body");
      if (!summary || !body) return;
      const para = body.querySelector(".highlight-box p, p");
      let txt = para ? para.textContent : "";
      if (!txt) {
        const li = body.querySelector("li");
        txt = li ? li.textContent : "";
      }
      // keep ZWNJ (Persian half-space): norm() would strip it
      txt = txt.replace(/[ \s]+/g, " ").trim();
      if (txt.length > 170) txt = txt.slice(0, 167) + "…";
      if (txt && summary.textContent !== txt) summary.textContent = txt;
    });
  }

  function updateLangButtons(lang) {
    document.querySelectorAll(".lang-switch .lang-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.dataset.lang === lang ? "true" : "false");
    });
  }

  let CURRENT_LANG = "en";
  let BASE_MAP = null;
  let DETAILS_MAP = null;
  let LANG_SEQ = 0;

  // Mutation observer to translate late-rendered content (e.g., React apps).
  let OBS = null;
  let APPLY_TIMER = null;
  let IS_APPLYING = false;
  let PENDING_MUTATION = false;

  function stopObserver() {
    if (OBS) {
      try { OBS.disconnect(); } catch (_) {}
      OBS = null;
    }
    if (APPLY_TIMER) {
      clearTimeout(APPLY_TIMER);
      APPLY_TIMER = null;
    }
  }

  function scheduleApply(delayMs) {
    if (CURRENT_LANG === "en") return;
    if (APPLY_TIMER) clearTimeout(APPLY_TIMER);
    APPLY_TIMER = setTimeout(() => {
      applyTranslations().catch(() => {});
    }, delayMs || 180);
  }

  function startObserver() {
    stopObserver();
    if (CURRENT_LANG === "en") return;

    const root = getMainRoot();
    OBS = new MutationObserver((mutations) => {
      if (IS_APPLYING) { PENDING_MUTATION = true; return; }
      // If something meaningful changed, schedule translation.
      for (const m of mutations) {
        if (m.type === "characterData") {
          scheduleApply(260);
          return;
        }
        if (m.type === "childList" && (m.addedNodes && m.addedNodes.length)) {
          scheduleApply(220);
          return;
        }
        if (m.type === "attributes") {
          scheduleApply(260);
          return;
        }
      }
    });

    try {
      OBS.observe(root, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
        attributeFilter: ATTRS.concat(["class","aria-hidden"])
      });
    } catch (_) {}
  }

  async function applyTranslations() {
    if (CURRENT_LANG === "en") return;
    if (!BASE_MAP) BASE_MAP = await loadMap(CURRENT_LANG);
    const root = getMainRoot();

    IS_APPLYING = true;
    try {
      // Base pass (skip inactive details to keep base map light)
      translateTextNodes(BASE_MAP.text, root, { skipInactiveDetails: true });
      translateAttributes(BASE_MAP.text, root, { skipInactiveDetails: true });

      // The page header (name/role tagline) lives outside #main-content.
      const banner = document.querySelector('header[role="banner"]');
      if (banner && !root.contains(banner)) {
        translateTextNodes(BASE_MAP.text, banner);
        translateAttributes(BASE_MAP.text, banner);
      }

      // Apply the active section chunk too (fixes late-loaded DOM staying EN until you switch tabs)
      if (pageKey() === "index") {
        try { await applySectionChunk(getActiveSectionId()); } catch (_) {}
      }


      // Active detail pass: Italian can use full translated HTML; Persian translates the original DOM via details map.
      const activeDetail = getActiveDetailRoot();
      if (activeDetail) {
        try {
          if (CURRENT_LANG === "it") {
            await applyDetailHtmlLocalized(activeDetail);
          }
        } catch (_) {}
        try {
          if (!DETAILS_MAP) {
            try { DETAILS_MAP = await loadChunk(CURRENT_LANG, "details"); } catch (_) { DETAILS_MAP = { text: {} }; }
          }
          if (DETAILS_MAP && DETAILS_MAP.text) {
            translateTextNodes(DETAILS_MAP.text, activeDetail, { skipInactiveDetails: false });
            translateAttributes(DETAILS_MAP.text, activeDetail, { skipInactiveDetails: false });
          }
        } catch (_) {}
      }
    } finally {
      try { refreshFoldSummaries(); } catch (_) {}
      IS_APPLYING = false;
      if (PENDING_MUTATION) {
        PENDING_MUTATION = false;
        // A mutation happened while we were translating; re-run shortly so nothing stays in EN.
        scheduleApply(80);
      }
    }
  }

  async function setLang(lang) {
    const safe = SUPPORTED.has(lang) ? lang : "en";
    const seq = ++LANG_SEQ;
    const prevLang = CURRENT_LANG;
    CURRENT_LANG = safe;

    document.documentElement.dataset.lang = safe;
    document.documentElement.setAttribute("lang", safe);
    document.documentElement.setAttribute("dir", safe === "fa" ? "rtl" : "ltr");
    document.body && document.body.setAttribute("dir", safe === "fa" ? "rtl" : "ltr");
    localStorage.setItem(STORAGE_KEY, safe);
    updateLangButtons(safe);
    updateLandingLinks(safe);
    if (safe === "fa") ensureFaTypography();

    if (ORIGINAL.title == null) ORIGINAL.title = document.title;

    // Dictionaries are keyed by the English source text, so going FA <-> IT directly
    // must first put the English back (otherwise the previous language stays on screen).
    if (prevLang !== "en" && prevLang !== safe && ORIGINAL.text.size) {
      try { restoreEnglish(); } catch (_) {}
      try { refreshFoldSummaries(); } catch (_) {}
    }

    if (safe === "en") {
      stopObserver();
      if (APPLY_TIMER) { try { clearTimeout(APPLY_TIMER); } catch(_){} APPLY_TIMER = null; }
      BASE_MAP = null;
      DETAILS_MAP = null;
      restoreEnglish();
      try { refreshFoldSummaries(); } catch (_) {}
      try {
        document.dispatchEvent(new CustomEvent("cv:langchange", { detail: { lang: safe } }));
      } catch (_) {}
      return;
    }

    BASE_MAP = await loadMap(safe);
    if (seq !== LANG_SEQ) return;
    DETAILS_MAP = null; // lazy

    if (BASE_MAP.title) document.title = BASE_MAP.title;
    applyNav(BASE_MAP.nav);

    await applyTranslations();
    if (seq !== LANG_SEQ) return;

    // Lazy-translate the active section content on the index page.
    try { await applySectionChunk(getActiveSectionId()); } catch (_) {}
    if (seq !== LANG_SEQ) return;

    // Translate again shortly after in case content renders late
    scheduleApply(420);
    scheduleApply(900);

    if (seq !== LANG_SEQ) return;

    startObserver();

    if (seq !== LANG_SEQ) return;

    try {
      document.dispatchEvent(new CustomEvent("cv:langchange", { detail: { lang: safe } }));
    } catch (_) {}
  }

  // Bind UI
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".lang-switch .lang-btn");
    if (!btn) return;
    setLang(btn.dataset.lang).catch(() => {});
  });

  // When navigating between tabs (index), lazily load that section's translation map.
  // Use rAF to wait for class/DOM updates; this avoids "needs a second tab switch" glitches.
  document.addEventListener("click", (e) => {
    const navBtn = e.target.closest(".nav-btn");
    if (!navBtn) return;
    if (CURRENT_LANG === "en") return;
    const sid = navBtn.dataset && navBtn.dataset.section;
    if (!sid) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      applySectionChunk(sid).catch(() => {});
      scheduleApply(40);
    }));
  });

  // When section changes (index), translate that section.
  document.addEventListener("cv:sectionchange", (e) => {
    if (CURRENT_LANG === "en") return;
    const id = (e && e.detail && e.detail.id) ? String(e.detail.id) : null;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (id) applySectionChunk(id).catch(() => {});
      else applySectionChunk(getActiveSectionId()).catch(() => {});
      scheduleApply(40);
      scheduleApply(240);
    }));
  });

  // When a detail view opens, translate it (lazy chunk).
  document.addEventListener("cv:detailopen", (e) => {
    if (CURRENT_LANG === "en") return;
    const id = (e && e.detail && e.detail.id) ? String(e.detail.id) : null;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (id) {
        const el = document.getElementById(id);
        if (el) el.removeAttribute("data-i18n-detail-lang"); // force re-swap if needed
      }
      scheduleApply(30);
      scheduleApply(220);
    }));
  });

  // Init
  const explicitFaPage = /(^|\/)index-fa\.html(?:$|[?#])/.test(location.pathname + location.search + location.hash);
  const docLangHint = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  const savedRaw = localStorage.getItem(STORAGE_KEY);
  // Persian entry pages must open in Persian even when a previous visit saved EN/IT.
  const saved = explicitFaPage ? "fa" : (savedRaw || (docLangHint.startsWith("fa") ? "fa" : "en"));
  setLang(saved).catch(() => {});
})();