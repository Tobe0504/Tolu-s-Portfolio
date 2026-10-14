/* ═══════════════════════════════════════════════════════════════════════════
   App: routing, the home UI laid over the discs, and the project pages.

   Routes (hash based, so deep links work on GitHub Pages with no server):
     #/            client work library
     #/explore     explorations library
     #/p/<slug>    a project page
   ═══════════════════════════════════════════════════════════════════════════ */
import { COLLECTIONS, byCollection, bySlug } from "./data.js?v=33";
import {
  whenFonts,
  heroImage,
  galleryImage,
  sceneImage,
  heroScenery,
  heroSun,
  heroMoon,
  heroCloud,
  heroBird,
  doodle,
  setInk,
} from "./art.js?v=33";
import { createCarousel, createDiscStage } from "./discs.js?v=33";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* a repeatable random, so a given mark always wobbles the same way */
const rng = (seed) => {
  let h = 2166136261;
  for (const c of String(seed)) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
};
const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
const esc = (t) =>
  String(t).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

const state = { collection: "work", view: "home", slug: null, panel: false };
let carousel = null,
  nextStage = null,
  unbindProject = null;
let scene = null,
  player = null,
  redrawHero = null,
  waveAt = 0;

/* ── small pieces ─────────────────────────────────────────────────────── */
const STAR =
  "M6 .7 7.6 4.2l3.8.4-2.9 2.5.9 3.8L6 8.9 2.6 10.9l.9-3.8L.6 4.6l3.8-.4z";
function stars(n) {
  let out = "";
  for (let i = 0; i < Math.floor(n); i++)
    out += `<svg viewBox="0 0 12 12"><path d="${STAR}"/></svg>`;
  if (n % 1 >= 0.5)
    out += `<svg viewBox="0 0 12 12"><clipPath id="h${i_++}"><rect width="6.3" height="12"/></clipPath><path d="${STAR}" clip-path="url(#h${i_ - 1})"/></svg>`;
  return `<span class="stars" aria-label="${n} out of 5">${out}</span>`;
}
let i_ = 0;

/* rolling text swap: the old value lifts out, the new one rises in */
function swap(el, html, delay = 0) {
  if (!el || el.innerHTML === html) return;
  setTimeout(
    () => {
      el.classList.add("out");
      setTimeout(
        () => {
          el.innerHTML = html;
          el.classList.remove("out");
          el.classList.add("in");
          void el.offsetWidth;
          el.classList.remove("in");
        },
        reduce ? 0 : 170,
      );
    },
    reduce ? 0 : delay,
  );
}

/* ── home UI ──────────────────────────────────────────────────────────── */
function showProject(i, p) {
  swap($("#info-title"), esc(p.name), 0);
  swap($("#info-role"), esc(p.role), 40);
  swap($("#info-year"), esc(p.year), 80);
  swap($("#info-team"), p.team.map(esc).join("<br>"), 120);

  const rev = $("#reviews");
  const html = p.reviews
    .map(
      (r) => `
    <figure class="review">
      ${stars(r.stars)}
      <p class="eyebrow">${esc(r.source)}</p>
      <p class="heading-xs"><q>${esc(r.quote)}</q></p>
    </figure>`,
    )
    .join("");
  swap(rev, html, 60);

  /* the whole page takes its colour from whatever disc is in front */
  document.body.style.setProperty("--accent", p.art.bg);
  scene && scene.show(p);

  const t = p.track || {};
  $("#track-no").textContent = `Track ${String(i + 1).padStart(2, "0")}`;
  $("#track-dur").textContent = t.duration || "";
  $("#track-title").textContent = t.title || p.name;
  if (player && player.isPlaying()) player.stop();
  waveAt = 0;
  drawWave($("#track-wave"), p, 0);

  const list = byCollection(state.collection);
  $("#status").textContent = `${p.name}, ${i + 1} of ${list.length}`;
  document
    .querySelectorAll("#index-list button")
    .forEach((b, k) => b.setAttribute("aria-current", String(k === i)));
}

function renderTabs() {
  $("#tabs").innerHTML = COLLECTIONS.map(
    (c) =>
      `<a class="tab" role="tab" href="${c.id === "work" ? "#/" : "#/" + c.id}" aria-selected="${c.id === state.collection}">${esc(c.label)}</a>`,
  ).join("");
}

function renderIndex() {
  const list = byCollection(state.collection);
  $("#index-list").innerHTML = list
    .map(
      (p, i) =>
        `<li><button data-i="${i}" aria-current="${carousel && i === carousel.index()}"><span>${esc(p.name)}</span><span>${esc(p.year)}</span></button></li>`,
    )
    .join("");
  $("#sr-list").innerHTML = list
    .map(
      (p) =>
        `<li><a href="#/p/${p.slug}">${esc(p.name)}, ${esc(p.year)}</a></li>`,
    )
    .join("");
}

function setPanel(open) {
  state.panel = open;
  $("#index-panel").hidden = !open;
  $("#scrim").hidden = !open;
  $("#bar").classList.toggle("wide", open);
  $("#index-btn").setAttribute("aria-expanded", String(open));
  $("#index-label").textContent = open
    ? String(byCollection(state.collection).length)
    : "Index";
  if (open)
    $('#index-list [aria-current="true"]')?.scrollIntoView({
      block: "nearest",
    });
}

/* ── the hand-drawn loop ──────────────────────────────────────────────── */
const loop = { on: false, start: 0, seed: 0, until: 0 };

