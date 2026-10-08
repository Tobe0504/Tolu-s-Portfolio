/* ═══════════════════════════════════════════════════════════════════════════
   App: routing, the home UI laid over the discs, and the project pages.

   Routes (hash based, so deep links work on GitHub Pages with no server):
     #/            client work library
     #/explore     explorations library
     #/p/<slug>    a project page
   ═══════════════════════════════════════════════════════════════════════════ */
import { COLLECTIONS, byCollection, bySlug } from './data.js?v=17';
import { whenFonts, heroImage, galleryImage } from './art.js?v=17';
import { createCarousel, createDiscStage } from './discs.js?v=17';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wait = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const state = { collection: 'work', view: 'home', slug: null, panel: false };
let carousel = null, nextStage = null, unbindProject = null;

/* ── small pieces ─────────────────────────────────────────────────────── */
const STAR = 'M6 .7 7.6 4.2l3.8.4-2.9 2.5.9 3.8L6 8.9 2.6 10.9l.9-3.8L.6 4.6l3.8-.4z';
function stars(n) {
  let out = '';
  for (let i = 0; i < Math.floor(n); i++) out += `<svg viewBox="0 0 12 12"><path d="${STAR}"/></svg>`;
  if (n % 1 >= 0.5) out += `<svg viewBox="0 0 12 12"><clipPath id="h${i_++}"><rect width="6.3" height="12"/></clipPath><path d="${STAR}" clip-path="url(#h${i_ - 1})"/></svg>`;
  return `<span class="stars" aria-label="${n} out of 5">${out}</span>`;
}
let i_ = 0;

/* rolling text swap: the old value lifts out, the new one rises in */
function swap(el, html, delay = 0) {
  if (!el || el.innerHTML === html) return;
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => {
      el.innerHTML = html;
      el.classList.remove('out'); el.classList.add('in');
      void el.offsetWidth;
      el.classList.remove('in');
    }, reduce ? 0 : 170);
  }, reduce ? 0 : delay);
}

/* ── home UI ──────────────────────────────────────────────────────────── */
function showProject(i, p) {
  swap($('#info-title'), esc(p.name), 0);
  swap($('#info-role'), esc(p.role), 40);
  swap($('#info-year'), esc(p.year), 80);
  swap($('#info-team'), p.team.map(esc).join('<br>'), 120);

  const rev = $('#reviews');
  const html = p.reviews.map(r => `
    <figure class="review">
      ${stars(r.stars)}
      <p class="eyebrow">${esc(r.source)}</p>
      <p class="heading-xs"><q>${esc(r.quote)}</q></p>
    </figure>`).join('');
  swap(rev, html, 60);

  const list = byCollection(state.collection);
  $('#status').textContent = `${p.name}, ${i + 1} of ${list.length}`;
  document.querySelectorAll('#index-list button').forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
}

function renderTabs() {
  $('#tabs').innerHTML = COLLECTIONS.map(c =>
    `<a class="tab" role="tab" href="${c.id === 'work' ? '#/' : '#/' + c.id}" aria-selected="${c.id === state.collection}">${esc(c.label)}</a>`).join('');
}

function renderIndex() {
  const list = byCollection(state.collection);
  $('#index-list').innerHTML = list.map((p, i) =>
    `<li><button data-i="${i}" aria-current="${carousel && i === carousel.index()}"><span>${esc(p.name)}</span><span>${esc(p.year)}</span></button></li>`).join('');
  $('#sr-list').innerHTML = list.map(p => `<li><a href="#/p/${p.slug}">${esc(p.name)}, ${esc(p.year)}</a></li>`).join('');
}

