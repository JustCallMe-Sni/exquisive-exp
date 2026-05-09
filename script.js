/* ═══════════════════════════════════════════════════
   EXQUISIVE // script.js
   Snappy. Purposeful. Zero Lag.
═══════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────
   1. LIVE CLOCK
────────────────────────────────────── */
(function initClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;

  function tick() {
    const now  = new Date();
    const h    = String(now.getHours()).padStart(2, '0');
    const m    = String(now.getMinutes()).padStart(2, '0');
    const s    = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }

  tick();
  setInterval(tick, 1000);
})();


/* ──────────────────────────────────────
   2. TERMINAL TYPING EFFECT
────────────────────────────────────── */
(function initTerminal() {
  const cmd1El   = document.getElementById('cmd-1');
  const cursor1  = document.getElementById('cursor-1');
  const output   = document.getElementById('terminal-output');
  const outBlocks = output ? Array.from(output.querySelectorAll('.output-block')) : [];

  if (!cmd1El) return;

  const CMD1 = 'init --system EXQUISIVE --mode ELITE';

  let charIndex = 0;

  function typeChar() {
    if (charIndex < CMD1.length) {
      cmd1El.textContent += CMD1[charIndex];
      charIndex++;
      // Variable speed for realism
      const delay = CMD1[charIndex - 1] === ' ' ? 60 : Math.random() * 40 + 30;
      setTimeout(typeChar, delay);
    } else {
      // Command done — hide cursor, show output
      cursor1.style.display = 'none';
      revealOutput();
    }
  }

  function revealOutput() {
    if (!output) return;
    output.style.display = 'block';

    outBlocks.forEach((block, i) => {
      setTimeout(() => {
        block.classList.add('visible');
      }, i * 100);
    });

    // After output, count-up stats
    setTimeout(initCountUp, outBlocks.length * 100 + 300);
  }

  // Start typing after short boot delay
  setTimeout(typeChar, 800);
})();


/* ──────────────────────────────────────
   3. COUNT-UP STATS
────────────────────────────────────── */
function initCountUp() {
  const nums = document.querySelectorAll('.stat-num[data-target]');
  nums.forEach(el => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 900;
    const steps    = 40;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out
      const val = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      el.textContent = val;

      if (step >= steps) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, interval);
  });
}


/* ──────────────────────────────────────
   4. INTERSECTION OBSERVER — SCROLL REVEALS
────────────────────────────────────── */
(function initReveal() {
  const options = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, options);

  document.querySelectorAll('.reveal-element').forEach(el => {
    observer.observe(el);
  });
})();


/* ──────────────────────────────────────
   5. FOOTER SYS-LOG STAGGER
────────────────────────────────────── */
(function initSysLog() {
  const logEntries = document.querySelectorAll('.log-entry');
  if (!logEntries.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        logEntries.forEach((el, i) => {
          setTimeout(() => el.classList.add('log-visible'), i * 200);
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const log = document.getElementById('sys-log');
  if (log) obs.observe(log);
})();


/* ──────────────────────────────────────
   6. HEADER SCROLL BEHAVIOUR
────────────────────────────────────── */
(function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastY = 0;
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > 80) {
          header.style.borderBottomColor = 'rgba(0,242,255,0.15)';
        } else {
          header.style.borderBottomColor = '';
        }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ──────────────────────────────────────
   7. SMOOTH NAV CLICK
────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ──────────────────────────────────────
   8. ECO CARD — MAGNETIC CURSOR TILT
────────────────────────────────────── */
(function initCardTilt() {
  document.querySelectorAll('.eco-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -dy * 4;
      const rotY   =  dx * 4;
      card.style.transform = `translate3d(0, 0, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)';
      card.style.transition = `transform 0.4s ease`;
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
})();


/* ──────────────────────────────────────
   9. LIVE SYS-LOG APPEND (ambient)
────────────────────────────────────── */
(function initAmbientLog() {
  const feed = document.getElementById('sys-log');
  if (!feed) return;

  const messages = [
    '> Modules synced',
    '> Operator: <span class="accent-cyan">ONLINE</span>',
    '> Heartbeat OK',
    '> Arena: <span class="accent-magenta">LIVE</span>',
    '> GEO lock confirmed',
    '> Stream: <span class="accent-cyan">STABLE</span>',
    '> Uptime: 100%',
  ];

  let idx = 0;

  function appendLog() {
    if (idx >= messages.length) idx = 0;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = messages[idx];
    feed.appendChild(entry);

    // Keep only 6 visible
    const all = feed.querySelectorAll('.log-entry');
    if (all.length > 6) {
      all[0].style.transition = 'opacity 0.3s ease';
      all[0].style.opacity    = '0';
      setTimeout(() => all[0].remove(), 300);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => entry.classList.add('log-visible'));
    });

    idx++;
  }

  // Start appending after initial load stagger
  setTimeout(() => {
    setInterval(appendLog, 3200);
  }, 4000);
})();
