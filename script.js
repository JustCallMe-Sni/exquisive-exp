'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = $('#loader');
    loader.classList.add('hide');
    $('#hero-bg').classList.add('zoomed');
    $$('.h-anim').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 210 + 200);
    });
  }, 1300);
});

// ── Quantum Bracket Cursor ────────────────────────────────────────────────────
// Hardware-accelerated via translate3d + rAF. No lerp — movement is intentionally
// snappy to match the "precision" brand identity of the site.

(function initQuantumCursor() {
  const cursor = $('#system-cursor-container');
  if (!cursor || 'ontouchstart' in window) return;

  let raf = null;
  let mx = -9999, my = -9999;

  // ── Position tracking — batched via rAF for 60fps with zero layout thrash ──
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!raf) {
      raf = requestAnimationFrame(() => {
        // Updated to pass variables to CSS instead of translating the container
        cursor.style.setProperty('--x', mx + 'px');
        cursor.style.setProperty('--y', my + 'px');
        raf = null;
      });
    }
  });

  // Reveal cursor only after the first mouse move (prevents a flash at 0,0)
  document.addEventListener('mousemove', () => {
    cursor.style.opacity = '1';
  }, { once: true });

  // ── Hover detection — adds .cursor-active for the bracket snap + orbit state
  // Covers every interactive element on the page, including dynamically injected
  // elements like the reg panel cards (via MutationObserver).
  const HOVER_SELECTOR = [
    'a', 'button',
    '.athlete-card', '.about-card', '.reg-cat-card',
    '.btn-primary', '.btn-glass',
    '.day-tab', '.preview-item',
    '.sponsor-pill', '.social-btn', '.footer-link',
    '.category-link', '#reg-panel-close', '.lb-close',
    '.interactive', '.hover-target'
  ].join(', ');

  function bindHover(root) {
    root.querySelectorAll(HOVER_SELECTOR).forEach(el => {
      if (el._qbBound) return;
      el._qbBound = true;
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-active'));
    });
  }

  bindHover(document);

  // Watch for dynamically added nodes (reg panel, lightbox, etc.)
  new MutationObserver(() => bindHover(document))
    .observe(document.body, { childList: true, subtree: true });
})();

// ─────────────────────────────────────────────────────────────────────────────

const navbar = $('#navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  navbar.classList.toggle('scrolled', sy > 60);
  const heroBg = $('#hero-bg');
  if (heroBg && sy < window.innerHeight) {
    heroBg.style.transform = `scale(1) translateY(${sy * 0.38}px)`;
  }
  lastScroll = sy;
}, { passive: true });

const menuBtn    = $('#menu-btn');
const mobileMenu = $('#mobile-menu');
const ham        = $('.hamburger');

menuBtn.addEventListener('click', () => {
  ham.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});
$$('#mobile-menu a').forEach(a => {
  a.addEventListener('click', () => {
    ham.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

const canvas = $('#particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H;

  const resize = () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.8 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = -(Math.random() * 0.55 + 0.15);
      this.life = Math.random() * 0.5 + 0.15;
      this.col = Math.random() > 0.55 ? '#00f5ff' : '#ffd700';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.life -= 0.0008;
      if (this.y < -10 || this.life <= 0) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      const hex = Math.floor(this.life * 255).toString(16).padStart(2,'0');
      ctx.fillStyle = this.col + hex;
      ctx.fill();
    }
  }

  class Streak {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = -120;
      this.len  = Math.random() * 120 + 60;
      this.spd  = Math.random() * 2.5 + 0.8;
      this.opa  = Math.random() * 0.22 + 0.04;
      this.col  = Math.random() > 0.5 ? '#00f5ff' : '#ffffff';
      this.skew = (Math.random() - 0.5) * 0.4;
    }
    update() {
      this.y += this.spd; this.x += this.skew;
      if (this.y > H + 140) this.reset();
    }
    draw() {
      const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.skew * this.len, this.y - this.len);
      grad.addColorStop(0, this.col + Math.floor(this.opa * 255).toString(16).padStart(2,'0'));
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.skew * this.len, this.y - this.len);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  const particles = Array.from({ length: 90 }, () => new Particle());
  const streaks   = Array.from({ length: 6 },  () => new Streak());

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    streaks.forEach(s   => { s.update(); s.draw(); });
    requestAnimationFrame(loop);
  })();
}

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('revealed');
      revealObs.unobserve(en.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

$$('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el => revealObs.observe(el));

function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const dur = 1800;
  const step = target / (dur / 16);
  let cur = 0;
  const timer = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = Math.round(cur) + suffix;
    if (cur >= target) clearInterval(timer);
  }, 16);
}
const statsObs = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      $$('[data-count]', en.target).forEach(countUp);
      statsObs.unobserve(en.target);
    }
  });
}, { threshold: 0.4 });
const statsSection = $('#stats-row');
if (statsSection) statsObs.observe(statsSection);

