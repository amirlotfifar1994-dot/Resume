/* =========================
   Theori Static Dashboard
   Vanilla JS (no deps)
   ========================= */
(function () {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const app = $(".app");
  const themeRoot = document.documentElement;
  const sidebarToggle = $("#sidebarToggle");
  const themeToggle = $("#themeToggle");
  const themeLabel = $("#themeLabel");
  const toast = $("#toast");
  const globalSearch = $("#globalSearch");

  // ---------- Toast ----------
  let toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-in");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-in"), 2200);
  }

  // ---------- Sidebar ----------
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      const isOpen = app.getAttribute("data-sidebar") === "open";
      app.setAttribute("data-sidebar", isOpen ? "closed" : "open");
    });
  }
  // Default mobile sidebar state
  if (window.matchMedia && window.matchMedia("(max-width: 1100px)").matches) {
    app.setAttribute("data-sidebar", "closed");
  } else {
    app.setAttribute("data-sidebar", "open");
  }

  // ---------- Theme ----------
  const THEME_KEY = "theori_theme";
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    themeRoot.setAttribute("data-theme", storedTheme);
  }

  function syncThemeLabel() {
    const t = themeRoot.getAttribute("data-theme") || "dark";
    themeLabel.textContent = t === "light" ? "Light" : "Dark";
  }
  syncThemeLabel();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const t = themeRoot.getAttribute("data-theme") === "light" ? "dark" : "light";
      themeRoot.setAttribute("data-theme", t);
      localStorage.setItem(THEME_KEY, t);
      syncThemeLabel();
      drawTrend(); // redraw with new contrast
      showToast(t === "light" ? "Light theme enabled" : "Dark theme enabled");
    });
  }

  // ---------- Smooth scroll + active nav ----------
  function scrollToId(id) {
    const el = $(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.matchMedia && window.matchMedia("(max-width: 1100px)").matches) {
      app.setAttribute("data-sidebar", "closed");
    }
  }

  $$("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const target = btn.getAttribute("data-scroll");
      if (target) scrollToId(target);
    });
  });

  const sections = ["#overview", "#framework", "#evidence", "#hypotheses", "#methods"]
    .map((id) => $(id))
    .filter(Boolean);

  const navItems = $$(".nav__item");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((ent) => {
        if (ent.isIntersecting) {
          const id = "#" + ent.target.id;
          navItems.forEach((n) => {
            n.classList.toggle("is-active", n.getAttribute("data-scroll") === id);
          });
        }
      });
    },
    { rootMargin: "-60% 0px -35% 0px", threshold: 0.01 }
  );
  sections.forEach((s) => io.observe(s));

  // ---------- Reveal animations ----------
  const revealEls = $$(".reveal");
  const rio = new IntersectionObserver(
    (entries) => {
      entries.forEach((ent) => {
        if (ent.isIntersecting) {
          ent.target.classList.add("is-in");
          rio.unobserve(ent.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  revealEls.forEach((el) => rio.observe(el));

  // ---------- KPI cards ----------
  const metrics = [
    { label: "Components", value: 6, hint: "Six core components in the model" },
    { label: "Hypotheses", value: 17, hint: "Testable hypotheses (behavior/EEG/fMRI)" },
    { label: "Stages", value: 4, hint: "Four-stage temporal framing" },
    { label: "Predicted Effect", value: "d > 0.50", hint: "Target: medium-to-large effect" },
  ];

  const kpiGrid = $("#kpiGrid");
  if (kpiGrid) {
    kpiGrid.innerHTML = metrics
      .map((m) => {
        const val =
          typeof m.value === "number"
            ? String(m.value).padStart(2, "0")
            : String(m.value);
        return `
          <div class="kpi__card">
            <div class="kpi__val">${val}</div>
            <div class="kpi__label">${m.label}</div>
            <div class="kpi__hint">${m.hint}</div>
          </div>
        `;
      })
      .join("");
  }

  // ---------- Activity feed ----------
  const activityData = [
    {
      title: "Component map updated",
      time: "T-1d",
      desc: "Six components refined with evidence level labels (supported vs hypothesis).",
    },
    {
      title: "Model equation formalized",
      time: "T-3d",
      desc: "Equation D(t)=δ₀+β₁F(t)+β₂S(t)+β₃F×S prepared for longitudinal analysis.",
    },
    {
      title: "EEG predictions drafted",
      time: "T-6d",
      desc: "LPP and FAA proposed as indices for salience and withdrawal.",
    },
    {
      title: "Intervention route planned",
      time: "T-9d",
      desc: "Filter-abstinence and graded exposure added as translational routes.",
    },
  ];

  const activityList = $("#activityList");
  if (activityList) {
    activityList.innerHTML = activityData
      .map(
        (a) => `
        <li class="activity__item">
          <div class="activity__top">
            <div class="activity__title">${a.title}</div>
            <div class="activity__time">${a.time}</div>
          </div>
          <div class="activity__desc">${a.desc}</div>
        </li>
      `
      )
      .join("");
  }

  // ---------- Hypotheses table ----------
  const hypotheses = [
    { id: 1, title: "Actual–Digital Self‑Discrepancy increases with exposure", domain: "Behavior", status: "hypothesis", metric: "ADSDS score, D(t)" },
    { id: 2, title: "Perceptual recalibration after 4–6 weeks filter use", domain: "Behavior", status: "hypothesis", metric: "Attractiveness ratings (pre/post)" },
    { id: 3, title: "Filter dependence grows longitudinally", domain: "Behavior", status: "hypothesis", metric: "Avoidance, pre-posting anxiety" },
    { id: 4, title: "State body dissatisfaction rises after filtered self-viewing", domain: "Behavior", status: "supported", metric: "State body satisfaction (d)" },
    { id: 5, title: "Interaction amplification (β₃) with social feedback", domain: "Model", status: "hypothesis", metric: "Mixed-effects β estimates" },
    { id: 6, title: "LPP larger for filtered self-images", domain: "EEG", status: "hypothesis", metric: "ERP LPP amplitude" },
    { id: 7, title: "FAA shifts rightward during unfiltered self-viewing", domain: "EEG", status: "hypothesis", metric: "Frontal alpha asymmetry" },
    { id: 8, title: "Early face encoding (N170) mostly unchanged", domain: "EEG", status: "hypothesis", metric: "N170 amplitude/latency" },
    { id: 9, title: "mPFC/precuneus differentiate filtered vs unfiltered self", domain: "fMRI", status: "hypothesis", metric: "Self-network activation" },
    { id: 10, title: "Ventral striatum responds more to filtered self", domain: "fMRI", status: "hypothesis", metric: "ROI NAcc signal" },
    { id: 11, title: "Reward to unfiltered decreases after repeated exposure", domain: "fMRI", status: "hypothesis", metric: "Pre/post striatum response" },
    { id: 12, title: "dACC engages during discrepancy conflict", domain: "fMRI", status: "hypothesis", metric: "Conflict network activation" },
    { id: 13, title: "Amygdala reactivity higher in high dissatisfaction group", domain: "fMRI", status: "hypothesis", metric: "Amygdala ROI, PPI" },
    { id: 14, title: "Early adolescence shows stronger effects (sensitive window)", domain: "Moderators", status: "hypothesis", metric: "Age × exposure interaction" },
    { id: 15, title: "Self-compassion buffers negative outcomes", domain: "Moderators", status: "hypothesis", metric: "Moderation β" },
    { id: 16, title: "Filter abstinence reduces discrepancy & dissatisfaction", domain: "Intervention", status: "hypothesis", metric: "Pre/post ΔD(t)" },
    { id: 17, title: "Graded exposure reduces avoidance and anxiety", domain: "Intervention", status: "hypothesis", metric: "Avoidance score, anxiety" },
  ];

  const hypBody = $("#hypBody");
  let currentSort = { key: "id", dir: 1 };

  function statusCell(s) {
    const map = {
      supported: { label: "Supported", cls: "status--supported" },
      hypothesis: { label: "Hypothesis", cls: "status--hypothesis" },
      observable: { label: "Observable", cls: "status--observable" },
    };
    const v = map[s] || map.hypothesis;
    return `<span class="status ${v.cls}"><span class="status__dot" aria-hidden="true"></span>${v.label}</span>`;
  }

  function renderTable(rows) {
    if (!hypBody) return;
    hypBody.innerHTML = rows
      .map(
        (h) => `
      <tr>
        <td class="mono">${String(h.id).padStart(2, "0")}</td>
        <td>${h.title}</td>
        <td>${h.domain}</td>
        <td>${statusCell(h.status)}</td>
        <td class="muted">${h.metric}</td>
      </tr>
    `
      )
      .join("");
  }

  function sortRows(rows) {
    const { key, dir } = currentSort;
    const copy = rows.slice();
    copy.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv), "en") * dir;
    });
    return copy;
  }

  let filtered = hypotheses.slice();
  renderTable(sortRows(filtered));

  $$("[data-sort]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-sort");
      if (!key) return;
      if (currentSort.key === key) currentSort.dir *= -1;
      else currentSort = { key, dir: 1 };
      renderTable(sortRows(filtered));
      showToast("Sorting applied");
    });
  });

  function applySearch(q) {
    const s = (q || "").trim().toLowerCase();
    if (!s) {
      filtered = hypotheses.slice();
      renderTable(sortRows(filtered));
      return;
    }
    filtered = hypotheses.filter((h) => {
      return (
        String(h.id).includes(s) ||
        h.title.toLowerCase().includes(s) ||
        h.domain.toLowerCase().includes(s) ||
        h.status.toLowerCase().includes(s) ||
        h.metric.toLowerCase().includes(s)
      );
    });
    renderTable(sortRows(filtered));
  }

  if (globalSearch) {
    globalSearch.addEventListener("input", () => applySearch(globalSearch.value));
  }

  // ---------- Canvas Trend ----------
  const trendCanvas = $("#trendCanvas");
  const ft = $("#ftVal");
  const st = $("#stVal");
  const dt = $("#dtVal");

  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  function computeD(F, S) {
    // Simple deterministic toy version for visualization
    const delta0 = 0.22;
    const b1 = 0.70;
    const b2 = 0.45;
    const b3 = 0.55;
    const d = delta0 + b1 * F + b2 * S + b3 * (F * S);
    return clamp(d, 0, 1);
  }

  let state = { F: 0.42, S: 0.31 };

  function stepState() {
    // Gentle drift
    const jitter = () => (Math.random() - 0.5) * 0.06;
    state.F = clamp(state.F + jitter(), 0.05, 0.95);
    state.S = clamp(state.S + jitter(), 0.05, 0.95);
    const D = computeD(state.F, state.S);

    if (ft) ft.textContent = state.F.toFixed(2);
    if (st) st.textContent = state.S.toFixed(2);
    if (dt) dt.textContent = D.toFixed(2);
  }

  function drawTrend() {
    if (!trendCanvas) return;
    const ctx = trendCanvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const cssW = trendCanvas.clientWidth || 1;
    const cssH = trendCanvas.clientHeight || 120;

    // Keep CSS size stable; scale internal buffer only
    trendCanvas.width = Math.floor(cssW * dpr);
    trendCanvas.height = Math.floor(cssH * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const w = cssW;
    const h = cssH;

    const theme = themeRoot.getAttribute("data-theme") || "dark";
    const gridColor = theme === "light" ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)";
    const lineColor = theme === "light" ? "rgba(11,166,196,0.95)" : "rgba(46,233,255,0.95)";
    const fillColor = theme === "light" ? "rgba(11,166,196,0.14)" : "rgba(46,233,255,0.14)";

    // grid
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const y = (h * i) / 5;
      ctx.strokeStyle = gridColor;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // curve points
    const N = 60;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      // "exposure" grows nonlinearly, social feedback follows slower
      const F = clamp(0.15 + 0.85 * (1 - Math.exp(-2.4 * t)), 0, 1);
      const S = clamp(0.08 + 0.70 * (1 - Math.exp(-1.6 * t)), 0, 1);
      const D = computeD(F, S);
      const x = t * (w - 2) + 1;
      const y = (1 - D) * (h - 2) + 1;
      pts.push({ x, y });
    }

    // fill
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, h - 1);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, h - 1);
    ctx.closePath();
    ctx.fill();

    // line
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // current point marker (from live state)
    const Dnow = computeD(state.F, state.S);
    const xNow = clamp(state.F, 0, 1) * (w - 2) + 1;
    const yNow = (1 - Dnow) * (h - 2) + 1;

    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(xNow, yNow, 4.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    stepState();
    drawTrend();
  }

  // Redraw on resize
  window.addEventListener("resize", () => drawTrend());

  // Start
  drawTrend();
  setInterval(loop, 1200);
})();