function setPanel(open) {
  state.panel = open;
  $('#index-panel').hidden = !open;
  $('#scrim').hidden = !open;
  $('#bar').classList.toggle('wide', open);
  $('#index-btn').setAttribute('aria-expanded', String(open));
  $('#index-label').textContent = open ? String(byCollection(state.collection).length) : 'Index';
  if (open) $('#index-list [aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
}

/* ── the hand-drawn loop ──────────────────────────────────────────────── */
const loop = { on: false, start: 0, seed: 0, until: 0 };

function loopPath(pts, seed) {
  const n = pts.length;
  let cx = 0, cy = 0;
  pts.forEach(([x, y]) => { cx += x; cy += y; });
  cx /= n; cy /= n;
  /* a little over one turn, spiralling slightly outward, so the stroke
     overshoots its own start the way a quick pen loop does */
  const total = Math.round(n * 1.13), start = Math.floor(seed * n), out = [];
  for (let k = 0; k <= total; k++) {
    const [x, y] = pts[(start + k) % n], t = k / total;
    const s = 1.07 + 0.028 * Math.sin(k * 0.41 + seed * 9) + 0.02 * Math.sin(k * 0.13 + seed * 4) + t * 0.04;
    out.push([cx + (x - cx) * s, cy + (y - cy) * s]);
  }
  let d = `M${out[0][0].toFixed(1)},${out[0][1].toFixed(1)}`;
  for (let i = 0; i < out.length - 1; i++) {
    const p0 = out[i - 1] || out[i], p1 = out[i], p2 = out[i + 1], p3 = out[i + 2] || p2;
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ` +
         `${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ` +
         `${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function onHover(on) {
  const svg = $('#loop');
  if (on && state.view === 'home' && !state.panel) {
    loop.on = true; loop.start = performance.now(); loop.seed = Math.random();
    svg.classList.remove('off');
  } else {
    loop.on = false; loop.until = performance.now() + 300;
    svg.classList.add('off');
  }
}

function drawLoop() {
  const now = performance.now();
  if (!loop.on && now > loop.until) return;
  const pts = carousel.centreOutline();
  if (!pts) return;
  const path = $('#loop-path');
  path.setAttribute('d', loopPath(pts, loop.seed));
  const p = reduce ? 1 : Math.min(1, (now - loop.start) / 720);
  path.style.strokeDashoffset = String(1 - (1 - Math.pow(1 - p, 3)));
}

/* ── the library ──────────────────────────────────────────────────────────
   The section is taller than the screen and its face pins. Where the page is
   scrolled inside it decides which disc is in front, so scroll position is
   the single source of truth: arrows, the index and clicking a neighbour all
   scroll the page rather than setting the carousel directly. */
function libGeom() {
  const el = $('.library');
  const top = el.getBoundingClientRect().top + scrollY;
  return { el, top, travel: Math.max(1, el.offsetHeight - innerHeight) };
}

function scrollToDisc(i, instant) {
  const { top, travel } = libGeom();
  const n = byCollection(state.collection).length;
  const y = top + travel * (clamp(i, 0, n - 1) / Math.max(1, n - 1));
  scrollTo({ top: y, behavior: instant || reduce ? 'auto' : 'smooth' });
}

function onPageScroll() {
  if (!carousel || state.view !== 'home') return;
  const { el, top, travel } = libGeom();
  const n = byCollection(state.collection).length;
  /* continuous, not rounded: the discs should move with the scroll */
  carousel.setCurrent(clamp((scrollY - top) / travel, 0, 1) * (n - 1));

  /* only render while the library is actually on screen */
  const r = el.getBoundingClientRect();
  const onScreen = r.top < innerHeight && r.bottom > 0;
  carousel.setActive(onScreen);
  if (!onScreen) onHover(false);
}

function setCollection(id, { scroll = true } = {}) {
  const changed = id !== state.collection || !carousel.count();
  state.collection = id;
  renderTabs(); renderIndex();
  const list = byCollection(id);
  $('.library').style.setProperty('--n', list.length);
  if (!changed) return;
  carousel.setProjects(list, 0);
  if (scroll && state.view === 'home') scrollToDisc(0, true);
}

/* ── project page ─────────────────────────────────────────────────────── */
function tearPath(seed) {
  /* a torn edge: low at the sides, rising into a ragged hill, with small
     tears along the way so it never reads as a smooth curve */
  let s = seed * 997, pts = [];
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let x = 0; x <= 1000; x += 6 + r() * 10) {
    const hill = Math.exp(-Math.pow((x - 560) / 190, 2));
    const y = 230 - hill * 180 + (r() - 0.5) * 16 + Math.sin(x / 23) * 3;
    pts.push(`${x.toFixed(0)},${y.toFixed(1)}`);
  }
  pts.push('1000,230');
  return `M0,0 L1000,0 L1000,230 L${pts.reverse().join(' L')} L0,230 Z`;
}

function projectMarkup(p, next) {
  const tint = `color-mix(in srgb, ${p.art.bg} 9%, #d6d4d1)`;
  const meta = [['Client', p.client], ['Year', p.year], ['Industry', p.industry],
                ['Platform', p.platform], ['Timeline', p.timeline], ['Status', p.status]];
  return `
  <div style="--tint:${tint}">
    <header class="p-head">
      <h1 class="p-title heading-l reveal" style="--d:.05">${esc(p.name)}</h1>
      <p class="p-credits reveal" style="--d:.18">
        <span class="eyebrow">Role</span>${esc(p.role)}
        <span class="eyebrow">Team</span>${p.team.map(esc).join(', ')}
      </p>
    </header>

    <section class="p-meta reveal" style="--d:.28" aria-label="Project details">
      ${meta.map(([k, v]) => `<div class="row"><p class="eyebrow">${esc(k)}</p><p class="paragraph-m">${esc(v)}</p></div>`).join('')}
    </section>

    <section class="p-hero">
      <div class="p-hero-sticky" id="p-media"></div>
      <svg class="p-tear" viewBox="0 0 1000 160" preserveAspectRatio="none" aria-hidden="true"><path d="${tearPath(p.slug.length + p.name.charCodeAt(0))}"/></svg>
      <div class="p-words">
        <a class="p-cta heading-xs" href="${esc(p.links.prototype)}">View prototype</a>
        ${p.tagline.map(w => `<div class="p-word"><span class="heading-xl">${esc(w)}</span></div>`).join('')}
      </div>
    </section>

    <div class="p-after">
      <section class="p-opening"><p class="p-summary paragraph-l">${esc(p.summary)}</p></section>

      <section class="p-chapter">
        <p class="eyebrow">The problem</p>
        <p class="p-prose paragraph-l">${esc(p.challenge)}</p>
      </section>

      <section class="p-chapter">
        <p class="eyebrow">The work</p>
        <ol class="p-steps">
          ${p.approach.map((a, i) => `
            <li>
              <span class="p-step-n eyebrow">${String(i + 1).padStart(2, '0')}</span>
              <div><h3 class="heading-xs">${esc(a.title)}</h3><p>${esc(a.text)}</p></div>
            </li>`).join('')}
        </ol>
      </section>

      <section class="p-gallery" aria-label="Selected screens">
        ${p.gallery.map((g, i) => `
          <figure class="p-shot-wrap${i === 0 ? ' wide' : ''}">
            <div class="p-shot" data-variant="${esc(g.variant)}" data-i="${i}"></div>
            <figcaption class="eyebrow">${esc(g.caption)}</figcaption>
          </figure>`).join('')}
      </section>

      <section class="p-chapter">
        <p class="eyebrow">The outcome</p>
        <div class="p-metrics">
          ${p.outcome.map(o => `<div><b class="heading-m">${esc(o.value)}</b><span class="eyebrow">${esc(o.label)}</span></div>`).join('')}
        </div>
      </section>

      <blockquote class="p-quote">
        <p class="heading-m">&ldquo;${esc(p.quote.text)}&rdquo;</p>
        <cite class="eyebrow">${esc(p.quote.who)}</cite>
      </blockquote>

      <section class="p-foot">
        <a class="p-live heading-xs" href="${esc(p.links.live)}">View live</a>
        <p class="p-sign">${esc(p.name)}.</p>
      </section>
    </div>

    <a class="p-next" href="#/p/${next.slug}" aria-label="Next project: ${esc(next.name)}">
      <div class="p-next-inner">
        <div class="p-next-lines" aria-hidden="true">${'<span></span>'.repeat(6)}</div>
        <h2 class="p-next-title heading-l">
          ${next.name.split(' ').map((w, i, arr) => `<span class="p-next-word" style="grid-row:${3 + i}; justify-self:${arr.length === 1 ? 'center' : (i % 2 ? 'end' : 'start')}">${esc(w)}</span>`).join('')}
        </h2>
        <div class="p-next-disc" id="p-next-disc"></div>
      </div>
    </a>
  </div>`;
}

function mountProject(p) {
  const list = byCollection(p.collection);
  const next = list[(list.indexOf(p) + 1) % list.length];
  const root = $('#project');
  root.innerHTML = projectMarkup(p, next);
  root.hidden = false;
  document.title = `${p.name} — Tolulope Elijah`;

  const media = $('#p-media');
  if (p.heroImage) {
    const img = new Image(); img.src = p.heroImage; img.alt = ''; media.appendChild(img);
  } else {
    const c = heroImage(p); c.setAttribute('aria-hidden', 'true'); media.appendChild(c);
  }

  /* gallery shots are painted as they approach, not all at once on load */
  const shots = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      shots.unobserve(e.target);
      const img = galleryImage(p, e.target.dataset.variant);
      img.setAttribute('aria-hidden', 'true');
      e.target.appendChild(img);
    });
  }, { rootMargin: '30% 0px' });
  $$('.p-shot', root).forEach(el => shots.observe(el));

  /* the next disc only spins up when its section is near, and rises with scroll */
  const nextEl = $('.p-next', root), discEl = $('#p-next-disc', root);
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !nextStage) {
      try { nextStage = createDiscStage(discEl, next); } catch { /* no WebGL: the title alone still works */ }
    }
  }, { rootMargin: '40% 0px' });
  io.observe(nextEl);

  /* The ending is a tall sticky section. Scrolling through it lifts the next
     project's disc from below the fold up and off the top of the screen; once
     it has left, the handover happens on its own and the next page animates
     in. Clicking anywhere in the section still jumps straight there. */
  let handedOver = false;
  const onScroll = () => {
    const r = nextEl.getBoundingClientRect();
    const travel = Math.max(1, nextEl.offsetHeight - innerHeight);
    const t = Math.min(1, Math.max(0, -r.top / travel));
    discEl.style.setProperty('--rise', `${58 - t * 96}%`);
    nextStage && nextStage.setProgress(t);
    if (t > 0.94 && !handedOver) {
      handedOver = true;
      location.hash = '#/p/' + next.slug;
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  unbindProject = () => { io.disconnect(); shots.disconnect(); removeEventListener('scroll', onScroll); };
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('in')));
}

