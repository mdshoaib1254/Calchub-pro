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

/* ═══════════════════════════════════════════════════════════════
   PRESENTATION LAYER  —  added with the premium redesign.
   Strictly visual: scroll reveals and a restrained pointer tilt.
   It reads the DOM and writes classes/custom properties only. It
   never touches calculator state, inputs, results or validation,
   and if any of it fails the page is simply static — every element
   is visible by default and only becomes animatable once this
   script has confirmed browser support.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── Scroll reveals ──────────────────────────────────────────
     The opt-in class goes on <html> only when IntersectionObserver
     exists and motion is welcome, so the hidden-then-revealed CSS
     can never strand content on an unsupported browser. */
  function initReveals() {
    if (reduced || !('IntersectionObserver' in window)) return;

    var staggerSel = '.tgrid, .popular-grid, .trust-inner, .why-feats, .related-grid, .use-case-grid, .cta-chips';
    var revealSel = '.tools-hdr, .calc-head, .calc-wrap, .why-wrap > div, .faq-section > div, .cta-box, .faq-item, .calc-box, .res-card, .example-card, .table-wrap';

    var targets = [];

    document.querySelectorAll(staggerSel).forEach(function (el) {
      el.setAttribute('data-reveal-stagger', '');
      targets.push(el);
    });

    document.querySelectorAll(revealSel).forEach(function (el) {
      if (el.hasAttribute('data-reveal-stagger')) return;
      el.setAttribute('data-reveal', '');
      targets.push(el);
    });

    if (!targets.length) return;

    document.documentElement.classList.add('js-reveal');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    targets.forEach(function (el) {
      // Anything already on screen at load is revealed immediately, so
      // nothing above the fold waits on a scroll that may never happen.
      var top = el.getBoundingClientRect().top;
      if (top < window.innerHeight) el.classList.add('revealed');
      else io.observe(el);
    });
  }

  /* ── Pointer tilt ────────────────────────────────────────────
     A maximum of 4 degrees, written as custom properties and read
     back by a CSS rule. Desktop pointers only. */
  function initTilt() {
    if (reduced || !finePointer) return;

    var MAX = 4;
    var cards = document.querySelectorAll('.tc, .ts-item, .wf, .rel-card, .uc-card');

    cards.forEach(function (card) {
      var frame = null;

      card.addEventListener('pointermove', function (e) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = null;
          var r = card.getBoundingClientRect();
          if (!r.width || !r.height) return;
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.setProperty('--tx', (px * MAX).toFixed(2) + 'deg');
          card.style.setProperty('--ty', (-py * MAX).toFixed(2) + 'deg');
          card.classList.add('tilting');
        });
      });

      function release() {
        if (frame) { cancelAnimationFrame(frame); frame = null; }
        card.classList.remove('tilting');
        card.style.removeProperty('--tx');
        card.style.removeProperty('--ty');
      }

      card.addEventListener('pointerleave', release);
      card.addEventListener('pointercancel', release);
      // Keyboard users get the plain CSS hover lift, never a tilt.
      card.addEventListener('blur', release, true);
    });
  }

  function init() {
    try { initReveals(); } catch (e) { document.documentElement.classList.remove('js-reveal'); }
    try { initTilt(); } catch (e) { /* decoration only — never block the page */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