function loopPath(pts, seed) {
  const n = pts.length;
  let cx = 0,
    cy = 0;
  pts.forEach(([x, y]) => {
    cx += x;
    cy += y;
  });
  cx /= n;
  cy /= n;
  /* a little over one turn, spiralling slightly outward, so the stroke
     overshoots its own start the way a quick pen loop does */
  const total = Math.round(n * 1.13),
    start = Math.floor(seed * n),
    out = [];
  for (let k = 0; k <= total; k++) {
    const [x, y] = pts[(start + k) % n],
      t = k / total;
    const s =
      1.07 +
      0.028 * Math.sin(k * 0.41 + seed * 9) +
      0.02 * Math.sin(k * 0.13 + seed * 4) +
      t * 0.04;
    out.push([cx + (x - cx) * s, cy + (y - cy) * s]);
  }
  let d = `M${out[0][0].toFixed(1)},${out[0][1].toFixed(1)}`;
  for (let i = 0; i < out.length - 1; i++) {
    const p0 = out[i - 1] || out[i],
      p1 = out[i],
      p2 = out[i + 1],
      p3 = out[i + 2] || p2;
    d +=
      `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ` +
      `${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ` +
      `${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function onHover(on) {
  const svg = $("#loop");
  if (on && state.view === "home" && !state.panel) {
    loop.on = true;
    loop.start = performance.now();
    loop.seed = Math.random();
    svg.classList.remove("off");
  } else {
    loop.on = false;
    /* while a track plays the ring stays drawn around the disc in front */
    if (player && player.isPlaying()) return;
    loop.until = performance.now() + 300;
    svg.classList.add("off");
  }
}

function drawLoop() {
  const now = performance.now();
  const live = !!(player && player.isPlaying());
  if (!loop.on && !live && now > loop.until) return;
  const pts = carousel.centreOutline();
  if (!pts) return;
  const path = $("#loop-path");
  path.setAttribute("d", loopPath(pts, loop.seed));
  const p = reduce || live ? 1 : Math.min(1, (now - loop.start) / 720);
  path.style.strokeDashoffset = String(1 - (1 - Math.pow(1 - p, 3)));
}

/* ── the library ──────────────────────────────────────────────────────────
   The section is taller than the screen and its face pins. Where the page is
   scrolled inside it decides which disc is in front, so scroll position is
   the single source of truth: arrows, the index and clicking a neighbour all
   scroll the page rather than setting the carousel directly. */
/* The section carries a run-out at the end: a stretch of scroll after the
   last disc where the discs hold and the whole face fades. Without it the
   face is still full of discs when the section un-pins, and the band rising
   from below slices whatever is mid-exit straight across. The same figure
   is set as --lib-tail in the stylesheet, which reserves the height. */
const LIB_TAIL = 0.45; /* of a screen */

function libGeom() {
  const el = $(".library");
  const top = el.getBoundingClientRect().top + scrollY;
  const travel = Math.max(1, el.offsetHeight - innerHeight);
  /* never fed back into the section's height — that would chase itself */
  const tail = Math.min(innerHeight * LIB_TAIL, travel * 0.5);
  return { el, top, travel, tail, disc: Math.max(1, travel - tail) };
}

function scrollToDisc(i, instant) {
  const { top, disc } = libGeom();
  const n = byCollection(state.collection).length;
  const y = top + disc * (clamp(i, 0, n - 1) / Math.max(1, n - 1));
  scrollTo({ top: y, behavior: instant || reduce ? "auto" : "smooth" });
}

/* Scroll drives the discs continuously, which is what makes them read as
   wheeled past rather than clicked through. The cost is that letting go
   halfway leaves two discs sharing the frame, so once the page goes quiet
   the library takes up the slack and settles on whichever disc is nearest. */
let snapTimer = 0;
function scheduleSnap() {
  clearTimeout(snapTimer);
  if (reduce) return;
  snapTimer = setTimeout(() => {
    if (!carousel || state.view !== "home" || state.panel) return;
    const { el, top, disc } = libGeom();
    const r = el.getBoundingClientRect();
    /* only while the face is pinned — arriving and leaving belong to the page */
    if (r.top > 1 || r.bottom < innerHeight - 1) return;
    /* and never during the run-out: the discs have had their say by then */
    if (scrollY - top > disc) return;
    const n = byCollection(state.collection).length;
    const at = clamp((scrollY - top) / disc, 0, 1) * (n - 1);
    const i = Math.round(at);
    if (Math.abs(at - i) < 0.04) return; /* close enough; don't nudge */
    scrollToDisc(i);
  }, 170);
}

function onPageScroll() {
  if (!carousel || state.view !== "home") return;
  const { el, top, tail, disc } = libGeom();
  const n = byCollection(state.collection).length;
  const into = scrollY - top;
  /* continuous, not rounded: the discs should move with the scroll */
  carousel.setCurrent(clamp(into / disc, 0, 1) * (n - 1));

  /* the run-out: the face dims away before the edge can cut it */
  /* The run-out. The discs do not fade: they keep travelling, so the last
     one leaves through the bottom-left corner exactly as every disc before
     it did, softening into the haze on the way. Only the paper furniture
     around them — the scene, the details, the track, the quotes — dims, so
     the band rising from below has nothing left to cut across. */
  const out = clamp((into - disc) / tail, 0, 1);
  carousel.setExit(out * 2.2);
  el.style.setProperty("--lib-fade", String(1 - out * out));

  /* only render while the library is actually on screen */
  const r = el.getBoundingClientRect();
  const onScreen = r.top < innerHeight && r.bottom > 0;
  carousel.setActive(onScreen);
  if (!onScreen) {
    onHover(false);
    if (player && player.isPlaying()) player.stop();
  }
  if (onScreen) scheduleSnap();
}

function setCollection(id, { scroll = true } = {}) {
  const changed = id !== state.collection || !carousel.count();
  state.collection = id;
  renderTabs();
  renderIndex();
  const list = byCollection(id);
  $(".library").style.setProperty("--n", list.length);
  if (!changed) return;
  carousel.setProjects(list, 0);
  if (scroll && state.view === "home") scrollToDisc(0, true);
}

/* ── project page ─────────────────────────────────────────────────────── */
function tearPath(seed) {
  /* a torn edge: low at the sides, rising into a ragged hill, with small
     tears along the way so it never reads as a smooth curve */
  let s = seed * 997,
    pts = [];
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let x = 0; x <= 1000; x += 6 + r() * 10) {
    const hill = Math.exp(-Math.pow((x - 560) / 190, 2));
    const y = 230 - hill * 180 + (r() - 0.5) * 16 + Math.sin(x / 23) * 3;
    pts.push(`${x.toFixed(0)},${y.toFixed(1)}`);
  }
  pts.push("1000,230");
  return `M0,0 L1000,0 L1000,230 L${pts.reverse().join(" L")} L0,230 Z`;
}

function projectMarkup(p, next) {
  const tint = `color-mix(in srgb, ${p.art.bg} 9%, var(--tint-base))`;
  const meta = [
    ["Client", p.client],
    ["Year", p.year],
    ["Industry", p.industry],
    ["Platform", p.platform],
    ["Timeline", p.timeline],
    ["Status", p.status],
  ];
  return `
  <div style="--tint:${tint}">
    <header class="p-head">
      <h1 class="p-title heading-l reveal" style="--d:.05">${esc(p.name)}</h1>
      <p class="p-credits reveal" style="--d:.18">
        <span class="eyebrow">Role</span>${esc(p.role)}
        <span class="eyebrow">Team</span>${p.team.map(esc).join(", ")}
      </p>
    </header>

    <section class="p-meta reveal" style="--d:.28" aria-label="Project details">
      ${meta.map(([k, v]) => `<div class="row"><p class="eyebrow">${esc(k)}</p><p class="paragraph-m">${esc(v)}</p></div>`).join("")}
    </section>

    <section class="p-hero">
      <div class="p-hero-sticky" id="p-media"></div>
      <div class="p-words">
        <a class="p-cta heading-xs" href="${esc(p.links.prototype)}">View prototype</a>
        ${p.tagline.map((w) => `<div class="p-word"><span class="heading-xl">${esc(w)}</span></div>`).join("")}
      </div>
    </section>

    <div class="p-after">
      <div class="p-stickers" aria-hidden="true"></div>
      <section class="p-opening">
        <p class="p-summary paragraph-l">${esc(p.summary)}</p>
      </section>

      <section class="p-chapter">
        <p class="eyebrow">The problem</p>
        <p class="p-prose paragraph-l">${esc(p.challenge)}</p>
      </section>

      <section class="p-chapter">
        <p class="eyebrow">The work</p>
        <ol class="p-steps">
          ${p.approach
            .map(
              (a, i) => `
            <li>
              <span class="p-step-n eyebrow">${String(i + 1).padStart(2, "0")}</span>
              <div><h3 class="heading-xs">${esc(a.title)}</h3><p>${esc(a.text)}</p></div>
            </li>`,
            )
            .join("")}
        </ol>
      </section>

      <section class="p-gallery" aria-label="Selected screens">
        ${p.gallery
          .map(
            (g, i) => `
          <figure class="p-shot-wrap${i === 0 ? " wide" : ""}">
            <div class="p-shot" data-variant="${esc(g.variant)}" data-i="${i}"></div>
            <figcaption class="eyebrow">${esc(g.caption)}</figcaption>
          </figure>`,
          )
          .join("")}
      </section>

      <section class="p-chapter">
        <p class="eyebrow">The outcome</p>
        <div class="p-metrics">
          ${p.outcome
            .map(
              (o, i) => `
            <div class="p-badge" style="--turn:${(i % 2 ? 1 : -1) * (1.6 + i * 0.5)}deg">
              <b class="heading-m">${esc(o.value)}</b>
              <span class="eyebrow">${esc(o.label)}</span>
            </div>`,
            )
            .join("")}
        </div>
      </section>

      <blockquote class="p-quote">
        <div class="p-bubble">
          <p class="heading-m">&ldquo;${esc(p.quote.text)}&rdquo;</p>
          <svg class="p-bubble-tail" viewBox="0 0 60 44" aria-hidden="true">
            <path d="M6 2c2 14 10 26 24 34-7-1-12-2-16-4 6 6 14 9 24 10-18 1-30-6-36-18" />
          </svg>
        </div>
        <cite class="eyebrow">${esc(p.quote.who)}</cite>
      </blockquote>

      <section class="p-foot">
        <a class="p-live heading-xs" href="${esc(p.links.live)}">View live</a>
        <p class="p-sign">${esc(p.name)}.</p>
      </section>
    </div>

    <a class="p-next" href="#/p/${next.slug}" aria-label="Next project: ${esc(next.name)}">
      <div class="p-next-inner">
        <div class="p-next-lines" aria-hidden="true">${"<span></span>".repeat(6)}</div>
        <h2 class="p-next-title heading-l">
          ${next.name
            .split(" ")
            .map(
              (w, i, arr) =>
                `<span class="p-next-word" style="grid-row:${3 + i}; justify-self:${arr.length === 1 ? "center" : i % 2 ? "end" : "start"}">${esc(w)}</span>`,
            )
            .join("")}
        </h2>
        <div class="p-next-disc" id="p-next-disc"></div>
      </div>
    </a>
  </div>`;
}

function mountProject(p) {
  const list = byCollection(p.collection);
  const next = list[(list.indexOf(p) + 1) % list.length];
  const root = $("#project");
  root.innerHTML = projectMarkup(p, next);
  root.hidden = false;
  document.title = `${p.name} — Tolulope Elijah`;

  const media = $("#p-media");
  if (p.heroImage) {
    const img = new Image();
    img.src = p.heroImage;
    img.alt = "";
    media.appendChild(img);
  } else {
    const c = heroImage(p);
    c.setAttribute("aria-hidden", "true");
    media.appendChild(c);
  }

  /* Stickers down the margins: blooms, butterflies, hearts, bows and
     sparkles, scattered on a seed from the slug so a project's page is
     always decorated the same way and no two are alike. */
  const sr = rng(p.slug + "stick");
  const kinds = ["bloom", "butterfly", "heart", "bow", "sparkle"];
  const stickers = $(".p-stickers", root);
  for (let i = 0; i < 9; i++) {
    const kind = kinds[Math.floor(sr() * kinds.length)];
    const size = 26 + sr() * 44;
    const c = doodle(kind, size, p.slug + i, p.art.bg);
    c.className = "p-sticker";
    c.style.top = `${4 + i * 10.5 + sr() * 4}%`;
    c.style[i % 2 ? "right" : "left"] = `${1 + sr() * 5}%`;
    c.style.setProperty("--turn", `${(sr() - 0.5) * 36}deg`);
    stickers.appendChild(c);
  }

  /* gallery shots are painted as they approach, not all at once on load */
  const shots = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        shots.unobserve(e.target);
        const img = galleryImage(p, e.target.dataset.variant);
        img.setAttribute("aria-hidden", "true");
        e.target.appendChild(img);
      });
    },
    { rootMargin: "30% 0px" },
  );
  $$(".p-shot", root).forEach((el) => shots.observe(el));

  /* the next disc only spins up when its section is near, and rises with scroll */
  const nextEl = $(".p-next", root),
    discEl = $("#p-next-disc", root);
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting && !nextStage) {
        try {
          nextStage = createDiscStage(discEl, next);
        } catch {
          /* no WebGL: the title alone still works */
        }
      }
    },
    { rootMargin: "40% 0px" },
  );
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
    discEl.style.setProperty("--rise", `${58 - t * 96}%`);
    nextStage && nextStage.setProgress(t);
    if (t > 0.94 && !handedOver) {
      handedOver = true;
      location.hash = "#/p/" + next.slug;
    }
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  unbindProject = () => {
    io.disconnect();
    shots.disconnect();
    removeEventListener("scroll", onScroll);
  };
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.classList.add("in")),
  );
}

function unmountProject() {
  unbindProject && unbindProject();
  unbindProject = null;
  if (nextStage) {
    nextStage.dispose();
    nextStage = null;
  }
  const root = $("#project");
  root.classList.remove("in");
  root.hidden = true;
  root.innerHTML = "";
}

async function openProject(slug) {
  const p = bySlug(slug);
  if (!p) {
    location.hash = "#/";
    return;
  }
  const fromHome = state.view === "home";
  setPanel(false);
  onHover(false);

  /* bring the library to the right disc first, so going back lands on it */
  const i = byCollection(p.collection).indexOf(p);
  if (p.collection !== state.collection)
    setCollection(p.collection, { scroll: false });
  carousel.jump(i);

  if (fromHome && !reduce) {
    carousel.open(true);
    document.body.classList.add("leaving");
    await wait(460);
  }
  if (player && player.isPlaying()) player.stop();
  unmountProject();
  state.view = "project";
  state.slug = slug;
  carousel.setScrollDriven(false);
  carousel.setActive(false);
  document.body.dataset.view = "project";
  document.body.classList.remove("leaving");
  scrollTo(0, 0);
  mountProject(p);
}

function goHome(collection) {
  const wasProject = state.view === "project";
  const slug = state.slug;
  state.view = "home";
  state.slug = null;
  unmountProject();
  document.body.dataset.view = "home";
  document.title = "Tolulope Elijah — Work";
  carousel.setActive(true);
  carousel.setScrollDriven(true);
  carousel.open(false);
  const p = slug && bySlug(slug);
  const index =
    p && p.collection === collection ? byCollection(collection).indexOf(p) : -1;
  setCollection(collection, { scroll: false });
  if (index >= 0) {
    carousel.jump(index);
    scrollToDisc(index, true);
  } else if (wasProject) scrollToDisc(0, true);
  onPageScroll();
}

function route() {
  const h = location.hash;
  const m = h.match(/^#\/p\/([\w-]+)$/);
  if (m) return openProject(m[1]);
  const col = COLLECTIONS.some((c) => "#/" + c.id === h && c.id !== "work")
    ? h.slice(2)
    : "work";
  goHome(col);
}

/* ── input ────────────────────────────────────────────────────────────── */
function bindInput() {
  addEventListener("scroll", onPageScroll, { passive: true });
  addEventListener("resize", onPageScroll, { passive: true });

  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.panel) {
      setPanel(false);
      $("#index-btn").focus();
      return;
    }
    if (state.view !== "home" || state.panel) return;
    if (/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName)) return;
    const onLink = document.activeElement?.closest?.("a, button");
    /* only take the keys while the library is the thing on screen */
    const r = $(".library").getBoundingClientRect();
    if (!(r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5)) return;
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        scrollToDisc(carousel.index() + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        scrollToDisc(carousel.index() - 1);
        break;
      case "Enter":
        if (!onLink) {
          e.preventDefault();
          location.hash = "#/p/" + carousel.project().slug;
        }
        break;
      case " ":
        if (!onLink) {
          e.preventDefault();
          carousel.flip();
        }
        break;
    }
  });

  $("#index-btn").addEventListener("click", () => setPanel(!state.panel));
  $("#scrim").addEventListener("click", () => setPanel(false));
  $("#index-list").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (!b) return;
    scrollToDisc(+b.dataset.i);
    setPanel(false);
  });
  addEventListener("hashchange", route);
}

/* ══ HERO ═══════════════════════════════════════════════════════════════ */
const ROTATE_WORDS = ["Listens", "Ships", "Notices", "Refines"];

/* the second line of the headline changes word: the old one leaves upward,
   the new one arrives from below, a character at a time */
function initRotator() {
  const el = $("#rotator");
  if (!el) return;
  let i = 0;

  const paint = (word, animate) => {
    el.textContent = "";
    [...word].forEach((ch, n) => {
      const sp = document.createElement("span");
      sp.className = "r-char";
      sp.textContent = ch;
      if (animate && !reduce) {
        sp.style.transform = "translateY(90%)";
        sp.style.opacity = "0";
        sp.style.transition = `transform .8s var(--ease) ${n * 0.035}s, opacity .5s ease ${n * 0.035}s`;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            sp.style.transform = "none";
            sp.style.opacity = "1";
          }),
        );
      }
      el.appendChild(sp);
    });
  };

  const leave = () =>
    new Promise((done) => {
      const chars = $$(".r-char", el);
      if (reduce || !chars.length) return done();
      chars.forEach((sp, n) => {
        sp.style.transition = `transform .42s cubic-bezier(.55,.06,.68,.19) ${n * 0.026}s, opacity .34s ease ${n * 0.026}s`;
        sp.style.transform = "translateY(-80%)";
        sp.style.opacity = "0";
      });
      setTimeout(done, 430 + chars.length * 26);
    });

  paint(ROTATE_WORDS[0], false);
  if (reduce) return;

  let timer = null;
  const tick = async () => {
    /* no point animating a headline nobody is looking at */
    if (document.hidden || $(".hero").getBoundingClientRect().bottom < 0)
      return;
    await leave();
    i = (i + 1) % ROTATE_WORDS.length;
    paint(ROTATE_WORDS[i], true);
  };
  const run = () => {
    clearInterval(timer);
    timer = setInterval(tick, 3400);
  };
  run();
  document.addEventListener("visibilitychange", () =>
    document.hidden ? clearInterval(timer) : run(),
  );
}

/* ══ THE PROCESSION ═════════════════════════════════════════════════════
   The figures walk the rule at the foot of the hero. Position comes from the
   same path the rule is drawn along, sampled in pixel space, and the walk
   advances in pixels per second so they move at one speed on every screen. */
const WALKERS = [
  { sel: ".w-lead", off: 0, scale: 1 },
  { sel: ".w-2", off: -0.055, scale: 0.78 },
  { sel: ".w-3", off: -0.097, scale: 0.64 },
  { sel: ".w-4", off: -0.133, scale: 0.54 },
];

function initWalkers() {
  const wrap = $(".hero-walk"),
    hero = $(".hero");
  if (!wrap || !hero) return;
  const svg = $(".walk-svg", wrap),
    path = $("#walkPath", wrap);
  if (!svg || !path) return;

  const VW = 1440,
    VH = 180;
  let L = 0,
    W = 0,
    H = 0;
  const measure = () => {
    const r = svg.getBoundingClientRect();
    W = r.width;
    H = r.height;
    L = path.getTotalLength();
  };
  measure();
  addEventListener("resize", measure, { passive: true });

  const at = (f) => {
    const pt = path.getPointAtLength(clamp(f, 0, 1) * L);
    return { x: (pt.x / VW) * W, y: (pt.y / VH) * H };
  };

  const crew = WALKERS.map((w) => ({ ...w, el: $(w.sel, wrap) })).filter(
    (w) => w.el,
  );
  if (!crew.length) return;

  const place = (w, f) => {
    if (!W) measure();
    const p = at(f);
    w.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -100%) scale(${w.scale})`;
    /* fade at the very edges so the wrap from right to left is never a pop */
    w.el.style.opacity = clamp(Math.min(f, 1 - f) * 14, 0, 1).toFixed(3);
  };

  if (reduce) {
    crew.forEach((w) => place(w, 0.46 + w.off));
    return;
  }

  let dist = 0.16,
    last = 0,
    raf = null,
    running = false,
    resting = false;

  /* hovering the leader sits the whole line down */
  const lead = $(".w-lead", wrap);
  if (lead && fine) {
    const rest = (on) => {
      resting = on;
      wrap.classList.toggle("resting", on);
    };
    lead.addEventListener("pointerenter", () => rest(true));
    lead.addEventListener("pointerleave", () => rest(false));
    lead.addEventListener("focus", () => rest(true));
    lead.addEventListener("blur", () => rest(false));
  }

  let pace = 1;
  const frame = (now) => {
    if (!running) return;
    const dt = Math.min((now - (last || now)) / 1000, 0.1);
    last = now;
    pace += ((resting ? 0 : 1) - pace) * (1 - Math.pow(0.002, dt));
    dist = (dist + (46 / Math.max(W, 1)) * pace * dt) % 1;
    crew.forEach((w) => {
      let f = (dist + w.off) % 1;
      if (f < 0) f += 1;
      place(w, f);
    });
    raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (!running) {
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  start();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([e]) => (e.isIntersecting && !document.hidden ? start() : stop()),
      { threshold: 0 },
    ).observe(hero);
  }
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
  );
  addEventListener(
    "resize",
    () => {
      measure();
      if (!running) crew.forEach((w) => place(w, (dist + w.off + 1) % 1));
    },
    { passive: true },
  );
}