function unmountProject() {
  unbindProject && unbindProject(); unbindProject = null;
  if (nextStage) { nextStage.dispose(); nextStage = null; }
  const root = $('#project');
  root.classList.remove('in'); root.hidden = true; root.innerHTML = '';
}

async function openProject(slug) {
  const p = bySlug(slug);
  if (!p) { location.hash = '#/'; return; }
  const fromHome = state.view === 'home';
  setPanel(false); onHover(false);

  /* bring the library to the right disc first, so going back lands on it */
  const i = byCollection(p.collection).indexOf(p);
  if (p.collection !== state.collection) setCollection(p.collection, { scroll: false });
  carousel.jump(i);

  if (fromHome && !reduce) {
    carousel.open(true);
    document.body.classList.add('leaving');
    await wait(460);
  }
  unmountProject();
  state.view = 'project'; state.slug = slug;
  carousel.setScrollDriven(false);
  carousel.setActive(false);
  document.body.dataset.view = 'project';
  document.body.classList.remove('leaving');
  scrollTo(0, 0);
  mountProject(p);
}

function goHome(collection) {
  const wasProject = state.view === 'project';
  const slug = state.slug;
  state.view = 'home'; state.slug = null;
  unmountProject();
  document.body.dataset.view = 'home';
  document.title = 'Tolulope Elijah — Work';
  carousel.setActive(true);
  carousel.setScrollDriven(true);
  carousel.open(false);
  const p = slug && bySlug(slug);
  const index = p && p.collection === collection ? byCollection(collection).indexOf(p) : -1;
  setCollection(collection, { scroll: false });
  if (index >= 0) { carousel.jump(index); scrollToDisc(index, true); }
  else if (wasProject) scrollToDisc(0, true);
  onPageScroll();
}