$$('.day-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.day-tab').forEach(t => t.classList.remove('active'));
    $$('.schedule-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const target = $('#panel-' + tab.dataset.day);
    if (target) target.classList.add('active');
  });
});

const lightbox = $('#lightbox');
const lbImg    = $('#lb-img');

$$('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const src = item.querySelector('img').src;
    lbImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLb() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = ''; }, 350);
}
$('#lb-close').addEventListener('click', closeLb);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

$$('.btn-primary, .btn-glass').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

const regForm = $('#reg-form');
if (regForm) {
  regForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = regForm.querySelector('[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10" stroke-opacity=".3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>&nbsp;Submitting…`;
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = `✦ Registration Received!`;
      btn.style.background = 'linear-gradient(135deg,#00cc77,#009955)';
      regForm.reset();
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }, 1600);
  });
}

const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(spinStyle);

const sections = $$('section[id]');
const navLinks  = $$('.nav-link[href^="#"]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--ex-cyan)' : '';
  });
}, { passive: true });

$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = $(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const regPanel      = $('#reg-panel');
const regPanelClose = $('#reg-panel-close');

function openRegPanel() {
  if (regPanel) {
    regPanel.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeRegPanel() {
  if (regPanel) {
    regPanel.classList.remove('open');
    document.body.style.overflow = '';
  }
}

const regButtons = ['#hero-reg-btn', '#reg-open-btn', '#reg-section-btn'];
regButtons.forEach(selector => {
  const btn = $(selector);
  if (btn) btn.addEventListener('click', openRegPanel);
});

if (regPanelClose) regPanelClose.addEventListener('click', closeRegPanel);

if (regPanel) {
  regPanel.addEventListener('click', (e) => {
    if (e.target === regPanel) closeRegPanel();
  });
}

$$('.category-link').forEach(card => {
  card.addEventListener('click', (e) => {
    const url = card.getAttribute('data-url');
    if (url) window.open(url, '_blank');
  });
});

// ── Preview items — video lightbox ────────────────────────
$$('.preview-item').forEach(item => {
  item.addEventListener('click', () => {
    const videoSrc = item.dataset.video;
    const lbVideo  = $('#lb-video');
    const lbSrc    = $('#lb-video-src');
    const lb       = $('#lightbox');
    if (lbSrc && lbVideo && lb) {
      lbSrc.src = videoSrc;
      lbVideo.load();
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });
});

/**
 * Global Countdown Timer
 * Target: April 25, 2026, 19:00:00 IST
 */
const initCountdown = () => {
  const targetDate = new Date('2026-04-25T19:00:00+05:30').getTime();
  const countdownBox = document.getElementById('countdown-box');

  const elD = document.getElementById('cd-d');
  const elH = document.getElementById('cd-h');
  const elM = document.getElementById('cd-m');
  const elS = document.getElementById('cd-s');

  if (!elD) return;

  const updateClock = () => {
    const now  = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      clearInterval(interval);
      countdownBox.innerHTML = `<div class="hero-title shimmer-text" style="font-size: 3.5rem;">EVENT LIVE</div>`;
      return;
    }

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs  = Math.floor((diff % (1000 * 60)) / 1000);

    elD.innerText = String(days).padStart(2, '0');
    elH.innerText = String(hours).padStart(2, '0');
    elM.innerText = String(mins).padStart(2, '0');
    elS.innerText = String(secs).padStart(2, '0');
  };

  const interval = setInterval(updateClock, 1000);
  updateClock();
};

document.addEventListener('DOMContentLoaded', initCountdown);