/* ══ THE SCENE ══════════════════════════════════════════════════════════
   Two stacked canvases: the incoming project is drawn onto the hidden one,
   then they swap opacity, so each change is a cross-fade rather than a
   repaint you can see happen. */
function createScene() {
  const layers = [$("#scene-a"), $("#scene-b")].filter(Boolean);
  if (layers.length < 2) return { show() {}, resize() {} };
  let front = 0,
    shown = null;

  const size = (el) => {
    const r = el.parentElement.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    el.width = Math.round(r.width * dpr);
    el.height = Math.round(r.height * dpr);
    return { w: el.width, h: el.height };
  };

  /* the face can be measured before it has been laid out, and painting a
     scene into nothing throws; say so and let the next call try again */
  const paint = (el, p) => {
    const { w, h } = size(el);
    if (!w || !h) return false;
    const ctx = el.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(sceneImage(p, w, h), 0, 0);
    return true;
  };

  return {
    show(p) {
      if (!p || shown === p.slug) return;
      const next = layers[1 - front];
      if (!paint(next, p)) return;
      shown = p.slug;
      next.classList.add("on");
      layers[front].classList.remove("on");
      front = 1 - front;
    },
    resize() {
      const p = bySlug(shown);
      if (p) {
        paint(layers[front], p);
      }
    },
  };
}

