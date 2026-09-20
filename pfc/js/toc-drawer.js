(() => {
  const FAB_ID = "pfc-toc-fab";
  const DRAWER_ID = "pfc-toc-drawer";
  const OVERLAY_ID = "pfc-toc-overlay";
  const CLOSE_ID = "pfc-toc-close";
  const NAV_ID = "pfc-toc-nav";

  const groups = [
    {
      title: "Paper",
      items: [
        { id: "overview", label: "Overview" },
        { id: "concept-map", label: "Concept Map" },
        { id: "construct", label: "Construct" },
        { id: "paradigm", label: "Paradigm" },
      ],
    },
    {
      title: "Agenda & Tests",
      items: [
        { id: "agenda", label: "EEG-fMRI Agenda" },
        { id: "hypotheses", label: "Hypotheses" },
        { id: "charts", label: "Visualizations" },
      ],
    },
    {
      title: "Governance",
      items: [
        { id: "governance", label: "Governance" },
        { id: "limitations", label: "Limitations" },
      ],
    },
  ];

  const qs = (sel) => document.querySelector(sel);

  function safeGet(id) {
    return document.getElementById(id);
  }

  function isMac() {
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
  }

  function getHeaderOffset() {
    // There's a sticky header inside the app; keep a safe offset.
    return 96;
  }

  function scrollToSection(id) {
    const el = safeGet(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }

  function setOverlayVisible(visible) {
    const overlay = safeGet(OVERLAY_ID);
    if (!overlay) return;
    overlay.hidden = !visible;
  }

  function openDrawer() {
    const drawer = safeGet(DRAWER_ID);
    const fab = safeGet(FAB_ID);
    if (!drawer || !fab) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    fab.setAttribute("aria-expanded", "true");
    setOverlayVisible(true);
  }

  function closeDrawer() {
    const drawer = safeGet(DRAWER_ID);
    const fab = safeGet(FAB_ID);
    if (!drawer || !fab) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    fab.setAttribute("aria-expanded", "false");
    setOverlayVisible(false);
  }

  function toggleDrawer() {
    const drawer = safeGet(DRAWER_ID);
    if (!drawer) return;
    drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
  }

  function buildNav() {
    const nav = safeGet(NAV_ID);
    if (!nav) return;

    nav.innerHTML = "";
    for (const group of groups) {
      const groupEl = document.createElement("div");
      groupEl.className = "pfc-toc-group";

      const title = document.createElement("div");
      title.className = "pfc-toc-group-title";
      title.textContent = group.title;
      groupEl.appendChild(title);

      for (const item of group.items) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pfc-toc-item";
        btn.dataset.sectionId = item.id;

        const label = document.createElement("span");
        label.textContent = item.label;

        const dot = document.createElement("span");
        dot.className = "pfc-toc-dot";
        dot.setAttribute("aria-hidden", "true");

        btn.appendChild(label);
        btn.appendChild(dot);

        btn.addEventListener("click", () => {
          scrollToSection(item.id);
          // Close on small screens for sanity.
          if (window.matchMedia("(max-width: 1024px)").matches) closeDrawer();
        });

        groupEl.appendChild(btn);
      }

      nav.appendChild(groupEl);
    }
  }

  function getSectionEls() {
    const ids = groups.flatMap(g => g.items.map(i => i.id));
    return ids.map(id => safeGet(id)).filter(Boolean);
  }

  function updateActive() {
    const sectionEls = getSectionEls();
    if (!sectionEls.length) return;

    const markerY = window.scrollY + getHeaderOffset() + 80;
    let current = sectionEls[0].id;

    for (let i = sectionEls.length - 1; i >= 0; i--) {
      const el = sectionEls[i];
      if (el.offsetTop <= markerY) {
        current = el.id;
        break;
      }
    }

    const buttons = document.querySelectorAll(".pfc-toc-item");
    buttons.forEach((b) => {
      const id = b.getAttribute("data-section-id");
      b.classList.toggle("is-active", id === current);
    });
  }

  function throttle(fn, wait) {
    let last = 0;
    let t = null;
    return (...args) => {
      const now = Date.now();
      const remaining = wait - (now - last);
      if (remaining <= 0) {
        if (t) {
          clearTimeout(t);
          t = null;
        }
        last = now;
        fn(...args);
      } else if (!t) {
        t = setTimeout(() => {
          last = Date.now();
          t = null;
          fn(...args);
        }, remaining);
      }
    };
  }

  function init() {
    const fab = safeGet(FAB_ID);
    const overlay = safeGet(OVERLAY_ID);
    const close = safeGet(CLOSE_ID);

    if (!fab || !overlay || !close) return;

    buildNav();

    fab.addEventListener("click", toggleDrawer);
    overlay.addEventListener("click", closeDrawer);
    close.addEventListener("click", closeDrawer);

    // Keyboard: Ctrl+K (Cmd+K on Mac) toggles.
    window.addEventListener("keydown", (e) => {
      const hotkey = (isMac() ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k";
      if (hotkey) {
        e.preventDefault();
        toggleDrawer();
      }
      if (e.key === "Escape") closeDrawer();
    });

    const onScroll = throttle(updateActive, 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", throttle(updateActive, 200), { passive: true });

    // The React app renders sections after hydration; poll a bit until the ids exist.
    let tries = 0;
    const poll = setInterval(() => {
      tries++;
      const ok = getSectionEls().length >= 3;
      updateActive();
      if (ok || tries > 30) clearInterval(poll);
    }, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
