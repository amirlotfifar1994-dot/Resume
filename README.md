# Amirmohammad Lotfifar — trilingual résumé site

A static, framework-free résumé site in **Persian (FA), English (EN) and Italian (IT)** with two paths:

| Path | Pages |
|---|---|
| Landing | `index.html` (= Persian), `index-fa.html`, `index-en.html`, `index-it.html` |
| Academic CV | `academic.html` (= English), `academic-en.html`, `academic-it.html`, `academic-fa.html` |
| Professional résumé | `professional.html` (= English), `professional-en.html`, `professional-it.html`, `professional-fa.html` |
| Research dashboards | `deap/`, `hrv/`, `pfc/`, `emerge/`, `theori/`, `think360/` (each with `index.html` and `index-fa.html`) |
| Demo app | `kavian-hr/` (attendance/payroll demo, Persian interface) |

No build step, no dependencies: plain HTML, CSS and JavaScript.

## Run locally

```bash
python -m http.server 8000
# open http://localhost:8000/
```

(Any static server works. Opening the files with `file://` will not load the translation JSON.)

## Deploy on GitHub Pages

1. Push this folder to a repository (the site works from the repository root).
2. **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`**.
3. The site is served at `https://<user>.github.io/<repo>/`. All links are relative, so a sub-path is fine.

`.nojekyll` is included so GitHub does not process the files with Jekyll.

## How it is organised

```
assets/
  theme.css, theme.js            landing + professional pages: dark mode, section nav, mobile menu
  academic-mobile.css / .js      academic CV: compact header and phone menu
  i18n.js                        runtime translation (English source text -> FA / IT dictionaries)
  fonts/                         self-hosted fonts (fonts.css + woff2 files)
  media/                         images
i18n/                            translation dictionaries (index.*.json, per-dashboard *.fa/it.json)
  details/                       full Italian HTML for the academic detail pages
docs/                            development notes and QA reports (not needed for hosting)
```

Translation model: pages contain English text; `assets/i18n.js` swaps it using the dictionaries in `i18n/`
(the language is remembered in `localStorage`, and the `index-*.html` / `academic-*.html` files pin a language).
If you change English text on a page, the matching key in the dictionaries must be updated too.

## Fonts

Fonts are self-hosted (no requests to Google): Inter, Playfair Display, Lora, JetBrains Mono and Vazirmatn,
all under the SIL Open Font License 1.1. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Before publishing publicly

- `kavian-hr/` embeds sample attendance data with employee names. Replace or anonymise it if it is real data.
- `profile.jpg` and the résumé text are personal content. Add the license you want for them.

---

## فارسی

سایت رزومه‌ی سه‌زبانه (فارسی، انگلیسی، ایتالیایی) بدون فریم‌ورک و بدون مرحله‌ی build.
برای اجرا: `python -m http.server 8000` و باز کردن `http://localhost:8000/`.
برای GitHub Pages: مخزن را بسازید، فایل‌ها را در ریشه قرار دهید و در **Settings → Pages** شاخه‌ی `main` و پوشه‌ی root را انتخاب کنید.
قلم‌ها (اینتر، پلی‌فر، لورا، جت‌برینز مونو و وزیرمتن) داخل پروژه در `assets/fonts` هستند.
