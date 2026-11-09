Test scripts used to check the site in a real headless browser (Playwright + Chromium).
They are for a developer, not needed to run the website. File paths inside them point to the folder
where they were run (/home/claude/proj/Calchub-pro-main/); edit those paths before reuse.

t1  loan calculators (EMI, Home, Car, Personal)      t2  GST, interest, P&L, percentage, discount, average, BMI
t3  Basic calculator + BMI boundaries                t4  Trigonometry (all sections)
t5  Age / Birthday / Date Difference in 3 time zones t6  Basic, Scientific, homepage mini-calculators
t7  all pages load, consent banner, date diff, P&L, average, discount
t8  GST slab buttons + stale-result guard            t9  contact form with SIMULATED FormSubmit replies
a11y.js accessibility sweep                          contrast.js + contrast-analyze.py  real-pixel contrast measurement
safe-math-unit-tests.js  unit tests of safe-math.js
IMPORTANT: t9 uses simulated replies. It does NOT prove real email delivery.
