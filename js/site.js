/* ═══════════════════════════════════════════════════════════════════════════
   site.js — Tolulope Elijah, Product Designer
   Plain JavaScript, no dependencies. Every module is written to degrade: if
   a browser lacks an API it falls back to CSS transitions or simply renders
   its finished state. Nothing here is load-bearing enough to leave the page
   blank.
   ═══════════════════════════════════════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp  = (a, b, t) => a + (b - a) * t;

const reduce  = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine    = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ══ scroll driver ══════════════════════════════════════════════════════
   One rAF loop, one layout read per frame. Modules register a callback and
   get called with the current scrollY; nothing else is allowed to attach a
   scroll listener, which keeps us off the main-thread thrash treadmill. */
const scrollBus = (() => {
  const subs = new Set();
  let y = window.scrollY, ticking = false;
  const run = () => { ticking = false; subs.forEach(fn => fn(y)); };
  const onScroll = () => { y = window.scrollY; if (!ticking) { ticking = true; requestAnimationFrame(run); } };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  return { add: fn => { subs.add(fn); fn(y); }, kick: onScroll };
})();

/* progress of an element through the viewport: 0 as its top hits the bottom
   of the screen, 1 once its bottom has cleared the top. */
const progressOf = (el, { from = 1, to = 0 } = {}) => {
  const r = el.getBoundingClientRect();
  const vh = innerHeight;
  const start = vh * from;
  const end = -r.height + vh * to;
  return clamp((start - r.top) / (start - end), 0, 1);
};

/* ══ 1. TEXT SPLITTING ═════════════════════════════════════════════════ */

/* Wrap the contiguous text of `host` in per-word spans, then group those
   words into per-line masks. Returns the .split-inner elements, in order. */
function splitBlock(host) {
  const textNodes = [...host.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
  if (!textNodes.length) return [];

  const words = [];
  textNodes.forEach(node => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(chunk => {
      if (!chunk.trim()) { frag.appendChild(document.createTextNode(chunk)); return; }
      const w = document.createElement('span');
      w.className = 'w';
      w.style.display = 'inline-block';
      w.textContent = chunk;
      frag.appendChild(w);
      words.push(w);
    });
    node.parentNode.replaceChild(frag, node);
  });
  if (!words.length) return [];

  /* group by vertical position */
  const lines = [];
  let last = null;
  words.forEach(w => {
    const top = Math.round(w.offsetTop);
    if (last === null || Math.abs(top - last) > 4) { lines.push([]); last = top; }
    lines[lines.length - 1].push(w);
  });

  const inners = [];
  lines.forEach(line => {
    const mask  = document.createElement('span');
    const inner = document.createElement('span');
    mask.className = 'split-line';
    inner.className = 'split-inner';
    line[0].parentNode.insertBefore(mask, line[0]);
    mask.appendChild(inner);
    line.forEach((w, i) => {
      if (i) inner.appendChild(document.createTextNode(' '));
      inner.appendChild(w);
    });
    inners.push(inner);
  });
  return inners;
}

/* Split into per-word spans for a staggered fade — used on body copy where
   line masks would be too theatrical. */
