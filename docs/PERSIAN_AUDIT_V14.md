# Persian Localization Audit — v14 Check

## Result
The v13 package was **not fully Persian-complete**. The infrastructure for Persian exists, but the coverage is incomplete for the main CV content.

## What is OK
- `fa` is registered as a supported language in the shared i18n runtime.
- All 16 Persian JSON files parse successfully.
- Every Italian JSON module has a matching Persian JSON module with the same key count.
- The main CV and the dashboard folders contain `index-fa.html` entry pages.
- The Persian detail dictionary exists as `i18n/index.details.fa.json`.
- Technical names such as EEG, HRV, PFC, DEAP, ORCID, OSF, GitHub, formulas and citations are intentionally preserved in Latin.

## Issues found in v13
1. **Persian entry pages did not reliably open in Persian mode.**
   - The shared runtime defaulted to `localStorage.cv_lang || "en"`.
   - Therefore `index-fa.html` could still load as EN/IT depending on previous browser state.

2. **Persian typography was not consistently enforced when FA was selected from the original pages.**
   - Some pages had inline Persian font CSS, but the original pages relied on the existing English/Italian font stack.

3. **The main CV still has many English visible strings not covered by the Persian dictionaries.**
   - Audit file: `qa/untranslated_visible_text_candidates.csv`.
   - Count: 2057 English-like unmatched visible text candidates across static HTML.
   - Most are in `index.html` and include transcript/course cards, quantitative education details, project card body text, publication sub-card text, and long detail paragraphs.

4. **Some Persian translations are present but need editorial polishing.**
   - Examples include mixed labels such as `پژوهش Interests` and `شناختی & علوم اعصاب عاطفی`.
   - These should be rewritten with natural Persian equivalents.

5. **Persian detail HTML files do not exist under `i18n/details/`.**
   - This is not fatal because Persian detail translation is routed through `index.details.fa.json`, but only strings that match the dictionary are translated.

## Fixes applied in this v14 work copy
- Persian `index-fa.html` pages now force `fa` mode regardless of previous saved language.
- Runtime now injects Vazirmatn typography when FA is selected from any page.
- The i18n normalizer now also matches labels with decorative emoji/icons removed, improving translation coverage for headings/cards.
- `FA` is marked active on Persian entry pages.
- Added `qa/untranslated_visible_text_candidates.csv` for the remaining strings that still require proper Persian translations.

## Next required step for true full Persian completion
Complete a manual Persian translation pass for the remaining 2057 unmatched visible strings, with priority:
1. Education transcript/course cards and sub-cards.
2. Research project cards and detail pages.
3. Publication/output cards and detail pages.
4. Experience and skill sub-card descriptions.
5. Dashboard labels generated from embedded JS/app state.
