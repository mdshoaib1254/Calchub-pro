/**
 * CalcHub Pro – Core Client Scripts
 * Handles navigation, mobile drawer, formatting, FAQ accordion, and UI helpers
 * https://calchubpro.in/
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sticky navigation shadow
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('stuck', window.scrollY > 20);
    });
  }

  // Close drawer on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
});

// Mobile menu toggles
function toggleDrawer() {
  const d = document.getElementById('drawer');
  const h = document.getElementById('hbg');
  if (!d || !h) return;
  const isOpen = d.classList.toggle('open');
  h.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeDrawer() {
  const d = document.getElementById('drawer');
  const h = document.getElementById('hbg');
  if (!d) return;
  d.classList.remove('open');
  if (h) h.classList.remove('open');
  document.body.style.overflow = '';
}

// FAQ Accordion
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  if (!item) return;
  const isOpen = item.classList.contains('open');
  
  // Close other open FAQ items in the same container
  const container = item.closest('.faq-wrap') || document;
  container.querySelectorAll('.faq-item.open').forEach(i => {
    i.classList.remove('open');
    const q = i.querySelector('.faq-q');
    if (q) q.setAttribute('aria-expanded', 'false');
  });

  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

// Number formatting for currency & statistics
function formatINR(num, maxDecimals = 2) {
  if (isNaN(num) || num === null || num === undefined) return '0';
  const val = Number(num);
  return val.toLocaleString('en-IN', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: Number.isInteger(val) ? 0 : Math.min(2, maxDecimals)
  });
}

function formatNum(num, maxDecimals = 4) {
  if (isNaN(num) || num === null || num === undefined) return '0';
  const val = Number(num);
  return val.toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals
  });
}

/* ═══════════════════════════════════════════════════════════════
   SHARED CALCULATOR UTILITIES
   Small, dependency-free helpers shared by the homepage widget and
   the dedicated calculator pages. Keep this lean — no frameworks.
   ═══════════════════════════════════════════════════════════════ */

/** True only for real, finite numbers. Rejects NaN and ±Infinity. */
function isNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

/**
 * Read a numeric field. Returns null (never NaN) when empty or invalid,
 * so callers can branch on a single falsy check.
 */
function readNum(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const raw = String(el.value).trim();
  if (raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Show/clear an inline field error. Returns true when the field is OK. */
function setFieldError(inputId, errId, message) {
  const inp = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (message) {
    if (inp) { inp.classList.add('bad'); inp.setAttribute('aria-invalid', 'true'); }
    if (err) { err.textContent = message; err.classList.add('show'); }
    return false;
  }
  if (inp) { inp.classList.remove('bad'); inp.removeAttribute('aria-invalid'); }
  if (err) err.classList.remove('show');
  return true;
}

/**
 * Validate one numeric field against a range.
 * opts: { min, max, label, integer }
 */
function validateNum(inputId, errId, opts = {}) {
  const { min = null, max = null, label = 'value', integer = false } = opts;
  const v = readNum(inputId);
  if (v === null) return setFieldError(inputId, errId, `Please enter a valid ${label}.`) ? null : null;
  if (integer && !Number.isInteger(v)) return setFieldError(inputId, errId, `Please enter a whole ${label}.`) ? null : null;
  if (min !== null && v < min) return setFieldError(inputId, errId, `Please enter a ${label} of at least ${min}.`) ? null : null;
  if (max !== null && v > max) return setFieldError(inputId, errId, `Please enter a ${label} of ${max} or less.`) ? null : null;
  setFieldError(inputId, errId, null);
  return v;
}

/** Currency string that can never render NaN / Infinity / undefined. */
function formatCurrency(num, symbol = '₹') {
  if (!isNum(Number(num))) return '—';
  return symbol + formatINR(Number(num));
}

/** Safe general-purpose number output. */
function safeNum(num, decimals = 2) {
  const n = Number(num);
  if (!isNum(n)) return '—';
  return formatNum(n, decimals);
}

/** Parse a YYYY-MM-DD input as LOCAL midnight (avoids the UTC off-by-one). */
function parseLocalDate(value) {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  d.setHours(0, 0, 0, 0);
  if (d.getFullYear() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[3])) return null;
  return d;
}

/** Whole days between two local-midnight dates, DST-safe. */
function daysBetween(a, b) {
  if (!a || !b) return null;
  const ms = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
           - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  return Math.round(ms / 86400000);
}

/** Render a result block and move screen-reader focus to it. */
function showResult(containerId, html) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = html;
  el.style.display = 'block';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
}

/** Hide a result block and clear all error states inside a container. */
function resetCalc(containerId, fieldIds = []) {
  const el = document.getElementById(containerId);
  if (el) { el.style.display = 'none'; el.innerHTML = ''; }
  fieldIds.forEach(id => {
    const inp = document.getElementById(id);
    if (inp) { inp.value = ''; inp.classList.remove('bad'); inp.removeAttribute('aria-invalid'); }
  });
  document.querySelectorAll('.ferr.show').forEach(e => e.classList.remove('show'));
}