/* ══ THE TRACK ══════════════════════════════════════════════════════════
   Every disc carries a track. With no audio file on the project the player
   synthesises an original loop from the track's key and tempo, so a disc
   always plays something and the site ships no one else's music. Set
   `track.audio` on a project and that file is used instead. */
const SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function createPlayer(onProgress) {
  let ctx = null,
    voices = [],
    beat = null,
    el = null;
  let playing = false,
    startedAt = 0,
    length = 1,
    raf = 0,
    current = null;

  const seconds = (t) => {
    const [m, s] = String(t || "0:00")
      .split(":")
      .map(Number);
    return (m || 0) * 60 + (s || 0);
  };

  const tick = () => {
    if (!playing) return;
    const now = el ? el.currentTime : ctx.currentTime - startedAt;
    onProgress(Math.min(1, now / length));
    if (now >= length) {
      stop();
      onProgress(0);
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  /* a short original phrase: a pentatonic root with a soft triangle voice,
     a gentle filter, and one echo. Nothing clever, but it is ours. */
  function synth(track) {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const root = 220 * Math.pow(2, (SEMITONE[track.key] ?? 0) / 12);
    const scale = [0, 2, 4, 7, 9, 12, 14];
    const out = ctx.createGain();
    out.gain.value = 0.0001;
    out.connect(ctx.destination);
    out.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + 1.2);

    const delay = ctx.createDelay();
    delay.delayTime.value = (60 / track.bpm) * 1.5;
    const fb = ctx.createGain();
    fb.gain.value = 0.3;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 1700;
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(tone);
    tone.connect(out);

    let step = 0;
    const spb = 60 / track.bpm;
    const note = () => {
      const deg = scale[(step * 3 + (step % 5)) % scale.length];
      const osc = ctx.createOscillator(),
        g = ctx.createGain();
      osc.type = step % 4 === 0 ? "sine" : "triangle";
      osc.frequency.value =
        root * Math.pow(2, deg / 12) * (step % 8 === 7 ? 0.5 : 1);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + spb * 1.6);
      osc.connect(g);
      g.connect(tone);
      g.connect(delay);
      osc.start();
      osc.stop(ctx.currentTime + spb * 1.8);
      voices.push(osc);
      if (voices.length > 24) voices.shift();
      step++;
    };
    note();
    beat = setInterval(note, spb * 1000);
    startedAt = ctx.currentTime;
    return out;
  }

  let master = null;

  function stop() {
    playing = false;
    clearInterval(beat);
    beat = null;
    cancelAnimationFrame(raf);
    if (master) {
      try {
        master.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + 0.25,
        );
      } catch {}
    }
    setTimeout(() => {
      voices.forEach((v) => {
        try {
          v.stop();
        } catch {}
      });
      voices = [];
    }, 300);
    if (el) {
      el.pause();
    }
    carousel?.setSpinning(false);
    $("#loop")?.classList.remove("beat");
    if (!(carousel && carousel.isHovering())) $("#loop")?.classList.add("off");
    $("#track")?.classList.remove("playing");
    $("#track-play")?.setAttribute("aria-label", "Play this track");
  }

  return {
    stop,
    isPlaying: () => playing,
    toggle(project) {
      if (playing && current === project.slug) {
        stop();
        onProgress(0);
        return;
      }
      if (playing) stop();
      current = project.slug;
      const track = project.track;
      length = seconds(track.duration);
      if (track.audio) {
        el = el || new Audio();
        el.src = track.audio;
        el.loop = false;
        el.play().catch(() => {});
      } else {
        el = null;
        master = synth(track);
      }
      playing = true;
      /* the disc in front turns, and the drawn ring stays around it, so you
         can see at a glance which project is sounding */
      carousel?.setSpinning(true);
      loop.start = performance.now();
      loop.seed = Math.random();
      $("#loop")?.classList.remove("off");
      $("#loop")?.classList.add("beat");
      $("#track")?.classList.add("playing");
      $("#track-play")?.setAttribute("aria-label", "Pause this track");
      raf = requestAnimationFrame(tick);
    },
  };
}