function route() {
  const h = location.hash;
  const m = h.match(/^#\/p\/([\w-]+)$/);
  if (m) return openProject(m[1]);
  const col = COLLECTIONS.some(c => '#/' + c.id === h && c.id !== 'work') ? h.slice(2) : 'work';
  goHome(col);
}

/* ── input ────────────────────────────────────────────────────────────── */
function bindInput() {
  addEventListener('scroll', onPageScroll, { passive: true });
  addEventListener('resize', onPageScroll, { passive: true });

  addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.panel) { setPanel(false); $('#index-btn').focus(); return; }
    if (state.view !== 'home' || state.panel) return;
    if (/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName)) return;
    const onLink = document.activeElement?.closest?.('a, button');
    /* only take the keys while the library is the thing on screen */
    const r = $('.library').getBoundingClientRect();
    if (!(r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5)) return;
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); scrollToDisc(carousel.index() + 1); break;
      case 'ArrowLeft':  e.preventDefault(); scrollToDisc(carousel.index() - 1); break;
      case 'Enter': if (!onLink) { e.preventDefault(); location.hash = '#/p/' + carousel.project().slug; } break;
      case ' ':     if (!onLink) { e.preventDefault(); carousel.flip(); } break;
    }
  });

  $('#index-btn').addEventListener('click', () => setPanel(!state.panel));
  $('#scrim').addEventListener('click', () => setPanel(false));
  $('#index-list').addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    scrollToDisc(+b.dataset.i);
    setPanel(false);
  });
  addEventListener('hashchange', route);
}