function splitWords(host) {
  const out = [];
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(chunk => {
          if (!chunk.trim()) { frag.appendChild(document.createTextNode(chunk)); return; }
          const wrap = document.createElement('span');
          wrap.className = 'word';
          const inner = document.createElement('span');
          inner.textContent = chunk;
          wrap.appendChild(inner);
          frag.appendChild(wrap);
          out.push(inner);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(host);
  return out;
}

/* Splitting has to happen AFTER the webfonts land: line breaks measured
   against a fallback face put every word on its own line, and the masks
   would then be frozen in the wrong places. Re-runs on resize for the same
   reason. */
function prepareSplits() {
  $$('[data-split], [data-split-words]').forEach(el => {
    if (el._orig == null) el._orig = el.innerHTML;
    else { el.innerHTML = el._orig; el._lines = el._words = null; }
  });

  $$('[data-split]').forEach(el => {
    const parts = splitBlock(el);
    $$(':scope > em, :scope > span:not(.split-line)', el).forEach(child => parts.push(...splitBlock(child)));
    el._lines = parts;
    if (!reduce && !el._played) parts.forEach(p => { p.style.transform = 'translateY(105%)'; });
  });

  $$('[data-split-words]').forEach(el => {
    el._words = splitWords(el);
    if (!reduce && !el._played) el._words.forEach(w => { w.style.opacity = '0'; w.style.transform = 'translateY(.5em)'; });
  });
}

/* keep line masks honest across viewport changes */
function watchSplitResize() {
  let w = innerWidth, t = null;
  addEventListener('resize', () => {
    if (Math.abs(innerWidth - w) < 40) return;
    w = innerWidth;
    clearTimeout(t);
    t = setTimeout(() => {
      const played = new Map();
      $$('[data-split], [data-split-words]').forEach(el => played.set(el, el._played));
      prepareSplits();
      played.forEach((was, el) => {
        el._played = was;
        if (!was) return;
        el._lines?.forEach(l => { l.style.transform = 'none'; });
        el._words?.forEach(x => { x.style.opacity = '1'; x.style.transform = 'none'; });
      });
      scrollBus.kick();
    }, 220);
  }, { passive: true });
}

function playLines(el, delay = 0) {
  const lines = el._lines;
  if (!lines || el._played) return;
  el._played = true;
  if (reduce) { lines.forEach(l => l.style.transform = 'none'); return; }
  lines.forEach((l, i) => {
    l.style.transition = `transform 1.05s cubic-bezier(.19,1,.22,1) ${delay + i * 0.085}s`;
    requestAnimationFrame(() => { l.style.transform = 'translateY(0)'; });
  });
}

/* ══ 2. LOADER ═════════════════════════════════════════════════════════ */
const LINES = [
  'FOCUSING', 'WARMING THE HORIZON', 'ALIGNING THE PIXELS',
  'SWEATING THE DETAILS', 'HANGING THE STARS', 'ALMOST GOLDEN'
];

function initLoader() {
  const el = $('#loader'), lineEl = $('#loader-line'), fill = $('#loader-bar-fill');
  if (!el) return;
  document.body.classList.add('is-loading');

  /* build the iris: six curved blades, each rotated into its own sector */
  const g = $('.iris-blades', el);
  const BLADES = 6, d = 'M100 100 Q 105 44 100 0 A 100 100 0 0 1 186.6 50 Z';
  for (let i = 0; i < BLADES; i++) {
    const wrap = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    wrap.setAttribute('transform', `rotate(${i * (360 / BLADES)} 100 100)`);
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    p.style.transitionDelay = `${i * 0.045}s`;
    wrap.appendChild(p);
    g.appendChild(wrap);
  }

  let i = 0, done = false;
  const rotate = setInterval(() => {
    if (done) return;
    i = (i + 1) % LINES.length;
    lineEl.classList.add('swap');
    setTimeout(() => { lineEl.textContent = LINES[i]; lineEl.classList.remove('swap'); }, 260);
  }, 900);

  /* fake-but-honest progress: creeps, then completes on real readiness */
  let pct = 0;
  const creep = setInterval(() => { pct = Math.min(pct + Math.random() * 9, 88); fill.style.width = pct + '%'; }, 190);

  const finish = () => {
    if (done) return; done = true;
    clearInterval(rotate); clearInterval(creep);
    fill.style.width = '100%';
    lineEl.textContent = 'GOLDEN';
    setTimeout(() => {
      el.classList.add('open');
      setTimeout(() => {
        el.classList.add('done');
        document.body.classList.remove('is-loading');
        document.dispatchEvent(new CustomEvent('site:ready'));
        setTimeout(() => el.remove(), 1000);
      }, reduce ? 60 : 620);
    }, reduce ? 40 : 320);
  };

  const minWait = new Promise(r => setTimeout(r, reduce ? 350 : 1750));
  const fontsReady = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  const winLoad = new Promise(r => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
  Promise.all([minWait, fontsReady, winLoad]).then(finish);
  setTimeout(finish, 6000); /* hard ceiling — never trap the visitor */
}

/* ══ 3. CURSOR ═════════════════════════════════════════════════════════ */
function initCursor() {
  const el = $('#cursor');
  if (!el || !fine || reduce) return;
  const ring = $('.cursor-ring', el), dot = $('.cursor-dot', el), label = $('.cursor-label', el);

  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my, dx = mx, dy = my, raf = null;

  const render = () => {
    /* the dot tracks tightly, the ring lags — that gap is what reads as weight */
    dx = lerp(dx, mx, 0.42); dy = lerp(dy, my, 0.42);
    rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
    dot.style.transform   = `translate3d(${dx}px, ${dy}px, 0)`;
    ring.style.transform  = `translate3d(${rx}px, ${ry}px, 0) scale(${el.classList.contains('hot') ? (el.classList.contains('down') ? .82 : 1) : .55})`;
    label.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${el.classList.contains('labelled') ? 1 : .8})`;
    if (Math.abs(dx - mx) > .1 || Math.abs(rx - mx) > .1 || Math.abs(dy - my) > .1 || Math.abs(ry - my) > .1) {
      raf = requestAnimationFrame(render);
    } else raf = null;
  };
  const tick = () => { if (!raf) raf = requestAnimationFrame(render); };

  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; el.classList.add('on'); tick(); }, { passive: true });
  addEventListener('mouseleave', () => el.classList.remove('on'));
  addEventListener('mousedown', () => { el.classList.add('down'); tick(); });
  addEventListener('mouseup',   () => { el.classList.remove('down'); tick(); });

  const HOT = 'a, button, [data-cursor], .tile-link, .mq-item';
  document.addEventListener('mouseover', e => {
    const t = e.target.closest(HOT);
    if (!t) return;
    el.classList.add('hot');
    const txt = t.dataset.cursor;
    if (txt) { label.textContent = txt; el.classList.add('labelled'); }
    tick();
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(HOT) && !e.relatedTarget?.closest?.(HOT)) {
      el.classList.remove('hot', 'labelled');
      tick();
    }
  });
}

/* ══ 4. NAV ════════════════════════════════════════════════════════════ */
function initNav() {
  const nav = $('#nav');
  const hero = $('.hero');
  if (!nav) return;

  let lastY = 0;
  scrollBus.add(y => {
    /* the pill tucks up when you scroll down, drops back the moment you reverse */
    const hidden = y > 300 && y > lastY + 2;
    nav.style.setProperty('--nav-y', hidden ? '-130%' : '0px');
    lastY = y;
    /* nav sides sit on the sky while the hero is behind them, on paper after */
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    nav.classList.toggle('on-light', heroBottom < 96);
  });

  /* active link tracking */
  const links = $$('.nav-link');
  const secs = links.map(l => $(l.getAttribute('href'))).filter(Boolean);
  if (secs.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(s => io.observe(s));
  }

  /* smooth anchors that respect reduced motion */
  $$('[data-nav]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id?.startsWith('#')) return;
      const target = id === '#top' ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      const top = id === '#top' ? 0 : target.getBoundingClientRect().top + scrollY - 96;
      scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
}

/* ══ 5. MENU ═══════════════════════════════════════════════════════════ */
let closeMenu = () => {};
function initMenu() {
  const btn = $('#menu-btn'), menu = $('#menu');
  if (!btn || !menu) return;
  $$('.menu-list li').forEach((li, i) => li.style.setProperty('--i', i));

  const set = open => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  };
  closeMenu = () => set(false);
  btn.addEventListener('click', () => set(!menu.classList.contains('open')));
  addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
}

/* ══ 6. THEME ══════════════════════════════════════════════════════════ */
function initTheme() {
  const btn = $('#theme-toggle');
  if (!btn) return;
  let stored = null;
  try { stored = localStorage.getItem('te-theme'); } catch {}
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
  let night = stored ? stored === 'night' : prefersDark;

  const apply = () => {
    document.body.classList.toggle('night', night);
    btn.setAttribute('aria-pressed', String(night));
    btn.setAttribute('aria-label', night ? 'Switch to day' : 'Switch to night');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', night ? '#100d14' : '#F6EEE3');
    const hint = $('.footer-hint');
    if (hint) hint.textContent = night ? 'CLICK THE SKY TO HANG A STAR'
                                       : 'CLICK TO CONNECT THE DOTS';
  };
  apply();

  btn.addEventListener('click', () => {
    night = !night;
    try { localStorage.setItem('te-theme', night ? 'night' : 'day'); } catch {}
    /* View Transitions turn a token swap into a single cross-dissolve of the
       whole page, which beats fifty independent colour transitions racing. */
    if (document.startViewTransition && !reduce) document.startViewTransition(apply);
    else apply();
  });
}

/* ══ 7. HERO ═══════════════════════════════════════════════════════════ */
/* kept short on purpose: the second headline line is right-aligned and a
   long word would run into the reel sitting bottom-left of the hero */
const ROTATE_WORDS = ['Listens', 'Ships', 'Notices', 'Refines'];

function initHeroIntro() {
  const title = $('.hero-title'), reel = $('#reel');

  [reel].forEach(el => {
    if (el && !reduce) { el.style.opacity = '0'; el.style.willChange = 'transform, opacity'; }
  });

  document.addEventListener('site:ready', () => {
    if (reduce) {
      [reel].forEach(el => el && (el.style.opacity = ''));
      $$('.h-line[data-split]').forEach(el => playLines(el));
      startRotator();
      return;
    }

    const set = (el, props, dur, delay, ease = 'cubic-bezier(.19,1,.22,1)') => {
      if (!el) return;
      Object.assign(el.style, props.from);
      el.style.transition = `all ${dur}s ${ease} ${delay}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => Object.assign(el.style, props.to)));
    };

    $$('.h-line[data-split]').forEach(el => playLines(el, 0.18));
    startRotator(0.42);
    set(reel,   { from: { opacity: 0, transform: 'rotate(-8deg) scale(.92) translateY(26px)' },
                  to:   { opacity: 1, transform: '' } }, 1.15, .55);
    setTimeout(() => [reel].forEach(el => el && (el.style.willChange = 'auto')), 2200);
  }, { once: true });

  /* hero parallax — sky layers drift at different rates as you leave */
  if (reduce) return;
  const sky = $('.hero-sky'), cel = $('.hero-celestial'),
        hills = $('.hero-hills'), content = $('.hero-content'), clouds = $('.hero-clouds');
  scrollBus.add(y => {
    if (y > innerHeight * 1.2) return;
    const p = y / innerHeight;
    if (sky)     sky.style.transform     = `translate3d(0, ${p * 90}px, 0)`;
    if (clouds)  clouds.style.transform  = `translate3d(0, ${p * 150}px, 0)`;
    if (cel)     cel.style.transform     = `translate3d(0, ${p * 220}px, 0)`;
    if (hills)   hills.style.transform   = `translate3d(0, ${p * -46}px, 0)`;
    if (content) {
      content.style.transform = `translate3d(0, ${p * 70}px, 0)`;
      content.style.opacity   = String(clamp(1 - p * 1.45, 0, 1));
    }
  });
}