/* the waveform is drawn, not sampled: a deterministic shape per project,
   filled to wherever the track has got to */
function drawWave(canvas, project, progress) {
  if (!canvas || !project) return;
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  const ctx = canvas.getContext("2d");
  const w = canvas.width,
    h = canvas.height;
  let seed = 0;
  for (const ch of project.slug) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
  const rand = () =>
    (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;

  const bars = Math.max(28, Math.floor(w / (6 * dpr)));
  const bw = w / bars;
  const accent =
    getComputedStyle(document.body).getPropertyValue("--accent").trim() ||
    "#c1502e";
  for (let i = 0; i < bars; i++) {
    const env = Math.sin((i / bars) * Math.PI) * 0.7 + 0.3;
    const bh = h * (0.18 + rand() * 0.72) * env;
    ctx.fillStyle = i / bars <= progress ? accent : "rgba(22,22,22,.28)";
    ctx.fillRect(i * bw + bw * 0.2, (h - bh) / 2, bw * 0.55, bh);
  }
}

/* ══ THE HERO SCENE ═════════════════════════════════════════════════════
   Each piece of the scene is drawn three times from three seeds and the
   frames are cycled about seven times a second. Nothing is redrawn at
   frame rate: the loop only composites finished images, so the whole thing
   costs a handful of drawImage calls. */
function initHeroScene() {
  const cv = $("#hero-scene");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const hero = $(".hero");
  let W = 0,
    H = 0,
    dpr = 1,
    art = null,
    raf = 0,
    running = false,
    t0 = performance.now();

  const CLOUDS = [
    { x: 0.08, y: 0.14, w: 0.26, speed: 0.009 },
    { x: 0.58, y: 0.08, w: 0.19, speed: 0.014 },
    { x: 0.34, y: 0.26, w: 0.15, speed: 0.006 },
  ];
  const BIRDS = [
    { x: 0.2, y: 0.3, s: 0.022, speed: 0.03 },
    { x: 0.5, y: 0.24, s: 0.017, speed: 0.036 },
    { x: 0.72, y: 0.33, s: 0.013, speed: 0.026 },
  ];

  function build() {
    const r = hero.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = Math.round(r.width * dpr);
    H = Math.round(r.height * dpr);
    cv.width = W;
    cv.height = H;
    cv.style.width = r.width + "px";
    cv.style.height = r.height + "px";
    const sunSize = Math.min(W, H) * 0.34;
    art = {
      scenery: [0, 1, 2].map((v) => heroScenery(W, H, v)),
      sun: [0, 1, 2].map((v) => heroSun(sunSize, v)),
      moon: [0, 1, 2].map((v) => heroMoon(sunSize * 0.74, v)),
      clouds: CLOUDS.map((c, i) =>
        [0, 1, 2].map((v) => heroCloud(W * c.w, v, "c" + i)),
      ),
      birds: BIRDS.map((b, i) =>
        [0, 1, 2].map((v) => heroBird(W * b.s, v, "b" + i)),
      ),
    };
  }
  /* the whole scene is pre-drawn, so changing ink means drawing it again */
  redrawHero = build;

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    const v = reduce ? 0 : Math.floor(t * 7) % 3; /* the boil */
    ctx.clearRect(0, 0, W, H);

    ctx.drawImage(art.scenery[v], 0, 0);

    /* the sun and the moon share the sky, each drifting on its own slow arc */
    const sun = art.sun[v],
      moon = art.moon[v];
    const drift = reduce ? 0 : 1;
    ctx.drawImage(
      sun,
      W * 0.13 - sun.width / 2 + Math.sin(t * 0.06) * W * 0.012 * drift,
      H * 0.2 - sun.height / 2 + Math.sin(t * 0.09) * H * 0.018 * drift,
    );
    ctx.drawImage(
      moon,
      W * 0.82 - moon.width / 2 + Math.sin(t * 0.05 + 2) * W * 0.01 * drift,
      H * 0.17 - moon.height / 2 + Math.cos(t * 0.07) * H * 0.016 * drift,
    );

    /* clouds and birds cross and wrap */
    CLOUDS.forEach((c, i) => {
      const img = art.clouds[i][v];
      const span = W + img.width;
      let x = (c.x * W + t * c.speed * W * drift) % span;
      if (x > W) x -= span;
      ctx.drawImage(img, x, H * c.y);
    });
    BIRDS.forEach((b, i) => {
      const img = art.birds[i][v];
      const span = W + img.width;
      let x = (b.x * W + t * b.speed * W * drift) % span;
      if (x > W) x -= span;
      ctx.drawImage(
        img,
        x,
        H * b.y + Math.sin(t * 0.8 + i) * H * 0.006 * drift,
      );
    });
  }

  const start = () => {
    if (!running) {
      running = true;
      raf = requestAnimationFrame(frame);
    }
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  build();
  start();
  addEventListener(
    "resize",
    () => {
      build();
    },
    { passive: true },
  );
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      ([e]) => (e.isIntersecting && !document.hidden ? start() : stop()),
      { threshold: 0 },
    ).observe(hero);
  }
  document.addEventListener("visibilitychange", () =>
    document.hidden ? stop() : start(),
  );
}