/* ══ HERO ═══════════════════════════════════════════════════════════════ */
const ROTATE_WORDS = ['Listens', 'Ships', 'Notices', 'Refines'];

/* the second line of the headline changes word: the old one leaves upward,
   the new one arrives from below, a character at a time */
function initRotator() {
  const el = $('#rotator');
  if (!el) return;
  let i = 0;

  const paint = (word, animate) => {
    el.textContent = '';
    [...word].forEach((ch, n) => {
      const sp = document.createElement('span');
      sp.className = 'r-char';
      sp.textContent = ch;
      if (animate && !reduce) {
        sp.style.transform = 'translateY(90%)';
        sp.style.opacity = '0';
        sp.style.transition = `transform .8s var(--ease) ${n * 0.035}s, opacity .5s ease ${n * 0.035}s`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          sp.style.transform = 'none'; sp.style.opacity = '1';
        }));
      }
      el.appendChild(sp);
    });
  };

  const leave = () => new Promise(done => {
    const chars = $$('.r-char', el);
    if (reduce || !chars.length) return done();
    chars.forEach((sp, n) => {
      sp.style.transition = `transform .42s cubic-bezier(.55,.06,.68,.19) ${n * 0.026}s, opacity .34s ease ${n * 0.026}s`;
      sp.style.transform = 'translateY(-80%)';
      sp.style.opacity = '0';
    });
    setTimeout(done, 430 + chars.length * 26);
  });

  paint(ROTATE_WORDS[0], false);
  if (reduce) return;

  let timer = null;
  const tick = async () => {
    /* no point animating a headline nobody is looking at */
    if (document.hidden || $('.hero').getBoundingClientRect().bottom < 0) return;
    await leave();
    i = (i + 1) % ROTATE_WORDS.length;
    paint(ROTATE_WORDS[i], true);
  };
  const run = () => { clearInterval(timer); timer = setInterval(tick, 3400); };
  run();
  document.addEventListener('visibilitychange', () => document.hidden ? clearInterval(timer) : run());
}