/* the rotating word — characters leave upward, the next set arrives from
   below, and Fraunces' WONK/SOFT axes wobble on the way in so the swap has
   some personality rather than being a plain crossfade. */
function startRotator(initialDelay = 0) {
  const el = $('#rotator');
  if (!el) return;
  let idx = 0;

  const paint = (word, animate) => {
    el.textContent = '';
    [...word].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'r-char';
      s.textContent = ch === ' ' ? ' ' : ch;
      if (animate && !reduce) {
        s.style.transform = 'translateY(88%) rotate(6deg)';
        s.style.opacity = '0';
        s.style.fontVariationSettings = "'opsz' 120, 'SOFT' 90, 'WONK' 1";
        s.style.transition = `transform .78s cubic-bezier(.19,1,.22,1) ${i * 0.035}s,
                              opacity .5s ease ${i * 0.035}s,
                              font-variation-settings .9s cubic-bezier(.19,1,.22,1) ${i * 0.035}s`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          s.style.transform = 'none'; s.style.opacity = '1';
          s.style.fontVariationSettings = "'opsz' 120, 'SOFT' 22, 'WONK' 1";
        }));
      }
      el.appendChild(s);
    });
  };

  const leave = () => new Promise(res => {
    const chars = $$('.r-char', el);
    if (reduce || !chars.length) return res();
    chars.forEach((s, i) => {
      s.style.transition = `transform .42s cubic-bezier(.55,.06,.68,.19) ${i * 0.026}s, opacity .34s ease ${i * 0.026}s`;
      s.style.transform = 'translateY(-78%) rotate(-5deg)';
      s.style.opacity = '0';
    });
    setTimeout(res, 420 + chars.length * 26);
  });

  const cycle = async () => {
    await leave();
    idx = (idx + 1) % ROTATE_WORDS.length;
    paint(ROTATE_WORDS[idx], true);
  };

  setTimeout(() => {
    paint(ROTATE_WORDS[0], !reduce);
    if (!reduce) {
      let timer = setInterval(cycle, 3400);
      /* stop burning frames while the tab is in the background */
      document.addEventListener('visibilitychange', () => {
        clearInterval(timer);
        if (!document.hidden) timer = setInterval(cycle, 3400);
      });
    }
  }, initialDelay * 1000);
}

/* ══ 8. THE REEL ═══════════════════════════════════════════════════════ */
const FRAMES = [
  { name: 'KORA',     line: 'FINTECH · LAGOS · 2025',   bg: 'linear-gradient(135deg,#f0a86e,#c1502e)' },
  { name: 'AZZA',     line: 'HEALTH · IBADAN · 2024',   bg: 'linear-gradient(135deg,#b9c48c,#6e7a52)' },
  { name: 'LOOMFOLK', line: 'COMMERCE · ACCRA · 2024',  bg: 'linear-gradient(135deg,#ffdc94,#f2b33d)' },
  { name: 'TIDEMARK', line: 'CLIMATE · REMOTE · 2023',  bg: 'linear-gradient(135deg,#7d8ec4,#37447a)' }
];

