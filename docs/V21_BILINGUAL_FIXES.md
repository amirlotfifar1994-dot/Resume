# V21 — Bilingual (EN / IT / FA) bug fixes

## Landing page
`index-*.html` already splits the entry point into **Academic résumé** and **Professional résumé**
(V17–V20). What was broken was the way back and forth between the pages:

- The floating "Home" link on `academic*.html` always pointed to `index.html` (Persian) and was never translated.
  It now follows the active language (`index-en/it/fa.html`) and is localized.
- The academic pages had no link to the professional résumé. A second link ("Professional résumé" /
  "Curriculum professionale" / «رزومه شغلی») was added next to Home, also language-aware.

## Persian (FA)
- ~814 strings in `i18n/*.fa.json` were mapped to a generic filler sentence
  («این بخش نکات اصلی را با بیان فارسی رسمی و روان توضیح می‌دهد.» and similar) instead of a real translation.
  All were replaced with actual Persian translations (mostly detail pages, dashboards, book/PWA/course descriptions).
- ~300 more strings were "translated" to themselves (English kept as the value): labels, headings, list items,
  dashboard/table headings. Translated.
- ~190 headings/labels that appeared only in detail pages were added to `index.details.fa.json`.
- Person names (faculty, speakers) and technical terms (EEG, NumPy, GitHub…) intentionally stay in Latin script.

## Italian (IT)
- Fixed stray top-level key in `i18n/index.it.json` (outside `text`, so it was never used).
- Added missing strings (tagline, affiliations, "Payroll", "Attendance", OSF label…).
- PFC / HRV / DEAP / Theori / EMERGE / THINK-360 dashboards: ~200 missing strings added for both FA and IT.

## `assets/i18n.js`
- Detail pages build "fold" summaries from the first paragraph truncated to 170 chars + "…".
  That text never matched a dictionary key, so it stayed English in Persian. Summaries are now rebuilt from the
  translated body after each translation pass (and restored on switching back to English).
- The page header tagline (outside `#main-content`) is now translated too.
- Home / Professional links updated on every language change.
- Cache-busters bumped (`i18n.js?v=20260920-03`, JSON `…-v21-bilingual-fixes-b`).

## Known limits
- `kavian-hr/` (attendance/payroll app) is Persian-only by design (Solar Hijri calendar, Persian payroll data).
  The EN/IT professional pages now label its links "(Persian interface)" / "(interfaccia in persiano)".
- Wording of the ~1,300 new Persian/Italian strings should get one human read-through, especially inline fragments
  in detail pages that sit between `<strong>`/`<a>` elements.

## Follow-up (same day)
- Added a **Software & product projects** block to the Dashboards tab of all four academic pages
  (Gold Shop Accounting PWA, Kavico Payroll Platform, Assessment MVP, Kavian PVD Management System), EN/IT/FA,
  with a language-aware link to the professional résumé. Wording follows the professional page (no production claims).
- `i18n.js`: switching directly FA <-> IT left the previous language on screen (dictionaries are keyed by English);
  the English source is now restored first.
- Persian page titles: `index/hrv/theori .fa.json` had the literal title "title"; deap/emerge/pfc/think360 had mixed
  Persian/Italian titles. All fixed.
- `academic-fa.html` was pre-translated in its header/hero, so clicking EN kept the Persian header and tabs.
  It is now English-source like the IT page and translated at load.

## Follow-up 2 — dashboards' "back to CV" + more Persian cleanup
- The floating "← Back to CV" link on the dashboards (deap/hrv/pfc/emerge/theori/think360) was static Persian in
  `index-fa.html` and always pointed to a fixed academic page. It is now English source, localized (EN/IT/FA) and
  points to `academic-<lang>.html` for the active language.
- ~730 further Persian dictionary values were half-machine word-swaps (e.g. «Active resistance تا persuasive content»,
  «اپلیکیشنs»); retranslated. Leftover Latin in Persian text is now limited to technical terms and people's names.
- `i18n.js`: fold-summary rebuild no longer strips ZWNJ (half-space) from Persian.

## Follow-up 3
- Professional résumé (EN/IT/FA): added NeuroVerse (brain atlas, from Asli\Brain, v0.24) and EngBook picture-based English app (from Asli\Eng, v1.27) to Product and software projects.
- Profile photo replaced (profile.jpg, cache-busted with ?v=20260920). Old photo is not kept in the project folder.

## Follow-up 4
- Professional résumé (EN/IT/FA): new sections 'Content production and book writing' (Your Mind Islands; See the Child in Play) and 'Website projects' (Kavico; Jajrood - local preview, not published).
- Errors fixed: think360 links pointed at index.html (landing) instead of the academic CV and are now language-aware; emerge dashboards had an unclosed div; professional.html was out of sync with professional-en.html; Persian book title unified to the manuscript title.
- Checked: all local links/assets, JS+resource errors on load for all 27 pages, and a language/tab/detail click-through on the academic page (no errors).

## Follow-up 5 — theme refresh (landing + professional pages)
- New `assets/theme.css` + `assets/theme.js` (loaded by `index*.html` and `professional*.html`): dark/light toggle (remembers choice,
  follows system preference), sticky section navigator with scroll-spy on the professional page (EN/IT/FA labels),
  reading-progress bar, back-to-top button, reveal-on-scroll, count-up stats, larger path cards on the landing
  (Academic / Professional first), card hover/focus polish, compact mobile top bar, print stylesheet.
- Respects `prefers-reduced-motion`. The academic CV keeps its own design.

## Follow-up 6 — phone menu
- Landing + professional pages: on phones the top bar is a compact hamburger that opens a slide-in drawer (pages, page sections with
  scroll-spy, language, theme). RTL-aware, closes on Esc / overlay / link, focus is trapped while open.
- Academic CV (all 4 files): new `assets/academic-mobile.css/js`. On phones the fixed header no longer covers the content (it was only padded on >=769px);
  tabs, Home/Professional links and language switch moved into the same kind of drawer.

## Follow-up 7 — self-hosted fonts + GitHub prep
- Fonts (Inter, Playfair Display, Lora, JetBrains Mono, Vazirmatn; latin / latin-ext / arabic) are now in `assets/fonts/`
  (`fonts.css` + 15 woff2 files, ~520 KB). All Google Fonts links/imports were replaced; no external font requests remain.
- SheetJS (`xlsx.full.min.js`) for the kavian-hr demo is now local (`kavian-hr/vendor/`), so the site has no external scripts.
- Added README.md, THIRD_PARTY_NOTICES.md, .gitignore, .gitattributes, .nojekyll; moved dev notes to `docs/`.
- Local git repo initialised on branch `main` (files staged, nothing committed).
