#!/usr/bin/env node
/**
 * CalcHub Pro – site consistency check (read-only).
 * Run from the project folder:   node dev-tools/check-site.js
 * Compares every page against calculators.json (the single calculator list).
 * Exit code 0 = all checks passed, 1 = something needs attention.
 */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const inv = JSON.parse(fs.readFileSync(path.join(root, 'calculators.json'), 'utf8'));
const calcs = inv.calculators, N = calcs.length;
const SITE = 'https://calchubpro.in';
let fails = 0;
const ok = (m) => console.log('  PASS  ' + m);
const bad = (m) => { fails++; console.log('  FAIL  ' + m); };
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const pages = fs.readdirSync(root).filter(f => f.endsWith('.html'))
  .concat(calcs.map(c => c.slug + '/index.html').filter(f => fs.existsSync(path.join(root, f))));

console.log(`Inventory: ${N} calculators`);
const catCount = {}; calcs.forEach(c => catCount[c.category] = (catCount[c.category] || 0) + 1);
console.log('  Categories:', JSON.stringify(catCount));

console.log('\n[1] Every calculator page exists');
calcs.forEach(c => fs.existsSync(path.join(root, c.slug, 'index.html')) ? 0 : bad('missing ' + c.slug));
if (!fails) ok(`all ${N} calculator pages exist`);

console.log('\n[2] Sitemap');
const sm = read('sitemap.xml'); const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
calcs.forEach(c => { if (!locs.includes(`${SITE}/${c.slug}/`)) bad('sitemap missing ' + c.slug); });
if (new Set(locs).size !== locs.length) bad('duplicate sitemap URLs');
if (locs.some(l => /index\.html/.test(l))) bad('sitemap lists an /index.html URL');
if (!locs.includes(SITE + '/')) bad('sitemap missing homepage');
console.log(`  ${locs.length} URLs listed`);

console.log('\n[3] Titles, canonicals, counts, footers, links');
const titles = {};
pages.forEach(f => {
  const s = read(f), dir = path.dirname(f);
  const t = (s.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!t) bad(f + ': no <title>'); else (titles[t] = titles[t] || []).push(f);
  if (!/<meta name="description"/.test(s)) bad(f + ': no meta description');
  const can = (s.match(/rel="canonical" href="([^"]+)"/) || [])[1];
  if (!can && f !== '404.html') bad(f + ': no canonical');
  if (/\b17\+?\s+(free |online |dedicated )?(calculators?|tools?)/i.test(s)) bad(f + ': still says 17 calculators');
  if (/\b18\+\s+(free |online |dedicated )?(calculators?|tools?)/i.test(s)) bad(f + ': says "18+" instead of 18');
  if (/\beval\(|new Function\(|\bFunction\(/.test(s)) bad(f + ': uses eval/Function');
  if (/href="[^"]*index\.html/.test(s)) bad(f + ': links to /index.html instead of /');
  const slim = ['about.html','contact.html','privacy-policy.html','terms.html','disclaimer.html','404.html'].includes(f);
  if (slim) { if (!/href="\/#directory"/.test(s)) bad(f + ': nav missing link to /#directory'); }
  else if (f !== 'index.html') calcs.forEach(c => { if (!s.includes(`${c.slug}/"`)) bad(f + ': footer/nav missing ' + c.slug); });
  // --- content / SEO / accessibility guards ---
  const bodyNoScript = s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  if (/\$[^$\n<>]{1,60}\\[a-z]+|\\frac|\\times|\\div/.test(bodyNoScript)) bad(f + ': raw formula (LaTeX) code visible');
  if (/ICMR/.test(bodyNoScript)) bad(f + ': mentions ICMR (BMI cut-offs are from the 2009 consensus statement, not ICMR)');
  if (/\b12%[^<]{0,40}28%|5%, 12%, 18%/.test(bodyNoScript) && !/removed|no longer/.test(bodyNoScript)) bad(f + ': lists old 12%/28% GST slabs as current');
  if (!/class="skip-link"/.test(s)) bad(f + ': no skip link');
  if (f !== '404.html' && !/twitter:card/.test(s)) bad(f + ': no twitter:card');
  if (/Zero Data Collection|100% Private|free forever|Free Forever|Verified Formulas/.test(bodyNoScript)) bad(f + ': unsupported claim wording');
  [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].forEach(m => { try { JSON.parse(m[1]); } catch (e) { bad(f + ': invalid JSON-LD'); } });
  [...s.matchAll(/<img\b[^>]*>/g)].forEach(m => { if (!/\balt=/.test(m[0])) bad(f + ': image without alt'); });
  // internal links resolve
  [...s.matchAll(/(?:href|src)="([^"#?]+)/g)].map(m => m[1]).forEach(h => {
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(h)) return;
    const p = h.startsWith('/') ? path.join(root, h) : path.join(root, dir, h);
    if (!(fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html'))))) bad(f + ': broken link ' + h);
  });
});
Object.entries(titles).filter(([, v]) => v.length > 1).forEach(([t, v]) => bad('duplicate title "' + t + '" on ' + v.join(', ')));

console.log('\n[4] Homepage directory');
const home = read('index.html');
const grid = home.split('id="tools-grid"')[1] || '';
const cards = [...grid.matchAll(/<a\s[^>]*class="tc[^"]*"[^>]*>/g)].map(m => m[0]);
const hc = {}; cards.forEach(c => { const k = (c.match(/data-cat="([^"]+)"/) || [])[1]; hc[k] = (hc[k] || 0) + 1; });
console.log('  homepage cards:', cards.length, JSON.stringify(hc));
if (cards.length < N) bad(`homepage directory shows fewer than ${N} calculators`);
calcs.forEach(c => { if (!cards.some(x => x.includes(`href="${c.slug}/"`))) bad('homepage directory missing ' + c.slug); });

console.log(fails ? `\n${fails} problem(s) found` : '\nAll checks passed');
process.exit(fails ? 1 : 0);