function initReel() {
  const reel = $('#reel'), strip = $('#reel-strip'),
        lever = $('#reel-lever'), idxEl = $('#reel-idx'), nameEl = $('#reel-name');
  if (!reel || !strip) return;

  FRAMES.forEach((f, i) => {
    const d = document.createElement('div');
    d.className = 'reel-frame' + (i === 0 ? ' on' : '');
    d.style.setProperty('--frame-bg', f.bg);
    d.innerHTML = `<b>${f.name}</b><span>${f.line}</span>`;
    if (!reduce) {
      d.style.transition = 'transform .62s cubic-bezier(.19,1,.22,1), opacity .38s ease';
      if (i !== 0) d.style.transform = 'translateY(101%)';
    }
    strip.appendChild(d);
  });

  let cur = 0, busy = false;
  const frames = $$('.reel-frame', strip);

  const go = next => {
    if (busy || next === cur) return;
    busy = true;
    reel.classList.add('spinning');
    lever?.classList.add('pulled');

    const out = frames[cur], into = frames[next];
    if (reduce) {
      out.classList.remove('on'); into.classList.add('on');
    } else {
      out.style.transform = 'translateY(-101%)';
      out.classList.remove('on');
      into.style.transition = 'none';
      into.style.transform = 'translateY(101%)';
      into.classList.add('on');
      requestAnimationFrame(() => {
        into.style.transition = 'transform .62s cubic-bezier(.19,1,.22,1), opacity .38s ease';
        into.style.transform = 'translateY(0)';
      });
    }
    cur = next;
    idxEl.textContent = String(cur + 1).padStart(2, '0');
    nameEl.textContent = FRAMES[cur].name;

    setTimeout(() => { lever?.classList.remove('pulled'); }, 300);
    setTimeout(() => { reel.classList.remove('spinning'); busy = false; }, reduce ? 40 : 680);
  };

  const advance = () => go((cur + 1) % FRAMES.length);
  lever?.addEventListener('click', advance);

  /* auto-advance, but only while the reel is actually on screen and the tab
     is visible — no point animating into the void */
  let timer = null, visible = true;
  const start = () => { if (!timer && !reduce) timer = setInterval(advance, 4200); };
  const stop  = () => { clearInterval(timer); timer = null; };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible && !document.hidden ? start() : stop(); },
      { threshold: 0.25 }).observe(reel);
  } else start();
  document.addEventListener('visibilitychange', () => (document.hidden || !visible) ? stop() : start());

  /* tilt toward the pointer — small, damped, and only on a real mouse */
  if (!fine || reduce) return;
  const body = $('.reel-body', reel);
  reel.addEventListener('mousemove', e => {
    const r = reel.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    body.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateZ(6px)`;
  });
  reel.addEventListener('mouseleave', () => { body.style.transform = ''; });
}

/* ══ 9. REVEALS + COUNTERS ═════════════════════════════════════════════ */
function initReveals() {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal, .step').forEach(el => el.classList.add('in'));
    $$('[data-split]').forEach(el => playLines(el));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      const el = en.target;
      /* Landing deep in the page — a #hash, a restored scroll position, or
         anchor navigation — leaves everything above the viewport permanently
         at opacity 0, because it never crosses the threshold. Show those
         straight away instead of animating something nobody watched. */
      if (!en.isIntersecting) {
        if (en.boundingClientRect.top < 0) { obs.unobserve(el); showNow(el); }
        return;
      }
      obs.unobserve(el);

      if (el.hasAttribute('data-split')) return playLines(el);
      if (el.hasAttribute('data-split-words')) {
        el._played = true;
        el._words?.forEach((w, i) => {
          w.style.transition = `opacity .7s ease ${i * 0.022}s, transform .8s cubic-bezier(.19,1,.22,1) ${i * 0.022}s`;
          requestAnimationFrame(() => { w.style.opacity = '1'; w.style.transform = 'none'; });
        });
        return;
      }
      el.classList.add('in');
      const num = $('[data-count]', el);
      if (num) countUp(num);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });

  $$('.reveal, .step').forEach(el => io.observe(el));
  /* the hero headline plays from the intro timeline, not from scroll */
  $$('[data-split]:not(.h-line), [data-split-words]').forEach(el => io.observe(el));
}

/* reveal without animating — for content the visitor has already scrolled past */
function showNow(el) {
  el.classList.add('in');
  el._played = true;
  el._lines?.forEach(l => { l.style.transition = 'none'; l.style.transform = 'none'; });
  el._words?.forEach(x => { x.style.transition = 'none'; x.style.opacity = '1'; x.style.transform = 'none'; });
  const num = $('[data-count]', el);
  if (num) {
    const target = parseInt(num.dataset.count, 10) || 0;
    num.textContent = (!target && num.dataset.suffix) ? num.dataset.suffix
                                                      : target + (num.dataset.suffix || '');
  }
}

function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix;
  if (suffix && !target) { el.textContent = suffix; return; }
  if (reduce) { el.textContent = target + (suffix || ''); return; }
  const dur = 1400, t0 = performance.now();
  const step = now => {
    const p = clamp((now - t0) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + (p === 1 ? (suffix || '') : '');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ══ 10. MARQUEE ═══════════════════════════════════════════════════════ */
const OUTLETS = ['Sable', 'Fastforward', 'Design Week Africa', 'Ledger', 'Nomad', 'Cascade', 'Ọ̀nà Quarterly'];

function initMarquee() {
  const row = $('#marquee-row');
  if (!row) return;
  const build = () => OUTLETS.map(n => `<span class="mq-item">${n}</span>`).join('');
  row.innerHTML = build() + build() + build() + build();

  if (reduce) return;
  let x = 0, half = 0, paused = false;
  const measure = () => { half = row.scrollWidth / 2; };
  measure();
  addEventListener('resize', measure, { passive: true });
  row.addEventListener('mouseenter', () => paused = true);
  row.addEventListener('mouseleave', () => paused = false);

  let last = performance.now();
  const tick = now => {
    const dt = Math.min(now - last, 50); last = now;
    if (!paused && !document.hidden) x -= dt * 0.032;      /* px per ms — a slow drift, not a conveyor */
    if (half && -x >= half) x += half;                      /* seamless wrap */
    row.style.transform = `translate3d(${x}px,0,0)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ══ 11. THE FLIGHT ════════════════════════════════════════════════════
   The spine of the work section. Scroll pays out a dotted trail along an
   SVG path and flies a swift at the head of it — the same birds that cross
   the hero, come back to lead you down the page. The path is authored in a
   1000x1000 box and stretched to the section, so every point has to be
   converted back into pixels before it can be used for position or angle —
   the heading is measured in pixel space for exactly that reason, otherwise
   the bird would point wrong on any viewport that isn't square. */
function initFlight() {
  /* scroll-linked motion is exactly the kind that triggers motion sickness,
     so the whole flight sits out under reduced motion (CSS hides it too) */
  if (reduce) return;
  const wrap = $('.flight'), work = $('.work');
  if (!wrap || !work) return;
  const svg  = $('.flight-svg', wrap);
  const path = $('#flightPath', wrap);
  const mask = $('#flightMaskPath', wrap);
  const bird = $('.flight-bird', wrap);
  if (!path || !mask || !bird) return;

  const VB = 1000;
  let L = 0, w = 0, h = 0, lut = [];

  /* The path is parameterised by arc length, but scroll is vertical. A long
     horizontal sweep costs a lot of length and no height, so driving the bird
     straight off arc length makes it stall and then lurch. This table lets us
     ask "how far along is the point at this height?" instead, which pins the
     bird's vertical position to the scroll and leaves only the swooping. */
  const buildLut = () => {
    lut = [];
    const N = 260;
    for (let i = 0; i <= N; i++) {
      const len = L * i / N;
      lut.push({ len, y: path.getPointAtLength(len).y });
    }
  };

  const lenAtY = y => {
    for (let i = 1; i < lut.length; i++) {
      if (lut[i].y >= y) {
        const a = lut[i - 1], b = lut[i];
        const span = b.y - a.y;
        return a.len + (b.len - a.len) * (span ? (y - a.y) / span : 0);
      }
    }
    return L;
  };

  const measure = () => {
    const r = svg.getBoundingClientRect();
    w = r.width; h = r.height;
    L = path.getTotalLength();
    mask.style.strokeDasharray = `${L} ${L}`;
    buildLut();
  };
  measure();
  addEventListener('resize', measure, { passive: true });

  const at = len => {
    const pt = path.getPointAtLength(clamp(len, 0, L));
    return { x: pt.x / VB * w, y: pt.y / VB * h };
  };

  scrollBus.add(() => {
    const r = work.getBoundingClientRect();
    if (r.bottom < -400 || r.top > innerHeight + 400) return;
    if (!L || !w) measure();

    /* from and to are symmetric about the middle of the screen, so the point
       at fraction p of the section always sits at roughly the same height in
       the viewport — the bird flies with you rather than away from you. */
    const p = progressOf(work, { from: .58, to: .42 });
    const d = lenAtY(p * VB);

    mask.style.strokeDashoffset = String(L - d);

    const a = at(d - 9), b = at(d + 9), c = at(d);
    const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    bird.style.transform =
      `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%) rotate(${ang}deg)`;
    /* fade at both ends so it arrives and leaves rather than popping */
    bird.style.setProperty('--bird-o', clamp(Math.min(p, 1 - p) * 14, 0, 1).toFixed(3));
  });
}

/* ══ 12. TILE PARALLAX ═════════════════════════════════════════════════ */
function initTiles() {
  if (reduce) return;
  const tiles = $$('.tile');
  scrollBus.add(() => {
    tiles.forEach(t => {
      const art = $('.tile-art', t);
      if (!art) return;
      const r = t.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      art.style.transform = `translate3d(0, ${p * -22}px, 0) scale(1.06)`;
    });
  });

  if (!fine) return;
  /* magnetic drift: the tile leans a few pixels toward the cursor */
  tiles.forEach(t => {
    const link = $('.tile-link', t);
    if (!link) return;
    link.addEventListener('mousemove', e => {
      const r = link.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      link.style.setProperty('transform', `translate3d(${px * 12}px, ${py * 10 - 8}px, 0) scale(1.012)`);
    });
    link.addEventListener('mouseleave', () => link.style.removeProperty('transform'));
  });
}

/* ══ 13. TESTIMONIAL DECK ══════════════════════════════════════════════ */
function initDeck() {
  const deck = $('#t-deck');
  if (!deck || reduce || innerWidth < 861) return;
  const cards = $$('.t-card', deck);
  scrollBus.add(() => {
    const r = deck.getBoundingClientRect();
    if (r.bottom < -300 || r.top > innerHeight + 300) return;
    /* 0 while the deck is still low, 1 once it is comfortably centred */
    const raw = (innerHeight * 0.86 - r.top) / (innerHeight * 0.62);
    const p = clamp(raw, 0, 1);
    const eased = p * p * (3 - 2 * p);
    cards.forEach(c => c.style.setProperty('--spread', eased.toFixed(3)));
  });
}

/* ══ 14. STEPS — draw the rule as each step arrives ════════════════════ */
function initSteps() {
  if (reduce) return;
  $$('.step').forEach((s, i) => { s.style.transitionDelay = `${i * 0.07}s`; });
}

/* ══ 15. THE CONSTELLATION FOOTER ══════════════════════════════════════
   The page has been setting since the hero; by the footer it is properly
   night. Ambient stars drift and twinkle, the occasional meteor crosses,
   and clicking hangs a new star that wires itself to its nearest
   neighbours. It is the one place on the page that is purely for play. */
function initConstellation() {
  const cv = $('#sky-canvas'), footer = $('#footer');
  if (!cv || !footer) return;
  const ctx = cv.getContext('2d', { alpha: true });
  if (!ctx) return;

  let W = 0, H = 0, dpr = 1;
  let ambient = [], user = [], links = [], meteors = [];
  let mouse = { x: -999, y: -999 };
  let running = false, raf = null, t = 0, prev = 0;

  const rnd = (a, b) => a + Math.random() * (b - a);

  /* Two readings of the same idea. At night it is a sky you hang stars in; by
     day the same clicks read as ink dots joined into a constellation on paper.
     Same mechanic, same code path, different palette. */
  const palette = () => document.body.classList.contains('night')
    ? { neb: ['rgba(150,150,158,.14)', 'rgba(90,90,96,.05)'],
        amb: '250,250,248', ambA: 1,
        link: '242,179,61',  linkA: .30, linkW: .9,
        mark: '255,246,226', halo: '242,179,61', haloR: 3.4, haloA: .10,
        spark: true, meteors: true }
    /* on paper the marks have to be drawn, not glowed: a soft halo just
       reads as a smudge, so day gets a solid dot, a crisp ring and a
       line strong enough to survive against sand */
    : { neb: ['rgba(206,150,88,.14)', 'rgba(186,132,84,.04)'],
        amb: '92,60,38',   ambA: .30,
        link: '166,66,36',  linkA: .62, linkW: 1.2,
        mark: '150,58,32', halo: '193,80,46', haloR: 1.9, haloA: .05,
        spark: false, meteors: false };

  const resize = () => {
    const r = footer.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  };

  const seed = () => {
    const density = Math.round(clamp((W * H) / 9000, 40, 170));
    ambient = Array.from({ length: density }, () => ({
      x: rnd(0, W), y: rnd(0, H),
      r: rnd(0.35, 1.5),
      base: rnd(0.16, 0.7),
      ph: rnd(0, Math.PI * 2),
      sp: rnd(0.4, 1.5),
      dx: rnd(-0.012, 0.012), dy: rnd(-0.008, 0.008),
      depth: rnd(0.25, 1)
    }));
  };

  /* wire a new star to its two nearest neighbours, if they are close enough
     to read as a constellation rather than a random chord across the sky */
  const wire = star => {
    const near = user
      .filter(s => s !== star)
      .map(s => ({ s, d: Math.hypot(s.x - star.x, s.y - star.y) }))
      .filter(o => o.d < Math.min(W, H) * 0.55)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach(o => links.push({ a: star, b: o.s, born: performance.now(), len: o.d }));
  };

  const addStar = (x, y) => {
    const star = { x, y, r: 0, target: rnd(1.9, 3.1), born: performance.now(), ph: rnd(0, 6.28) };
    user.push(star);
    wire(star);
    if (user.length > 90) {                       /* keep the sky from silting up */
      const dead = user.shift();
      links = links.filter(l => l.a !== dead && l.b !== dead);
    }
  };

  const draw = () => {
    /* Everything below is driven by elapsed time, not frame count. A frame
       counter runs double speed on a 120Hz display and crawls in a throttled
       background tab; seconds behave the same everywhere. Capped so a long
       stall doesn't teleport the whole scene on the next frame. */
    const now = performance.now();
    const dt = Math.min((now - (prev || now)) / 1000, 0.1);
    prev = now;
    const k = dt * 60;                       /* frames-equivalent, for the old rates */
    t += dt;
    const pal = palette();
    ctx.clearRect(0, 0, W, H);

    /* faint wash so the ground never reads as dead flat */
    const g = ctx.createRadialGradient(W * 0.72, H * 0.18, 0, W * 0.72, H * 0.18, Math.max(W, H) * 0.72);
    g.addColorStop(0, pal.neb[0]);
    g.addColorStop(0.5, pal.neb[1]);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    /* ambient field — parallax against the pointer, gentle twinkle */
    ambient.forEach(s => {
      s.x += s.dx * k; s.y += s.dy * k;
      if (s.x < -6) s.x = W + 6; if (s.x > W + 6) s.x = -6;
      if (s.y < -6) s.y = H + 6; if (s.y > H + 6) s.y = -6;
      const px = s.x + (mouse.x - W / 2) * 0.012 * s.depth;
      const py = s.y + (mouse.y - H / 2) * 0.012 * s.depth;
      const a = s.base * pal.ambA * (0.55 + 0.45 * Math.sin(t * s.sp + s.ph));
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, 6.283);
      ctx.fillStyle = `rgba(${pal.amb},${a.toFixed(3)})`;
      ctx.fill();
    });

    /* constellation lines, drawn in over ~0.6s each */
    links.forEach(l => {
      const lp = clamp((now - l.born) / 620, 0, 1);
      const e = 1 - Math.pow(1 - lp, 3);
      ctx.beginPath();
      ctx.moveTo(l.a.x, l.a.y);
      ctx.lineTo(lerp(l.a.x, l.b.x, e), lerp(l.a.y, l.b.y, e));
      ctx.strokeStyle = `rgba(${pal.link},${(pal.linkA * lp).toFixed(3)})`;
      ctx.lineWidth = pal.linkW;
      ctx.stroke();
    });

    /* the stars the visitor hung */
    user.forEach(s => {
      const age = (now - s.born) / 1000;
      s.r = s.target * (1 - Math.pow(1 - clamp(age / 0.34, 0, 1), 3));
      s.glow = Math.max(0, 1 - age / 1.25);
      const tw = 0.78 + 0.22 * Math.sin(t * 2.1 + s.ph);

      if (s.glow > 0) {                            /* the flash it arrives with */
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + 22 * s.glow, 0, 6.283);
        ctx.fillStyle = `rgba(${pal.halo},${(0.16 * s.glow).toFixed(3)})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * pal.haloR, 0, 6.283);
      ctx.fillStyle = `rgba(${pal.halo},${(pal.haloA * tw).toFixed(3)})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fillStyle = `rgba(${pal.mark},${tw.toFixed(3)})`;
      ctx.fill();

      if (pal.spark) {                             /* four-point sparkle */
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.strokeStyle = `rgba(${pal.mark},${(0.55 * tw).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        const L = s.r * 3.2;
        ctx.beginPath();
        ctx.moveTo(-L, 0); ctx.lineTo(L, 0); ctx.moveTo(0, -L); ctx.lineTo(0, L);
        ctx.stroke();
        ctx.restore();
      } else {                                     /* by day, a drawn ring */
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.9, 0, 6.283);
        ctx.strokeStyle = `rgba(${pal.mark},${(0.55 * tw).toFixed(3)})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
    });

    /* the odd meteor */
    if (pal.meteors && Math.random() < 0.13 * dt && meteors.length < 2) {
      meteors.push({ x: rnd(W * 0.3, W), y: rnd(-20, H * 0.4), vx: rnd(-5.5, -3.4), vy: rnd(1.6, 2.8), life: 1 });
    }
    meteors = meteors.filter(m => {
      m.x += m.vx * k; m.y += m.vy * k; m.life -= 0.66 * dt;
      if (m.life <= 0) return false;
      const gr = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 16, m.y - m.vy * 16);
      gr.addColorStop(0, `rgba(255,250,235,${m.life.toFixed(2)})`);
      gr.addColorStop(1, 'rgba(255,250,235,0)');
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 16, m.y - m.vy * 16);
      ctx.strokeStyle = gr; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.stroke();
      return true;
    });

    raf = requestAnimationFrame(draw);
  };

  const start = () => { if (!running) { running = true; prev = 0; raf = requestAnimationFrame(draw); } };
  const stop  = () => { running = false; cancelAnimationFrame(raf); };

  resize();
  addEventListener('resize', resize, { passive: true });

  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  }, { passive: true });
  cv.addEventListener('pointerleave', () => { mouse.x = -999; mouse.y = -999; });
  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect();
    addStar(e.clientX - r.left, e.clientY - r.top);
    const hint = $('.footer-hint');
    if (hint) hint.style.opacity = '0';
  });

  if (reduce) {                                     /* one static frame, no loop */
    const once = () => { t = 3; draw(); stop(); };
    once();
    cv.addEventListener('pointerdown', once);
    return;
  }

  /* only run while the footer is on screen */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => e.isIntersecting && !document.hidden ? start() : stop(),
      { threshold: 0.02 }).observe(footer);
  } else start();
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
}


