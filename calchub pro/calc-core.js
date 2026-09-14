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
