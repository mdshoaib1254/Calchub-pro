#!/usr/bin/env node
/**
 * CalcHub Pro — internal link & asset checker.
 * Usage:  node link-check.js
 * Walks every .html file in the project root, extracts every internal
 * href/src, and verifies the target exists on disk. Exits 1 on failure.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
const REQUIRED_ASSETS = ['styles.css', 'calc-core.js', 'logo.png', 'favicon.ico',
                         'robots.txt', 'sitemap.xml', 'ads.txt', 'CNAME'];

let pass = 0, fail = 0;
const problems = [];

function resolveTarget(href) {
  let t = href.split('#')[0].split('?')[0];
  if (t === '') return null;                 // pure anchor
  if (/^(https?:|mailto:|tel:)/i.test(t)) return null; // external
  t = t.replace(/^\.\//, '').replace(/^\//, '');
  if (t.endsWith('/')) t += 'index.html';    // directory URL
  return t;
}

console.log('── Internal links ──');
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]);
  const anchors = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));

  for (const ref of new Set(refs)) {
    // same-page anchor: verify the id exists
    if (ref.startsWith('#')) {
      const id = ref.slice(1);
      if (anchors.has(id)) { pass++; }
      else { fail++; problems.push(`${file}: dead anchor ${ref}`); }
      continue;
    }
    const target = resolveTarget(ref);
    if (target === null) { pass++; continue; }
    if (fs.existsSync(path.join(ROOT, target))) { pass++; }
    else { fail++; problems.push(`${file}: MISSING → ${ref}  (expected ${target})`); }
  }
}
console.log(`  ${pass} OK, ${fail} broken`);

console.log('── Required assets ──');
for (const a of REQUIRED_ASSETS) {
  const ok = fs.existsSync(path.join(ROOT, a)) && fs.statSync(path.join(ROOT, a)).size > 0;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${a}`);
  ok ? pass++ : (fail++, problems.push(`missing/empty asset: ${a}`));
}

console.log('── Sitemap ──');
if (fs.existsSync(path.join(ROOT, 'sitemap.xml'))) {
  const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const locs = [...sm.matchAll(/<loc>https:\/\/calchubpro\.in\/([^<]*)<\/loc>/g)].map(m => m[1]);
  for (const loc of locs) {
    const target = resolveTarget(loc === '' ? 'index.html' : loc);
    const ok = fs.existsSync(path.join(ROOT, target));
    if (ok) pass++; else { fail++; problems.push(`sitemap lists /${loc} but ${target} is not in this project`); }
  }
  console.log(`  ${locs.length} URLs checked`);
}

console.log('\n── SEO head fields ──');
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const has = {
    title: /<title>[^<]{10,}<\/title>/.test(html),
    desc: /name="description" content="[^"]{30,}"/.test(html),
    canonical: /rel="canonical" href="https:\/\/calchubpro\.in/.test(html),
    h1: /<h1[\s>]/.test(html),
  };
  const bad = Object.entries(has).filter(([, v]) => !v).map(([k]) => k);
  if (bad.length === 0) { pass++; console.log(`  PASS  ${file}`); }
  else { fail++; problems.push(`${file}: missing ${bad.join(', ')}`); console.log(`  FAIL  ${file} — missing ${bad.join(', ')}`); }
}

console.log(`\n═══ ${pass} passed, ${fail} failed ═══`);
if (problems.length) {
  console.log('\nProblems:');
  problems.forEach(p => console.log('  • ' + p));
}
process.exit(fail ? 1 : 0);