/* ══ 17. MOMENTUM SCROLL ═══════════════════════════════════════════════
   Interpolates the real scroll position rather than transforming a wrapper,
   so position:fixed, the footer canvas and anchor links all keep working.
   Pointer-coarse devices keep their native momentum, which is better than
   anything we would synthesise. */
function initSmoothScroll() {
  if (reduce || !fine) return;

  let target = scrollY, current = target, active = false;
  const max = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);

  const loop = () => {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.35) { current = target; active = false; }
    scrollTo(0, current);
    if (active) requestAnimationFrame(loop);
  };

  addEventListener('wheel', e => {
    if (e.ctrlKey || e.defaultPrevented) return;         /* leave pinch-zoom alone */
    /* anything that scrolls itself keeps its own wheel events — otherwise the
       case study overlay would be frozen by the page's momentum handler */
    if (e.target.closest?.('[data-native-scroll]')) return;
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
    e.preventDefault();
    target = clamp(target + e.deltaY * unit, 0, max());
    if (!active) { active = true; current = scrollY; requestAnimationFrame(loop); }
  }, { passive: false });

  /* anything that scrolls us by other means — anchors, keyboard, find-in-page
     — resets the target so the next wheel tick starts from the truth */
  addEventListener('scroll', () => { if (!active) { target = current = scrollY; } }, { passive: true });
  addEventListener('resize', () => { target = current = scrollY; }, { passive: true });
}


