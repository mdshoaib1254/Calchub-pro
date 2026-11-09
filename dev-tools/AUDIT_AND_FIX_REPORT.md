# CalcHub Pro – Final Audit & Fix Report (31 October 2026)

**Nothing has been deployed.** The live site https://calchubpro.in/ is still the old version (confirmed, see section 2). This report covers the improved copy in `CalcHubPro-improved.zip`. AdSense approval is **not** promised.

## 1. How to read the test claims
- **Local test** = run in a headless Chromium browser against the files in this ZIP, on my build machine.
- **Live check** = fetched from the real website. My live checks were limited (section 2).
- Nothing is marked "passed" unless it was run. Email delivery is **NOT verified** (section 9).

## 2. Live-site verification (what I could and could not do)
Done (read-only fetches of the live HTML, no JavaScript executed):
- Homepage, GST calculator page and sitemap.xml were fetched. **They are the old version**: "18+" / "All 17 Calculators", GST slabs 5/12/18/28%, visible raw formula code (`$\frac…$`), "Zero Data Collection", "ICMR", links to `/index.html`, "All systems operational & client-side verified", old cookie banner. This matches what my audit found in the ZIP you uploaded.
- Live sitemap lists 24 URLs, identical to the local one (only the dates differ; local is updated to 2026-10-31).
Not possible with my tools: live robots.txt (fetch refused), HTTP status codes and redirects, response headers/caching, live JavaScript behaviour, Google Analytics/AdSense actually firing, real mobile devices, Google Search Console data, whether Google has indexed anything, and the two outside links I added in the Privacy Policy (google.com/settings/ads, aboutads.info) were not fetched.
**Therefore: live-site behaviour of the NEW version is unverified until you deploy it. After deploying, repeat the checks in section 12.**

## 3. Content-quality audit, calculator by calculator
All 18 pages were read and their examples recomputed independently (Python) and compared with the live calculators.

| Calculator | Issues found | Fixed |
|---|---|---|
| EMI | Worked example total/interest wrong by ₹5; unsourced fee percentages; unsourced "3–4 years / nearly doubles" tips; related-card text promised tax estimates | Recomputed (₹12,60,112 / ₹2,60,112); fee % removed; tips replaced by computed examples (₹48L 20y 8.75%: ~3.3 yrs and ~₹10 lakh saved; ₹10L 8.5%: ₹7.7L vs ₹14.2L interest); rounding note |
| Home Loan | Example EMI/interest/tenure table all wrong (e.g. EMI ₹42,437 vs real ₹42,418); "3.5 years" wrong (3.3); "official RBI standard" claim; hard-coded tax figure; tax FAQ stated as certain | Whole example and table recomputed; claims reworded; tax figure removed; tax text general only (section 7) |
| Car Loan | Unsourced depreciation %, "5-year most common", GST statement too absolute; interest ₹1 off | Fixed/softened |
| Personal Loan | Example factor/EMI/total off; invented rate bands (10.5–13%, 11–18%), FOIR %, "cuts interest 50%", "Fortune 500" claim | Recomputed; invented numbers removed; replaced by computed 2y vs 5y example |
| GST | Outdated slabs (12%/28%); octroi claim; no limits section | Slabs 0/5/18/40% (from 22 Sep 2025); IGST vs CGST/SGST labelled; limits section added |
| Simple Interest | Overbroad usage claims; no unit notes | Reworded; months→years note added |
| Compound Interest | Misattributed Einstein quote; "zero risk"; daily figure ₹1 off | Removed/fixed |
| Profit & Loss | Cost 0/empty accepted; Profit % and Markup identical but unexplained | Validation fixed; notes and limitations added |
| Percentage | No limits section | Added (zero base, 100→120→96, percentage points) |
| Discount | "Saved" mixed tax in | Fixed; notes added |
| Average | `$n$` formula leftovers; invalid entries ignored; "1,500" ambiguity | Fixed; limits section; comma-number rejected with message |
| Basic / Scientific | Thin; % key behaviour undocumented | Sections added; evaluator replaced |
| Trigonometry | Read through; identities and examples correct | No change needed |
| Age | No accuracy notes | Added (leap day, device date) |
| Birthday | Zodiac text presented without caveat | Entertainment note added |
| Date Difference | Negative-days bug; "business days" overstated; visa claim | Fixed; labels and limits corrected |
| BMI | ICMR attribution unsupported; "muscle 18% denser" unsupported; static values disagreed with live | Fixed (section 6) |
Pages that are still comparatively short (Basic, Scientific, Percentage, Average at ~600–800 words) are short because the tools are simple; I added only genuine material, no filler.