/* ══ THE PROCESSION ═════════════════════════════════════════════════════
   The figures walk the rule at the foot of the hero. Position comes from the
   same path the rule is drawn along, sampled in pixel space, and the walk
   advances in pixels per second so they move at one speed on every screen. */
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
    const pt = path.getPointAtLength(clamp(f, 0, 1) * L);
    return { x: pt.x / VW * W, y: pt.y / VH * H };
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

  if (reduce) { crew.forEach(w => place(w, 0.46 + w.off)); return; }

  let dist = 0.16, last = 0, raf = null, running = false, resting = false;

  /* hovering the leader sits the whole line down */
  const lead = $('.w-lead', wrap);
  if (lead && fine) {
    const rest = on => { resting = on; wrap.classList.toggle('resting', on); };
    lead.addEventListener('pointerenter', () => rest(true));
    lead.addEventListener('pointerleave', () => rest(false));
    lead.addEventListener('focus', () => rest(true));
    lead.addEventListener('blur', () => rest(false));
  }

  let pace = 1;
  const frame = now => {
    if (!running) return;
    const dt = Math.min((now - (last || now)) / 1000, 0.1);
    last = now;
    pace += ((resting ? 0 : 1) - pace) * (1 - Math.pow(0.002, dt));
    dist = (dist + (46 / Math.max(W, 1)) * pace * dt) % 1;
    crew.forEach(w => {
      let f = (dist + w.off) % 1;
      if (f < 0) f += 1;
      place(w, f);
    });
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!running) { running = true; last = 0; raf = requestAnimationFrame(frame); } };
  const stop  = () => { running = false; cancelAnimationFrame(raf); };

  start();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden) ? start() : stop(),
      { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  addEventListener('resize', () => {
    measure();
    if (!running) crew.forEach(w => place(w, (dist + w.off + 1) % 1));
  }, { passive: true });
}

/* ══ REVEALS ════════════════════════════════════════════════════════════ */
function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix;
  if (!target) { el.innerHTML = suffix || '0'; return; }
  if (reduce) { el.textContent = String(target); return; }
  const t0 = performance.now();
  const step = now => {
    const p = clamp((now - t0) / 1300, 0, 1);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initReveals() {
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
    $$('[data-count], [data-suffix]').forEach(countUp);
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      e.target.classList.add('in');
      const n = e.target.querySelector('[data-count], [data-suffix]');
      if (n) countUp(n);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  items.forEach(el => io.observe(el));
}

/* ── boot ─────────────────────────────────────────────────────────────── */
async function boot() {
  renderTabs();
  await whenFonts();                 /* labels are painted with the web fonts */
  try {
    carousel = createCarousel($('#stage'), {
      onChange: showProject,
      onOpen: p => { location.hash = '#/p/' + p.slug; },
      onPick: i => scrollToDisc(i),
      onHover,
      onFrame: drawLoop
    });
  } catch (err) {
    document.body.insertAdjacentHTML('beforeend',
      '<p class="noscript">This library needs WebGL to show its discs. The index below still works.</p>');
    console.error(err);
    return;
  }
  carousel.setScrollDriven(true);
  bindInput();
  initRotator();
  initWalkers();
  initReveals();
  setCollection(state.collection, { scroll: false });
  route();
  onPageScroll();
}

boot();
