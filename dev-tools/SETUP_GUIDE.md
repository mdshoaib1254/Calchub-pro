# CalcHub Pro – Setup Guide (contact form + weekly traffic reports)

## Part 1 – Contact & feedback form (FormSubmit)

### Why FormSubmit
| Option | Verdict |
|---|---|
| **FormSubmit** (chosen) | Free, no account, no API key or password anywhere in your code. Works on GitHub Pages. Submissions go to calchubpro@gmail.com. Documented as unlimited submissions. |
| EmailJS | Needs a public key in the page; the setting that restricts which websites may use it (domain allowlist) is only on paid plans (from about $9/month); free plan is 200 emails/month. |
| Formspree | Free plan is about 50 submissions/month and features such as webhooks are paid. |

Honest drawbacks of FormSubmit: no dashboard (your Gmail inbox is the record), no guaranteed uptime, spam protection on this setup is a hidden trap field + time/frequency checks (the visible CAPTCHA is off because the form sends in the background), and your email address is visible in the page source (optional fix in step 6). If it ever fails, the form shows an error and your email address, never a fake success.

### Status of email delivery: NOT VERIFIED
FormSubmit has **not** been activated with calchubpro@gmail.com, and no real message has been sent through it. All I could do was test the form's behaviour with **simulated** FormSubmit replies (success, server error, wrong reply, network failure, spam trap, instant submit, repeat submit, empty fields). **Real delivery is unproven until you complete the test below.** Do not treat the contact form as working before then.

### Exact activation steps
1. Upload the site (Part 3) and wait about 5 minutes. Do **not** test from a file on your computer: it only works from https://calchubpro.in/.
2. Open **https://calchubpro.in/contact.html**.
3. Fill every field with a clearly marked test, e.g. name "Test", your own other email as the sender, message "ACTIVATION TEST 1 - please ignore". Wait 5 seconds, press **Send Message**.
4. Open Gmail for **calchubpro@gmail.com**. Search the Inbox, **Spam** and **Promotions** for an email from FormSubmit asking you to activate the form. Click the activation button/link. (If nothing arrives within 15 minutes, check Gmail's "All Mail", then send step 3 again.)
5. After activation, wait 60 seconds (the form allows one message a minute), then send a second test: "ACTIVATION TEST 2".
6. Optional but recommended: if FormSubmit's activation email shows a random alias for your address, replace `calchubpro@gmail.com` inside `FORM_ENDPOINT` in `contact.html` with that alias (so the address is not readable in the page source), upload again, and repeat the delivery test.

### Real email delivery test procedure (tick every box)
- [ ] The page showed "Message sent" only after step 5 (and never for an empty or invalid form).
- [ ] TEST 2 arrived in calchubpro@gmail.com within a few minutes (check Spam too).
- [ ] The email shows the name, category, sender address and message text correctly.
- [ ] Pressing Reply in Gmail addresses the sender you typed.
- [ ] Send one test from your phone on mobile data, to confirm it works away from your home network.
- [ ] Try the form with Wi-Fi switched off: it must show "could not be sent" and your email address, not "sent".
- [ ] Only after all boxes are ticked may anyone say delivery is verified.
- [ ] Check Gmail Spam once a week for the first month. If a lot of junk arrives, tell me and we will add a CAPTCHA or change service.
Caveat: before activation FormSubmit may accept messages and hold them, so the form can say "sent" even though nothing reached your inbox. That is why activation comes before announcing the form.

## Part 2 – Google Analytics 4

### Check of your existing setup (done in the code)
- One Google tag per page, one ID (**G-DNLZJ1ZD02**), loaded once, with one `config` call. No Google Tag Manager, no second ID, no manual page_view events. **No duplicate tracking found in the website code.**
- The 404 page has no tracking (so broken-link visits are not counted). I left it that way.
- Change made earlier: tracking now waits for the visitor to click **Accept All** (Consent Mode). **Expect lower reported numbers than before**, because visitors who decline or ignore the banner are only partly counted (Google estimates some of the gap).

### Check outside the code (only you can do this)
1. analytics.google.com → Admin (gear) → **Data streams**. There should be **one** web stream for calchubpro.in with Measurement ID G-DNLZJ1ZD02. If you see two streams for the same site, delete the unused one.
2. Make sure no WordPress-style plugin, Google Tag Manager container or other Analytics code is also installed anywhere else for this site (GitHub Pages has none by default).
3. Open Reports → **Realtime**, visit your site, accept cookies, and confirm you appear once.

### Weekly emailed report to calchubpro@gmail.com
1. Sign in to Analytics with an account that has **Administrator** access to the property (the Schedule option is hidden otherwise). Ideally use calchubpro@gmail.com itself.
2. Left menu → **Reports** → **Acquisition** → **Traffic acquisition** (this shows visitors by source).
3. Top right, click **Share this report** → **Schedule email**.
4. Fill in: Name (e.g. "CalcHub Pro weekly traffic"), Recipients **calchubpro@gmail.com**, Frequency **Weekly**, Start date, "Active for" the longest option, Format **PDF**. Click **Save**/**Subscribe**.
5. Repeat for **Reports → Engagement → Pages and screens** (shows which calculators get visits).
6. To check or change them: **Admin → Property → Scheduled emails**.
Notes: schedules last at most 12 months, so renew them; recipients must have access to the property; Realtime reports cannot be scheduled.

## Part 3 – Uploading to GitHub (only when you decide to deploy)
**Nothing has been deployed.** The live site is still the old version. Before you upload, read the checklist in AUDIT_AND_FIX_REPORT.md under "Manual actions".
1. Unzip `CalcHubPro-improved.zip` on your computer.
2. Open your GitHub repository for the site → **Add file** → **Upload files**.
3. Drag in everything **inside** the `Calchub-pro-main` folder (keep the folders), then **Commit changes**.
4. Wait about 5 minutes, then open https://calchubpro.in/ and press Ctrl+F5 (or clear the cache on your phone).
5. In Google Search Console, resubmit https://calchubpro.in/sitemap.xml.
6. AdSense (after approval): turn on Google's consent message in Privacy & messaging for EU/UK visitors.