/* ══ THE MARKS ON THE WORDS ═════════════════════════════════════════════
   A ring round the word that changes, a stroke under the line above it and
   a couple of sparks. Three variants of each, swapped on the same beat as
   the scene, so the marks shiver the way a pencil line does. */
function initHeroMarks() {
  const svg = $("#hero-marks"),
    lineOne = $("#line-one"),
    rot = $("#rotator");
  if (!svg || !lineOne || !rot) return;
  let variants = [],
    i = 0,
    timer = null;

  const jitter = (r, n) => (r() - 0.5) * n;

  function ringPath(x, y, w, h, r) {
    let d = "";
    const cx = x + w / 2,
      cy = y + h / 2,
      rx = w / 2 + w * 0.04,
      ry = h / 2 + h * 0.12;
    for (let turn = 0; turn < 2; turn++) {
      for (let k = 0; k <= 26; k++) {
        const a = (k / 26) * Math.PI * 2 - 0.5 + turn * 0.25;
        const px = cx + Math.cos(a) * (rx + jitter(r, 7));
        const py = cy + Math.sin(a) * (ry + jitter(r, 6));
        d += `${k ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`;
      }
    }
    return d;
  }

  function underline(x, y, w, r) {
    let d = `M${x},${y}`;
    for (let k = 1; k <= 12; k++)
      d += `L${(x + (w * k) / 12).toFixed(1)},${(y + jitter(r, 7)).toFixed(1)}`;
    return d;
  }

  function spark(cx, cy, s, r) {
    let d = "";
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI + jitter(r, 0.4);
      d +=
        `M${(cx - Math.cos(a) * s).toFixed(1)},${(cy - Math.sin(a) * s).toFixed(1)}` +
        `L${(cx + Math.cos(a) * s).toFixed(1)},${(cy + Math.sin(a) * s).toFixed(1)}`;
    }
    return d;
  }

  function build() {
    const box = svg.getBoundingClientRect();
    if (!box.width) return;
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    const rel = (el) => {
      const b = el.getBoundingClientRect();
      return { x: b.x - box.x, y: b.y - box.y, w: b.width, h: b.height };
    };
    /* the rotating line is a full-width block, so the ring goes round the
       text inside it rather than the box */
    const rotBox = rel(rot);
    const chars = $$(".r-char", rot);
    if (chars.length) {
      const first = chars[0].getBoundingClientRect(),
        last = chars[chars.length - 1].getBoundingClientRect();
      rotBox.x = first.x - box.x;
      rotBox.w = last.x + last.width - first.x;
    }
    const one = rel(lineOne);

    variants = [0, 1, 2].map((v) => {
      const r = rng("marks" + v + chars.length);
      return [
        ringPath(
          rotBox.x,
          rotBox.y + rotBox.h * 0.12,
          rotBox.w,
          rotBox.h * 0.78,
          r,
        ),
        underline(
          one.x,
          one.y + one.h * 0.92,
          Math.min(one.w, rotBox.w * 1.1 || one.w * 0.5),
          r,
        ),
        spark(one.x - 18, one.y + one.h * 0.3, 9, r),
        spark(rotBox.x + rotBox.w + 22, rotBox.y + rotBox.h * 0.3, 11, r),
      ].join(" ");
    });
    svg.innerHTML = `<path stroke-width="2.2" opacity=".85"/>`;
    show();
  }

  const show = () => {
    const p = svg.firstElementChild;
    if (p && variants.length)
      p.setAttribute("d", variants[i % variants.length]);
  };
  const run = () => {
    clearInterval(timer);
    if (!reduce)
      timer = setInterval(() => {
        i++;
        show();
      }, 140);
  };

  /* rebuild whenever the word changes length, and on resize */
  const ro =
    "ResizeObserver" in window ? new ResizeObserver(() => build()) : null;
  ro && ro.observe(rot);
  addEventListener("resize", build, { passive: true });
  document.fonts && document.fonts.ready.then(build).catch(() => {});
  build();
  run();
  document.addEventListener("visibilitychange", () =>
    document.hidden ? clearInterval(timer) : run(),
  );
}