/* ══ 18. CASE STUDIES ═══════════════════════════════════════════════════
   The site stays one page. A project opens as a full-screen dialog whose
   hero grows out of the tile you clicked, and whose slug lives in the URL
   so it can be linked to and dismissed with the Back button.

   ⚠ Placeholder copy. KORA is written out in full to show the shape a real
   case study takes; the other three carry the same structure with stub text
   and are flagged so nothing invented survives into the live site. */
const CASES = {
  kora: {
    name: 'KORA', tag: 'Fintech', year: '2025', tint: 'clay',
    title: 'Merchant onboarding, from nine days to forty minutes',
    lede: 'Kora processes payments for 40,000 Nigerian businesses. Signing one up took nine days and a phone call. We rebuilt the path end to end and made it something a shop owner could finish before their tea went cold.',
    meta: [['Role', 'Lead product designer'], ['Team', '2 designers, 6 engineers'],
           ['Timeline', '7 months'], ['Surface', 'Web dashboard, KYC flow']],
    bands: [
      { kind: 'text', tone: 'light', eyebrow: 'THE PROBLEM', heading: 'Nobody was stuck. Everybody was waiting.',
        body: ['Support tickets said the form was confusing. Session replays said something else: people finished the form fine, then waited. Documents sat in a review queue nobody owned, and every follow-up restarted the clock.',
               'The design problem was not the form. It was that nine days of silence looked identical to rejection, so half of the merchants who dropped out had already been approved.'] },
      { kind: 'quote', tone: 'light', text: 'I sent everything on Monday. By Thursday I assumed they had said no, so I signed up with someone else.',
        who: 'Merchant interview, Ikeja' },
      { kind: 'steps', tone: 'dark', eyebrow: 'THE WORK', heading: 'Three changes, in order of leverage.',
        steps: [['Show the queue', 'Every application got a live status, a named reviewer and an honest estimate. Uncertainty was doing more damage than the wait itself.'],
                ['Verify while they type', 'Bank and tax IDs now check against the registry as they are entered, so 70% of applications never reach a human at all.'],
                ['Fail forward', 'A rejected document asks for the one thing that was wrong instead of restarting the application.']] },
      { kind: 'metrics', tone: 'light', eyebrow: 'THE OUTCOME', heading: 'What it moved.',
        metrics: [['40 min', 'median time to approval'], ['+31%', 'applications completed'], ['−64%', 'onboarding support tickets']],
        body: ['Nine months on, the median merchant is live in under an hour and the review queue holds only the genuinely ambiguous cases. The support team went from chasing status requests to handling real edge cases.'] }
    ],
    next: 'azza'
  },

  azza: {
    name: 'AZZA', tag: 'Health', year: '2024', tint: 'olive', placeholder: true,
    title: 'A maternal-health companion for 120,000 mothers',
    lede: 'A pregnancy and postnatal companion built for low-bandwidth Android, used across Lagos and Ibadan.',
    meta: [['Role', 'Product designer'], ['Team', 'To be confirmed'],
           ['Timeline', '2024'], ['Surface', 'Android, USSD fallback']],
    bands: [
      { kind: 'text', tone: 'light', eyebrow: 'THE PROBLEM', heading: 'Placeholder problem statement.',
        body: ['Replace with the real framing: who was struggling, what it cost them, and what made the existing answer inadequate.'] },
      { kind: 'steps', tone: 'dark', eyebrow: 'THE WORK', heading: 'Placeholder approach.',
        steps: [['First move', 'What you did and why it came first.'],
                ['Second move', 'The change that followed from it.'],
                ['Third move', 'What you got wrong, and what you did about it.']] },
      { kind: 'metrics', tone: 'light', eyebrow: 'THE OUTCOME', heading: 'Placeholder results.',
        metrics: [['000', 'metric one'], ['00%', 'metric two'], ['0.0×', 'metric three']],
        body: ['Replace with the measured outcome and, ideally, one thing that did not work.'] }
    ],
    next: 'loomfolk'
  },

  loomfolk: {
    name: 'LOOMFOLK', tag: 'Commerce', year: '2024', tint: 'amber', placeholder: true,
    title: 'A marketplace for West African textile makers',
    lede: 'Connecting independent weavers and dyers to buyers abroad, without flattening what makes the work worth buying.',
    meta: [['Role', 'Product designer'], ['Team', 'To be confirmed'],
           ['Timeline', '2024'], ['Surface', 'Web, seller tools']],
    bands: [
      { kind: 'text', tone: 'light', eyebrow: 'THE PROBLEM', heading: 'Placeholder problem statement.',
        body: ['Replace with the real framing: who was struggling, what it cost them, and what made the existing answer inadequate.'] },
      { kind: 'steps', tone: 'dark', eyebrow: 'THE WORK', heading: 'Placeholder approach.',
        steps: [['First move', 'What you did and why it came first.'],
                ['Second move', 'The change that followed from it.'],
                ['Third move', 'What you got wrong, and what you did about it.']] },
      { kind: 'metrics', tone: 'light', eyebrow: 'THE OUTCOME', heading: 'Placeholder results.',
        metrics: [['3.4×', 'GMV in two quarters'], ['00%', 'metric two'], ['000', 'metric three']],
        body: ['Replace with the measured outcome and, ideally, one thing that did not work.'] }
    ],
    next: 'tidemark'
  },

  tidemark: {
    name: 'TIDEMARK', tag: 'Climate', year: '2023', tint: 'indigo', placeholder: true,
    title: 'Climate-risk intelligence for people who are not scientists',
    lede: 'Turning flood and heat modelling into something a city planner can act on in an afternoon.',
    meta: [['Role', 'Product designer'], ['Team', 'To be confirmed'],
           ['Timeline', '2023'], ['Surface', 'Web, data visualisation']],
    bands: [
      { kind: 'text', tone: 'light', eyebrow: 'THE PROBLEM', heading: 'Placeholder problem statement.',
        body: ['Replace with the real framing: who was struggling, what it cost them, and what made the existing answer inadequate.'] },
      { kind: 'steps', tone: 'dark', eyebrow: 'THE WORK', heading: 'Placeholder approach.',
        steps: [['First move', 'What you did and why it came first.'],
                ['Second move', 'The change that followed from it.'],
                ['Third move', 'What you got wrong, and what you did about it.']] },
      { kind: 'metrics', tone: 'light', eyebrow: 'THE OUTCOME', heading: 'Placeholder results.',
        metrics: [['000', 'metric one'], ['00%', 'metric two'], ['0.0×', 'metric three']],
        body: ['Replace with the measured outcome and, ideally, one thing that did not work.'] }
    ],
    next: 'kora'
  }
};