## 4. Structured data and alt text
- 19 JSON-LD blocks, all valid JSON. Types in use: WebSite, Organization, WebApplication (calculator pages), BreadcrumbList, FAQPage. No ratings, reviews, prices other than free, or author credentials anywhere.
- Fixed: homepage feature list lacked Trigonometry (17 → 18); FAQ answers in schema now match visible answers on every page (checked programmatically); two FAQ texts used "x" instead of "×".
- Left as is: breadcrumb middle step ("Finance Calculators") points to `/#directory` because there are no category pages; schema matches the visible breadcrumb. Google no longer shows FAQ rich results for most sites, so FAQPage markup is harmless but gives no visible benefit.
- Alt text: logo images are now `alt=""` (decorative; the visible text "CalcHub Pro" sits in the same link); founder photo has descriptive alt and size attributes. 0 images without alt.
- Added Twitter/X card tags and og:site_name to all pages; every title and description is unique; long titles/descriptions shortened.

## 5. Accessibility
Local tests (Chromium; desktop 1280px and mobile 375px):
- Real-pixel colour contrast measured on all 24 pages (desktop) and 6 key pages (mobile). Before: failures from pale text left over from an old dark theme and a light grey "dim" colour. After: **0 elements below WCAG AA** in the final run. Not measured: mobile contrast on the remaining 18 pages, and states such as hover/focus colours, and text on images.
- Keyboard: skip link added and tested; every tab stop on the 3 pages tested showed a visible focus ring; no keyboard-inaccessible click handlers found.
- Labels: all form fields now have a label or aria-label; FAQ buttons have aria-expanded; every page has one `<main>`; viewport zoom not blocked; no horizontal scrolling at 375px on any page.
- Target size: footer, breadcrumb links and checkboxes raised to 24px (WCAG 2.2 AA).
- **Not done:** no real screen-reader testing (NVDA/JAWS/VoiceOver/TalkBack), no real-device testing. Several pages jump from H2 to H4 (heading-level skips, low severity). The mobile cookie banner is tall (about a third of the screen) until dismissed.

## 6. BMI and Asian-Indian cut-offs
Verified with search: the 23–24.9 "overweight" and ≥25 "obese" Asian-Indian cut-offs come from the **2009 consensus statement by Misra et al., J Assoc Physicians India 2009;57:163–170** (PubMed 19582986), not from ICMR; the page previously credited ICMR, which I could not support, and that is removed everywhere. WHO categories (18.5 / 25 / 30) are unchanged. Documented limits on the page: the consensus describes normal as roughly 18–22.9 whereas this site starts at 18.5 to match WHO; a revised definition of obesity for Indians (2025) says BMI alone is not enough and adds waist measures and health conditions, which this calculator does not use; adults 18+ only; not for children or during pregnancy; not a diagnosis. I read search summaries and abstracts, not the full paper text, so please have a clinician confirm the wording if you want it authoritative.

## 7. Home Loan tax wording
Removed the fixed "₹3,50,000/yr" figure (it never changed with inputs) and every statement of a specific deduction amount or section as current fact. The page now says the calculator does not estimate tax, that eligibility depends on tax regime and the law in force, that provisions have *historically* applied mainly under the old regime, and to check with the Income Tax Department or a Chartered Accountant. I did not verify current-year provisions or the Income-tax Act 2025 section numbering; the text is deliberately general. Have a CA review it.

## 8. About page
Reduced to what the site itself can state: "CalcHub Pro was created by Suhaib", founder title, free calculators with formulas and worked examples, no signup, calculator inputs not stored. Removed: "independent software developer based in India", "Lead Developer", the personal backstory, performance and standards claims. I cannot verify the name, the photo or any biography; **you must confirm the name and photo are correct and public, and add only facts you are comfortable stating.** No qualifications were invented.

