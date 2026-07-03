// ─── CSV UTILITY ───────────────────────────────────────────────────────────────
/**
 * Fetch and parse a CSV file. Returns an array of objects keyed by header row.
 * Handles quoted fields with commas inside.
 */
async function fetchCSV(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('CSV fetch failed: ' + path);
    const text = await res.text();
    return parseCSV(text);
  } catch (e) {
    console.warn('[fetchCSV]', e);
    return [];
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = splitCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim(); });
    return obj;
  });
}

function splitCSVLine(line) {
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { result.push(cur); cur = ''; }
    else cur += c;
  }
  result.push(cur);
  return result;
}

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
const themeBtn = document.getElementById('themeBtn');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeBtn.addEventListener('click', () => {
  document.body.classList.add('theme-transitioning');
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  setTimeout(() => document.body.classList.remove('theme-transitioning'), 500);
});

// ─── DROPDOWN ─────────────────────────────────────────────────────────────────
const navMore = document.getElementById('navMore');
const moreBtn = document.getElementById('moreBtn');

moreBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  navMore.classList.toggle('open');
});

document.addEventListener('click', () => navMore.classList.remove('open'));

// ─── CURSOR GLOW ──────────────────────────────────────────────────────────────
const glow = document.getElementById('cursorGlow');
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateGlow() {
  glowX += (mouseX - glowX) * 0.08;
  glowY += (mouseY - glowY) * 0.08;
  glow.style.left = glowX + 'px';
  glow.style.top = glowY + 'px';
  requestAnimationFrame(animateGlow);
}
animateGlow();

// ─── CARD RIPPLE ──────────────────────────────────────────────────────────────
function cardClick(card) {
  const ripple = document.createElement('div');
  ripple.classList.add('ripple');
  ripple.style.cssText = `width:${card.offsetWidth}px;height:${card.offsetWidth}px;left:0;top:0;`;
  card.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

// ─── INTERSECTION OBSERVER FOR CARD REVEAL ────────────────────────────────────
// Guarded — only runs if #grid1 / #grid2 exist (index.php)
const grid1 = document.getElementById('grid1');
const grid2 = document.getElementById('grid2');

if (grid1 || grid2) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.project-card');
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add('visible'), i * 70);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  if (grid1) observer.observe(grid1);
  if (grid2) observer.observe(grid2);
}

// ─── NAV ACTIVE STATE ─────────────────────────────────────────────────────────
// Set active based on current URL path
(function setNavActive() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link, .drawer-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href') || '';
    if (href && href !== '#' && path.includes(href.replace('.php', ''))) {
      link.classList.add('active');
    }
  });
})();

// ─── NAV AVATAR PULSE ─────────────────────────────────────────────────────────
const avatar = document.getElementById('navAvatar');
if (avatar) {
  setTimeout(() => {
    avatar.style.animation = 'badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    setTimeout(() => avatar.style.animation = '', 500);
  }, 800);
}

// ─── DRAWER ───────────────────────────────────────────────────────────────────
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('drawerOverlay');

function openDrawer() {
  overlay.classList.add('open');
  drawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  overlay.classList.remove('open');
  drawer.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('hamburgerBtn').addEventListener('click', openDrawer);
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
overlay.addEventListener('click', closeDrawer);

document.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('click', () => {
    setTimeout(closeDrawer, 180);
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrawer();
});