function initCases() {
  const root = $('#case'), scroll = $('#case-scroll'), bar = $('#case-bar-fill');
  if (!root || !scroll) return;

  let openSlug = null, lastFocus = null, pushed = false;

  const bandHTML = b => {
    const head = `${b.eyebrow ? `<p class="cs-eyebrow">${b.eyebrow}</p>` : ''}
                  ${b.heading ? `<h3 class="cs-heading">${b.heading}</h3>` : ''}`;
    if (b.kind === 'quote')
      return `<section class="cs-band cs-quote ${b.tone}">
                <blockquote>${b.text}</blockquote><cite>${b.who}</cite></section>`;
    if (b.kind === 'steps')
      return `<section class="cs-band ${b.tone}">${head}
                <ol class="cs-steps">${b.steps.map(([t, d], i) =>
                  `<li><span>${String(i + 1).padStart(2, '0')}</span><div><h4>${t}</h4><p>${d}</p></div></li>`).join('')}
                </ol></section>`;
    if (b.kind === 'metrics')
      return `<section class="cs-band ${b.tone}">${head}
                <div class="cs-metrics">${b.metrics.map(([v, l]) =>
                  `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>
                ${b.body.map(p => `<p class="cs-body">${p}</p>`).join('')}</section>`;
    return `<section class="cs-band ${b.tone}">${head}
              ${b.body.map(p => `<p class="cs-body">${p}</p>`).join('')}</section>`;
  };

  const render = slug => {
    const c = CASES[slug], nx = CASES[c.next];
    scroll.innerHTML = `
      <header class="cs-hero" data-tint="${c.tint}">
        <div class="cs-hero-art" id="cs-hero-art"></div>
        <div class="cs-hero-copy">
          <p class="cs-kicker">${c.name} · ${c.tag} · ${c.year}</p>
          <h2 class="cs-title" id="case-title">${c.title}</h2>
          <p class="cs-lede">${c.lede}</p>
        </div>
      </header>
      ${c.placeholder ? `<p class="cs-flag">Placeholder case study. Structure is final, words are not.</p>` : ''}
      <dl class="cs-meta">${c.meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      ${c.bands.map(bandHTML).join('')}
      <a class="cs-next" href="#work/${c.next}" data-case="${c.next}">
        <span class="cs-next-label">NEXT PROJECT</span>
        <span class="cs-next-name">${nx.name}</span>
        <span class="cs-next-title">${nx.title}</span>
      </a>`;
    /* the hero art is the tile's own artwork, so the growth transition lands
       on exactly the thing that was clicked */
    const tile = $(`.tile-link[data-case="${slug}"] .tile-art`);
    const slot = $('#cs-hero-art');
    if (tile && slot) slot.appendChild(tile.cloneNode(true));
  };

  const inertise = on => {
    ['main', '#nav', '.footer'].forEach(sel => {
      const el = $(sel);
      if (!el) return;
      if (on) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
      else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
    });
  };

  const open = (slug, from) => {
    if (!CASES[slug] || openSlug === slug) return;
    openSlug = slug;
    lastFocus = from || document.activeElement;
    render(slug);
    root.setAttribute('aria-hidden', 'false');
    root.classList.add('open');
    document.body.classList.add('case-open');
    inertise(true);
    scroll.scrollTop = 0;
    if (bar) bar.style.transform = 'scaleX(0)';

    /* FLIP: draw the hero art where it belongs, then start it from the tile's
       rect and let it settle. Cheaper and steadier than animating a clone. */
    const slot = $('#cs-hero-art');
    const tileArt = from?.closest?.('.tile-link')?.querySelector('.tile-art');
    if (slot && tileArt && !reduce) {
      const a = tileArt.getBoundingClientRect(), b = slot.getBoundingClientRect();
      if (b.width && b.height) {
        const sx = a.width / b.width, sy = a.height / b.height;
        slot.style.transformOrigin = 'top left';
        slot.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${sx}, ${sy})`;
        slot.getBoundingClientRect();
        slot.style.transition = 'transform .72s cubic-bezier(.19,1,.22,1)';
        requestAnimationFrame(() => { slot.style.transform = 'none'; });
        setTimeout(() => { slot.style.transition = slot.style.transformOrigin = ''; }, 800);
      }
    }
    ($('.case-close', root) || scroll).focus({ preventScroll: true });
  };

  const close = () => {
    if (!openSlug) return;
    openSlug = null;
    root.classList.remove('open');
    root.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('case-open');
    inertise(false);
    setTimeout(() => { if (!openSlug) scroll.innerHTML = ''; }, 460);
    lastFocus?.focus?.({ preventScroll: true });
  };

  const slugFromHash = () =>
    (location.hash.match(/^#work\/([a-z0-9-]+)$/) || [])[1] || null;

  /* open from a tile, or from the next-project link inside an open case */
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-case]');
    if (!trigger) return;
    e.preventDefault();
    const slug = trigger.dataset.case;
    if (openSlug) {                       /* case → case keeps one history entry */
      history.replaceState({ case: slug }, '', '#work/' + slug);
      openSlug = null;
      open(slug, trigger);
    } else {
      history.pushState({ case: slug }, '', '#work/' + slug);
      pushed = true;
      open(slug, trigger);
    }
  });

  $$('[data-case-close]', root).forEach(el => el.addEventListener('click', () => {
    if (pushed) { pushed = false; history.back(); }
    else { history.replaceState(null, '', location.pathname + '#work'); close(); }
  }));

  addEventListener('keydown', e => {
    if (!openSlug) return;
    if (e.key === 'Escape') { e.preventDefault(); $('.case-close', root)?.click(); return; }
    if (e.key !== 'Tab') return;
    /* focus trap */
    const f = $$('a[href], button, [tabindex]:not([tabindex="-1"])', root)
      .filter(el => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  addEventListener('popstate', () => {
    const slug = slugFromHash();
    pushed = false;
    slug ? open(slug) : close();
  });

  /* reading progress */
  scroll.addEventListener('scroll', () => {
    if (!bar) return;
    const max = scroll.scrollHeight - scroll.clientHeight;
    bar.style.transform = `scaleX(${max > 0 ? clamp(scroll.scrollTop / max, 0, 1) : 0})`;
  }, { passive: true });

  /* deep link on first load */
  const initial = slugFromHash();
  if (initial && CASES[initial]) {
    document.addEventListener('site:ready', () => open(initial), { once: true });
  }
}


/* ══ 20. THE PROCESSION ════════════════════════════════════════════════
   Four stick figures walking the hero's front ridge. Position comes from
   the same curve the hill is drawn with, sampled in pixel space so the
   figures meet the crest at any viewport shape. Their limbs are CSS; only
   the traversal is scripted, and it advances in pixels per second rather
   than fraction per second so they walk at one speed on every screen. */
const WALKERS = [
  { sel: '.w-lead', off:  0,     scale: 1    },
  { sel: '.w-2',    off: -0.055, scale: .78  },
  { sel: '.w-3',    off: -0.097, scale: .64  },
  { sel: '.w-4',    off: -0.133, scale: .54  }
];

function initWalkers() {
  const wrap = $('.hero-walk'), hero = $('.hero');
  if (!wrap || !hero) return;
  const svg = $('.walk-svg', wrap), path = $('#walkPath', wrap);
  if (!svg || !path) return;

  const VW = 1440, VH = 180;
  let L = 0, W = 0, H = 0;
  const measure = () => {
    const r = svg.getBoundingClientRect();
    W = r.width; H = r.height; L = path.getTotalLength();
  };
  measure();
  addEventListener('resize', measure, { passive: true });

  const at = f => {
    const p = path.getPointAtLength(clamp(f, 0, 1) * L);
    return { x: p.x / VW * W, y: p.y / VH * H };
  };

  const crew = WALKERS.map(w => ({ ...w, el: $(w.sel, wrap) })).filter(w => w.el);
  if (!crew.length) return;

  const place = (w, f) => {
    if (!W) measure();
    const p = at(f);
    w.el.style.transform =
      `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -100%) scale(${w.scale})`;
    /* fade at the very edges so the wrap from right to left is never a pop */
    w.el.style.opacity = clamp(Math.min(f, 1 - f) * 14, 0, 1).toFixed(3);
  };

  if (reduce) {                       /* stood still on the ridge, mid-hill */
    crew.forEach(w => place(w, 0.46 + w.off));
    return;
  }


  let dist = 0.16, last = 0, raf = null, running = false, resting = false;

  /* Hovering the leader sits the line down. The traversal keeps ticking so
     the figures stay where they are rather than snapping, but stops advancing
     — and it eases back up to speed on the way out so nobody lurches. */
  const lead = $('.w-lead', wrap);
  if (lead && fine) {
    const rest = on => { resting = on; wrap.classList.toggle('resting', on); };
    lead.addEventListener('pointerenter', () => rest(true));
    lead.addEventListener('pointerleave', () => rest(false));
    lead.addEventListener('focus', () => rest(true));
    lead.addEventListener('blur', () => rest(false));
  }

  let pace = 1;                                       /* 0 sat down, 1 walking */
  const frame = now => {
    if (!running) return;
    const dt = Math.min((now - (last || now)) / 1000, 0.1);
    last = now;
    pace += ((resting ? 0 : 1) - pace) * (1 - Math.pow(0.002, dt));
    dist = (dist + (46 / Math.max(W, 1)) * pace * dt) % 1;    /* ~46px a second */
    crew.forEach(w => {
      let f = (dist + w.off) % 1;
      if (f < 0) f += 1;
      place(w, f);
    });
    raf = requestAnimationFrame(frame);
  };

  const start = () => { if (!running) { running = true; last = 0; raf = requestAnimationFrame(frame); } };
  const stop  = () => { running = false; cancelAnimationFrame(raf); };

  /* Start walking straight away and let the observer pause it when the hero
     scrolls away. Gating the start on the observer meant that if the layout
     was still settling — a zero-height element reports no intersection — the
     procession never began at all. Observe the hero, which always has area. */
  start();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden) ? start() : stop(),
      { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  /* a viewport change moves the ridge under their feet */
  addEventListener('resize', () => { measure(); if (!running) crew.forEach(w => place(w, (dist + w.off + 1) % 1)); }, { passive: true });
}

/* ══ 21. BOOT ══════════════════════════════════════════════════════════ */
function boot() {
  initLoader();
  initCursor();
  initNav();
  initMenu();
  initTheme();
  initReel();
  initMarquee();
  initFlight();
  initTiles();
  initDeck();
  initSteps();
  initConstellation();
  initSmoothScroll();
  initCases();
  initWalkers();

  /* Anything that measures type waits for the fonts. The loader is holding
     the page shut until then anyway, so nothing is visibly late. */
  const typeReady = () => {
    prepareSplits();
    watchSplitResize();
    initHeroIntro();
    initReveals();
    scrollBus.kick();
  };

  const fonts = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();
  const ceiling = new Promise(r => setTimeout(r, 3000));
  Promise.race([fonts, ceiling]).then(typeReady);

  scrollBus.kick();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