## 9. Contact form and FormSubmit – status
- Implemented with FormSubmit (https://formsubmit.co) to **calchubpro@gmail.com**. No key, password or secret anywhere.
- **FormSubmit is NOT activated and email delivery is NOT verified.** Local tests used simulated replies only (success, HTTP error, wrong reply, network failure, spam trap, instant submit, repeat submit, empty form): the form shows "Message sent" only for a confirmed success, otherwise an error plus your email address.
- Activation steps and the real delivery test checklist are in `SETUP_GUIDE.md`.
- Limits: no dashboard; spam protection is a hidden field, minimum time on page and one message a minute (CAPTCHA is off); your address is visible in the page source unless you swap in FormSubmit's alias.

## 10. SEO, links, sitemap, robots, canonical, legal pages (local checks)
- `dev-tools/check-site.js`: all checks pass – 18 calculator pages, 18 homepage cards (8/6/3/1), sitemap contains all 18 + 6 pages with no duplicates or /index.html URLs, titles unique, canonicals present, all internal links resolve, no 17/18+ wording, no raw formula text, no ICMR, no unsupported claims, skip link/twitter card/alt on every page, JSON-LD valid.
- External links: only fonts.googleapis.com / gstatic, the Google tag and AdSense script (all pages), plus two policy links in the Privacy Policy. Not fetched.
- robots.txt: removed the unsupported `Host:` line; `/dev-tools/` disallowed (note: it is public on GitHub Pages regardless). Sitemap dates updated.
- Legal pages rewritten to match the code: Analytics and AdSense scripts, Consent Mode (denied by default), Google Fonts, FormSubmit, local-storage key `ck_consent`. They state ads "may" appear; nothing claims ads are live. "Last updated" set to October 2026.
- Google Analytics: one tag, one ID, no duplicates in the code (see SETUP_GUIDE.md). Reported numbers will be lower because tracking waits for consent.
- Canonical homepage: links now use `/`. GitHub Pages cannot do a server redirect from /index.html; the canonical tag covers it.

## 11. Test results (local)
| Test | Result |
|---|---|
| All 24 pages load, no JavaScript errors, consent banner shows | Pass |
| EMI, Home, Car, Personal loan (default + edge cases) | Pass; values match independent calculation |
| GST (exclusive/inclusive, all slab buttons by real clicks) | Pass |
| Simple and Compound interest (annual, monthly, daily) | Pass |
| Profit & Loss, Percentage, Discount, Average | Pass after fixes |
| BMI metric/imperial/boundaries | Pass after restoring a label I briefly broke and the regression test caught |
| Trigonometry (main, inverse, right triangle, sine/cosine rules) | Pass |
| Age, Birthday, Date Difference (leap days, 3 time zones) | Pass |
| Basic and Scientific via new parser (71/74 unit checks; the 3 misses were wrong expectations in my tests; 24 browser checks) | Pass |
| Stale-result dimming, consent save/reload | Pass |
| Contact form with simulated replies | Pass (real delivery unverified) |
| Script diff against the original | Only intended changes |
Not tested: the original Scientific calculator (its math library needed internet); Safari/Firefox/real phones; heavy-use performance.

## 12. Manual actions that remain for you
1. **Confirm the About page**: name, photo, and whether to add a short bio of your own.
2. **Have a Chartered Accountant read the Home Loan and GST wording** (and a clinician the BMI page, if you want it authoritative).
3. **Review the legal pages** once (Privacy, Terms, Disclaimer); they reflect the code, not legal advice.
4. **Deploy only when you decide** (SETUP_GUIDE.md Part 3), keep a copy of the old site first.
5. **After deploying:** activate FormSubmit and complete the full delivery test checklist (SETUP_GUIDE.md Part 1).
6. **Verify live:** open every page on your phone, check the consent banner appears and Decline works, check Google Analytics Realtime shows one visit per visit, and open https://calchubpro.in/robots.txt and sitemap.xml.
7. **Google Analytics:** check there is only one web data stream; schedule the weekly report (SETUP_GUIDE.md Part 2); note lower numbers after the consent change.
8. **Google Search Console:** resubmit the sitemap and use URL inspection on the home page and a calculator page.
9. **AdSense:** once approved, enable Google's consent message for EU/UK traffic; then reread your Privacy Policy so it still matches.
10. **Before requesting a new AdSense review:** read a few calculator pages as a visitor and ask whether each is genuinely useful. I cannot promise approval.
11. Optional later: real screen-reader test, check the 18 pages' contrast on mobile, consider a few useful guide articles if you want more original content.