/* ══ REVEALS ════════════════════════════════════════════════════════════ */
function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix;
  if (!target) {
    el.innerHTML = suffix || "0";
    return;
  }
  if (reduce) {
    el.textContent = String(target);
    return;
  }
  const t0 = performance.now();
  const step = (now) => {
    const p = clamp((now - t0) / 1300, 0, 1);
    el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initReveals() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    $$("[data-count], [data-suffix]").forEach(countUp);
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        e.target.classList.add("in");
        const n = e.target.querySelector("[data-count], [data-suffix]");
        if (n) countUp(n);
      });
    },
    { rootMargin: "0px 0px -12% 0px" },
  );
  items.forEach((el) => io.observe(el));
}


/* ── light and dark ───────────────────────────────────────────────────────
   The stylesheet holds both palettes, including chalk copies of the three
   drawn lines, so switching is a single attribute. The one thing CSS can't
   reach is the hero, which is painted on a canvas: its pen is told the new
   ink and the scene is drawn again. */
function initTheme() {
  const btn = $("#theme-btn");
  const root = document.documentElement;

  const apply = (dark, remember) => {
    root.dataset.theme = dark ? "dark" : "light";
    $("#theme-color")?.setAttribute("content", dark ? "#17161a" : "#f2f2f2");
    btn?.setAttribute("aria-label", dark ? "Switch to light" : "Switch to dark");
    setInk(dark ? "#f1ede6" : "#161616");
    redrawHero && redrawHero();
    initHeroMarks();
    if (remember) {
      try {
        localStorage.setItem("theme", dark ? "dark" : "light");
      } catch {}
    }
  };

  apply(root.dataset.theme === "dark", false);
  btn?.addEventListener("click", () =>
    apply(root.dataset.theme !== "dark", true),
  );

  /* follow the system until the visitor has said otherwise */
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    let chosen = null;
    try {
      chosen = localStorage.getItem("theme");
    } catch {}
    if (!chosen) apply(e.matches, false);
  });
}

