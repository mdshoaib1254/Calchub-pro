#!/usr/bin/env node
/**
 * CalcHub Pro — internal link & asset checker.
 * Usage:  node link-check.js
 *
 * Recursively walks every .html file in the project (root pages AND the
 * 17 calculator subdirectories), resolves every href/src relative to that
 * FILE's own directory (not always the project root — a page inside
 * /emi-calculator/ that links "../styles.css" must resolve relative to
 * /emi-calculator/, not to the root), and verifies the target exists.
 * Also validates cross-page anchor links (e.g. "../index.html#finance")
 * against the actual ids present in the TARGET page, not just checking
 * that the target file exists.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const REQUIRED_ASSETS = ['styles.css', 'calc-core.js', 'logo.png', 'favicon.ico',
                         'robots.txt', 'sitemap.xml', 'ads.txt', 'CNAME'];
const SKIP_DIRS = new Set(['original_backup', 'node_modules', '.git']);

function findHtmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      findHtmlFiles(path.join(dir, entry.name), out);
    } else if (entry.name.endsWith('.html')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

const htmlFiles = findHtmlFiles(ROOT);
const idsCache = new Map();

function idsOf(absPath) {
  if (idsCache.has(absPath)) return idsCache.get(absPath);
  let ids = new Set();
  if (fs.existsSync(absPath)) {
    const html = fs.readFileSync(absPath, 'utf8');
    ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
  }
  idsCache.set(absPath, ids);
  return ids;
}

let pass = 0, fail = 0;
const problems = [];

console.log('── Internal links (recursive, path-aware) ──');
for (const file of htmlFiles) {
  const fileDir = path.dirname(file);
  const rel = path.relative(ROOT, file);
  const html = fs.readFileSync(file, 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1]);
  const ownIds = idsOf(file);

  for (const ref of new Set(refs)) {
    if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(ref)) { pass++; continue; }

    const [pathPart, ...fragParts] = ref.split('#');
    const frag = fragParts.join('#') || null;

    if (pathPart === '') {
      if (frag && ownIds.has(frag)) { pass++; }
      else if (frag) { fail++; problems.push(`${rel}: dead same-page anchor #${frag}`); }
      else { pass++; }
      continue;
    }

    let targetPath = pathPart.startsWith('/')
      ? path.join(ROOT, pathPart)
      : path.join(fileDir, pathPart);
    if (pathPart.endsWith('/')) targetPath = path.join(targetPath, 'index.html');

    if (!fs.existsSync(targetPath)) {
      fail++;
      problems.push(`${rel}: MISSING -> ${ref}  (resolved to ${path.relative(ROOT, targetPath)})`);
      continue;
    }
    pass++;

    if (frag) {
      const resolvedFile = fs.statSync(targetPath).isDirectory() ? path.join(targetPath, 'index.html') : targetPath;
      const targetIds = idsOf(resolvedFile);
      if (targetIds.has(frag)) { pass++; }
      else { fail++; problems.push(`${rel}: dead cross-page anchor ${ref}  (no id="${frag}" on ${path.relative(ROOT, resolvedFile)})`); }
    }
  }
}
console.log(`  ${pass} OK, ${fail} broken so far`);

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
    let target = loc === '' ? 'index.html' : loc;
    if (target.endsWith('/')) target += 'index.html';
    const ok = fs.existsSync(path.join(ROOT, target));
    if (ok) pass++; else { fail++; problems.push(`sitemap lists /${loc} but ${target} is not in this project`); }
  }
  console.log(`  ${locs.length} URLs checked`);
}

console.log('\n── SEO head fields ──');
for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file);
  const html = fs.readFileSync(file, 'utf8');
  const has = {
    title: /<title>[^<]{10,}<\/title>/.test(html),
    desc: /name="description" content="[^"]{30,}"/.test(html),
    canonical: rel === '404.html'
      ? /name="robots" content="noindex/.test(html)
      : /rel="canonical" href="https:\/\/calchubpro\.in/.test(html),
    h1: /<h1[\s>]/.test(html),
  };
  const bad = Object.entries(has).filter(([, v]) => !v).map(([k]) => k);
  if (bad.length === 0) { pass++; console.log(`  PASS  ${rel}`); }
  else { fail++; problems.push(`${rel}: missing ${bad.join(', ')}`); console.log(`  FAIL  ${rel} -- missing ${bad.join(', ')}`); }
}

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
if (problems.length) {
  console.log('\nProblems:');
  problems.forEach(p => console.log('  - ' + p));
}
process.exit(fail ? 1 : 0);