/* ── boot ─────────────────────────────────────────────────────────────── */
async function boot() {
  renderTabs();
  await whenFonts(); /* labels are painted with the web fonts */
  try {
    carousel = createCarousel($("#stage"), {
      onChange: showProject,
      onOpen: (p) => {
        location.hash = "#/p/" + p.slug;
      },
      onPick: (i) => scrollToDisc(i),
      onHover,
      onFrame: drawLoop,
    });
  } catch (err) {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<p class="noscript">This library needs WebGL to show its discs. The index below still works.</p>',
    );
    console.error(err);
    return;
  }
  carousel.setScrollDriven(true);
  scene = createScene();
  player = createPlayer((progress) => {
    waveAt = progress;
    drawWave($("#track-wave"), carousel.project(), progress);
  });
  $("#track-play")?.addEventListener("click", () => {
    const p = carousel.project();
    if (p) player.toggle(p);
  });
  addEventListener(
    "resize",
    () => {
      scene && scene.resize();
      drawWave($("#track-wave"), carousel.project(), waveAt);
    },
    { passive: true },
  );

  bindInput();
  initRotator();
  initHeroScene();
  initHeroMarks();
  initTheme();
  initWalkers();
  initReveals();
  setCollection(state.collection, { scroll: false });
  route();
  onPageScroll();
}

boot();
