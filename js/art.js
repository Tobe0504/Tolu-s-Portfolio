/* ═══════════════════════════════════════════════════════════════════════════
   Generated artwork: the label printed on each disc, and each project's hero
   image. Both are drawn on a canvas from the project's `art` spec, so the
   site looks finished before any real imagery exists. A project with a
   `discImage` / `heroImage` path uses that file instead.
   ═══════════════════════════════════════════════════════════════════════════ */

const SERIF = '"Outfit", ui-rounded, system-ui, sans-serif';   /* label display */
const SANS  = '"Outfit", ui-rounded, system-ui, sans-serif';   /* label small print */

let fontsReady = null;
export function whenFonts() {
  if (!fontsReady) {
    fontsReady = document.fonts
      ? Promise.all([
          document.fonts.load(`600 80px ${SERIF}`),
          document.fonts.load(`500 20px ${SANS}`)
        ]).catch(() => {})
      : Promise.resolve();
  }
  return fontsReady;
}

/* deterministic randomness per project, so a label never reshuffles */
function rng(seed) {
  let h = 2166136261;
  for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

function grain(ctx, w, h, amount = 0.07) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 255 * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ── motifs: one abstract "product" fragment per project ─────────────── */
const MOTIFS = {
  cards(ctx, a, r, W, H) {
    ctx.save();
    ctx.translate(W * 0.58, H * 0.68); ctx.rotate(-0.16);
    for (let i = 2; i >= 0; i--) {
      ctx.save();
      ctx.translate(i * W * 0.035, i * -H * 0.03);
      ctx.globalAlpha = 1 - i * 0.22;
      ctx.fillStyle = i ? a.bg2 : a.fg;
      ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = W * 0.03; ctx.shadowOffsetY = W * 0.012;
      roundRect(ctx, -W * 0.2, -H * 0.12, W * 0.4, H * 0.25, W * 0.03); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = a.accent;
    roundRect(ctx, -W * 0.15, -H * 0.06, W * 0.075, H * 0.055, W * 0.01); ctx.fill();
    ctx.fillStyle = a.bg; ctx.globalAlpha = .5;
    [0.03, 0.065].forEach((y, i) => { roundRect(ctx, -W * 0.15, y * H, W * (i ? 0.16 : 0.26), H * 0.014, 6); ctx.fill(); });
    ctx.restore();
  },
  pulse(ctx, a, r, W, H) {
    ctx.save(); ctx.strokeStyle = a.fg; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let i = 1; i <= 4; i++) {
      ctx.globalAlpha = .22 / i + .05; ctx.lineWidth = W * 0.004;
      ctx.beginPath(); ctx.arc(W * 0.5, H * 0.74, W * (0.05 + i * 0.06), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.lineWidth = W * 0.011; ctx.strokeStyle = a.accent;
    const y = H * 0.74, pts = [[.16, 0], [.36, 0], [.41, -.09], [.47, .1], [.52, -.05], [.56, 0], [.84, 0]];
    ctx.beginPath(); pts.forEach(([x, dy], i) => ctx[i ? 'lineTo' : 'moveTo'](W * x, y + dy * H)); ctx.stroke();
    ctx.restore();
  },
  weave(ctx, a, r, W, H) {
    ctx.save(); const s = W * 0.034;
    for (let y = H * 0.55; y < H * 0.95; y += s) for (let x = W * 0.1; x < W * 0.9; x += s) {
      const on = (Math.floor(x / s) + Math.floor(y / s)) % 2;
      ctx.fillStyle = on ? a.fg : a.accent; ctx.globalAlpha = on ? .85 : .7;
      ctx.fillRect(x, y, on ? s * 0.92 : s * 0.3, on ? s * 0.3 : s * 0.92);
    }
    ctx.restore();
  },
  waves(ctx, a, r, W, H) {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = a.fg; ctx.globalAlpha = .08 + i * .06;
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) ctx.lineTo(x, H * (0.62 + i * 0.07) + Math.sin(x / W * 6 + i * 1.3) * H * 0.025);
      ctx.lineTo(W, H); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.fillStyle = a.accent;
    ctx.fillRect(W * 0.63, H * 0.5, W * 0.008, H * 0.2);
    ctx.beginPath(); ctx.arc(W * 0.634, H * 0.5, W * 0.022, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
  bars(ctx, a, r, W, H) {
    ctx.save(); const n = 9, bw = W * 0.045;
    for (let i = 0; i < n; i++) {
      const h = H * (0.08 + r() * 0.2 + i * 0.012);
      ctx.fillStyle = i === n - 3 ? a.accent : a.fg; ctx.globalAlpha = i === n - 3 ? 1 : .75;
      roundRect(ctx, W * 0.2 + i * bw * 1.45, H * 0.9 - h, bw, h, bw * 0.3); ctx.fill();
    }
    ctx.restore();
  },
  grid(ctx, a, r, W, H) {
    ctx.save(); ctx.strokeStyle = a.fg; ctx.globalAlpha = .18; ctx.lineWidth = 1.5;
    const s = W * 0.06;
    for (let x = 0; x < W; x += s) { ctx.beginPath(); ctx.moveTo(x, H * .5); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = H * .5; y < H; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.strokeStyle = a.accent; ctx.lineWidth = W * 0.012; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(W * .12, H * .88); ctx.lineTo(W * .36, H * .88); ctx.lineTo(W * .36, H * .7);
    ctx.lineTo(W * .66, H * .7); ctx.lineTo(W * .66, H * .58); ctx.lineTo(W * .88, H * .58); ctx.stroke();
    [[.12, .88], [.66, .7], [.88, .58]].forEach(([x, y]) => { ctx.fillStyle = a.fg; ctx.beginPath(); ctx.arc(W * x, H * y, W * .018, 0, 7); ctx.fill(); });
    ctx.restore();
  },
  type(ctx, a, r, W, H, p) {
    ctx.save(); ctx.fillStyle = a.accent; ctx.globalAlpha = .9;
    ctx.font = `400 ${W * 0.62}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(p.name[0], W * 0.62, H * 1.08);
    ctx.restore();
  },
  rings(ctx, a, r, W, H) {
    ctx.save(); ctx.lineWidth = W * 0.006;
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = i % 2 ? a.fg : a.accent; ctx.globalAlpha = .25 + i * .08;
      ctx.beginPath(); ctx.arc(W * (0.36 + i * 0.045), H * 0.76, W * (0.06 + i * 0.025), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  },
  route(ctx, a, r, W, H) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const lines = [[a.fg, [[.08, .62], [.4, .62], [.55, .77], [.92, .77]]], [a.bg2, [[.2, .95], [.34, .8], [.7, .8], [.82, .6]]]];
    lines.forEach(([c, pts]) => {
      ctx.strokeStyle = c; ctx.lineWidth = W * 0.026;
      ctx.beginPath(); pts.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](W * x, H * y)); ctx.stroke();
      pts.forEach(([x, y]) => { ctx.fillStyle = a.bg; ctx.strokeStyle = c; ctx.lineWidth = W * 0.008;
        ctx.beginPath(); ctx.arc(W * x, H * y, W * 0.018, 0, 7); ctx.fill(); ctx.stroke(); });
    });
    ctx.restore();
  }
};

function curvedText(ctx, text, cx, cy, radius, startAngle, size, color) {
  ctx.save();
  ctx.font = `600 ${size}px ${SANS}`; ctx.fillStyle = color;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let angle = startAngle;
  for (const ch of text) {
    const w = ctx.measureText(ch).width + size * 0.28;     /* letterspaced */
    const step = w / radius;
    /* the text runs anticlockwise so it reads upright along the bottom, so
       each glyph's centre is half a step *back* along that direction —
       offsetting it forward overlapped every letter onto the one before */
    const at = angle - step / 2;
    ctx.save();
    ctx.translate(cx + Math.cos(at) * radius, cy + Math.sin(at) * radius);
    ctx.rotate(at - Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    angle -= step;
  }
  ctx.restore();
}

/* ── the disc label: a square that the disc maps onto its printed face ── */
export function discLabel(p, size = 1024) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d'), a = p.art, W = size, H = size, r = rng(p.slug);

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, a.bg); g.addColorStop(1, a.bg2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  /* soft light falling across the print */
  const lg = ctx.createRadialGradient(W * .3, H * .22, 0, W * .3, H * .22, W * .8);
  lg.addColorStop(0, 'rgba(255,255,255,.16)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);

  (MOTIFS[a.motif] || MOTIFS.cards)(ctx, a, r, W, H, p);

  /* title block above the hub, the way a pressed disc is laid out */
  ctx.fillStyle = a.fg; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  /* both lines sit outside the clear hub (a third of the radius), or the
     hub's plastic swallows them */
  const titleSize = p.name.length > 9 ? W * 0.085 : W * 0.115;
  ctx.font = `600 ${titleSize}px ${SERIF}`;
  ctx.fillText(p.name, W * 0.5, H * 0.255);
  ctx.font = `600 ${W * 0.022}px ${SANS}`;
  ctx.globalAlpha = .75;
  ctx.fillText('T O L U L O P E   E L I J A H', W * 0.5, H * 0.255 + W * 0.045);
  ctx.globalAlpha = 1;

  /* credits printed around the rim */
  const rim = `${p.role} · ${p.industry} · ${p.year}`.toUpperCase();
  curvedText(ctx, rim, W / 2, H / 2, W * 0.445, Math.PI * 0.86, W * 0.02, a.fg);

  grain(ctx, W, H, 0.06);
  return c;
}

/* ── the data side: what a disc looks like turned over ──────────────────
   Silver under polycarbonate, fine concentric tracks, and the two opposing
   rainbow bands that diffraction throws across a real disc. Used as the
   colour map of a mirror-metal material, so the room still reflects in it. */
let dataCanvas = null;
export function dataSide(size = 1024) {
  if (dataCanvas) return dataCanvas;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d'), m = size / 2;

  ctx.fillStyle = '#dfe3e8'; ctx.fillRect(0, 0, size, size);

  /* diffraction: two opposing sweeps of hue, soft at their edges */
  if (ctx.createConicGradient) {
    const g = ctx.createConicGradient(-Math.PI / 5, m, m);
    const stops = [[0, 'rgba(255,255,255,0)'], [.04, 'rgba(255,80,120,.55)'], [.08, 'rgba(255,190,60,.6)'],
                   [.12, 'rgba(90,220,130,.55)'], [.16, 'rgba(70,160,255,.6)'], [.2, 'rgba(160,90,255,.5)'],
                   [.25, 'rgba(255,255,255,0)'], [.5, 'rgba(255,255,255,0)'], [.54, 'rgba(160,90,255,.45)'],
                   [.58, 'rgba(70,160,255,.55)'], [.62, 'rgba(90,220,130,.5)'], [.66, 'rgba(255,190,60,.55)'],
                   [.7, 'rgba(255,80,120,.5)'], [.75, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,0)']];
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  }

  /* the tracks: thousands of them on a real disc, a fine sheen here */
  ctx.lineWidth = 1;
  for (let r = m * 0.34; r < m * 0.99; r += 2.2) {
    ctx.strokeStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '120,130,140'},${(0.05 + Math.random() * 0.07).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(m, m, r, 0, Math.PI * 2); ctx.stroke();
  }
  /* the edge of the written area, a slightly darker band */
  ctx.strokeStyle = 'rgba(90,100,112,.35)'; ctx.lineWidth = size * 0.01;
  ctx.beginPath(); ctx.arc(m, m, m * 0.36, 0, Math.PI * 2); ctx.stroke();

  dataCanvas = c;
  return c;
}

/* ── the project page hero ────────────────────────────────────────────────
   Drawn to the viewport's own shape so the crop never loses the subject,
   and kept dark and cinematic so the giant white type laid over it reads. */
export function heroImage(p) {
  const aspect = Math.min(2.2, Math.max(0.45, innerWidth / Math.max(innerHeight, 1)));
  const w = 1600, h = Math.round(w / aspect);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d'), a = p.art, r = rng(p.slug + 'hero');
  const portrait = h > w;

  /* ground: the project colour, pushed toward shadow at the edges */
  const g = ctx.createRadialGradient(w * .5, h * .62, 0, w * .5, h * .62, Math.max(w, h) * .75);
  g.addColorStop(0, a.bg); g.addColorStop(.55, a.bg2); g.addColorStop(1, '#070707');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  /* the project's motif, huge and quiet, like set dressing */
  ctx.save(); ctx.globalAlpha = .35; ctx.globalCompositeOperation = 'soft-light';
  (MOTIFS[a.motif] || MOTIFS.cards)(ctx, a, r, w, h, p);
  ctx.restore();

  /* the device, sized to survive the crop */
  const dw = portrait ? w * 0.46 : Math.min(w * 0.44, h * 0.62);
  const dh = portrait ? dw * 2.05 : dw * 0.64;
  const dx = w * 0.5 - dw / 2, dy = h * (portrait ? 0.56 : 0.58) - dh / 2;
  ctx.save();
  ctx.translate(w * 0.5, h * 0.56); ctx.rotate(portrait ? -0.06 : -0.035); ctx.translate(-w * 0.5, -h * 0.56);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 120; ctx.shadowOffsetY = 60;
  ctx.fillStyle = '#0c0c0c'; roundRect(ctx, dx, dy, dw, dh, portrait ? dw * 0.14 : 22); ctx.fill();
  ctx.shadowColor = 'transparent';
  const inset = portrait ? dw * 0.045 : dw * 0.025;
  const sx = dx + inset, sy = dy + inset, sw = dw - inset * 2, sh = dh - inset * 2;
  const sg = ctx.createLinearGradient(sx, sy, sx, sy + sh);
  sg.addColorStop(0, a.bg2); sg.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = sg; roundRect(ctx, sx, sy, sw, sh, portrait ? dw * 0.1 : 12); ctx.fill();
  /* interface, in the project's own colours */
  ctx.fillStyle = a.fg; ctx.globalAlpha = .9;
  ctx.font = `400 ${sw * (portrait ? 0.12 : 0.07)}px ${SERIF}`; ctx.textBaseline = 'top';
  ctx.fillText(p.name, sx + sw * .08, sy + sh * (portrait ? .08 : .1));
  ctx.globalAlpha = .18;
  for (let i = 0; i < 4; i++) { roundRect(ctx, sx + sw * .08, sy + sh * (.3 + i * .09), sw * (.4 + r() * .38), sh * .035, 8); ctx.fill(); }
  ctx.globalAlpha = 1; ctx.fillStyle = a.accent;
  roundRect(ctx, sx + sw * .08, sy + sh * (portrait ? .74 : .7), sw * (portrait ? .84 : .34), sh * (portrait ? .1 : .16), 12); ctx.fill();
  ctx.restore();

  /* vignette, for the cinematic falloff the reference stills have */
  const v = ctx.createRadialGradient(w * .5, h * .5, Math.min(w, h) * .25, w * .5, h * .5, Math.max(w, h) * .72);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);

  grain(ctx, w, h, 0.09);
  return c;
}

/* ── gallery images ──────────────────────────────────────────────────────
   Three looks per project so a case study has real pictures in it: a close
   crop of the interface, the system laid out flat, and the thing in use. */
export function galleryImage(p, variant = 'detail', w = 1400, h = 950) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d'), a = p.art, r = rng(p.slug + variant);

  if (variant === 'system') {
    /* the component set, flat on a light ground */
    ctx.fillStyle = '#efece7'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 1;
    for (let x = 0; x < w; x += w / 12) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    const cols = 4, rows = 3, pad = w * 0.06;
    const cw = (w - pad * 2) / cols, ch = (h - pad * 2) / rows;
    for (let i = 0; i < cols * rows; i++) {
      const x = pad + (i % cols) * cw, y = pad + Math.floor(i / cols) * ch;
      const inset = cw * 0.09;
      ctx.fillStyle = [a.bg, a.bg2, a.accent, a.fg][i % 4];
      ctx.globalAlpha = 0.25 + (i % 4) * 0.2;
      roundRect(ctx, x + inset, y + inset, cw - inset * 2, ch - inset * 2, 14); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = a.bg2;
      roundRect(ctx, x + inset * 1.8, y + inset * 1.8, (cw - inset * 3.6) * (0.4 + r() * 0.5), ch * 0.055, 6); ctx.fill();
    }
  } else if (variant === 'context') {
    /* the thing in use, on the project's ground */
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, a.bg); g.addColorStop(1, a.bg2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w * 0.5, h * 0.58); ctx.rotate(-0.04);
    ctx.shadowColor = 'rgba(0,0,0,.4)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 30;
    ctx.fillStyle = '#0d0d0d';
    roundRect(ctx, -w * 0.17, -h * 0.4, w * 0.34, h * 0.78, w * 0.035); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = a.fg;
    roundRect(ctx, -w * 0.155, -h * 0.37, w * 0.31, h * 0.72, w * 0.028); ctx.fill();
    ctx.fillStyle = a.bg2; ctx.globalAlpha = .16;
    for (let i = 0; i < 5; i++) { roundRect(ctx, -w * 0.13, -h * 0.26 + i * h * 0.1, w * (0.12 + r() * 0.15), h * 0.035, 8); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.fillStyle = a.accent;
    roundRect(ctx, -w * 0.13, h * 0.2, w * 0.26, h * 0.075, 12); ctx.fill();
    ctx.restore();
  } else {
    /* a close crop of the interface itself */
    ctx.fillStyle = a.bg2; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.globalAlpha = .4; ctx.globalCompositeOperation = 'soft-light';
    (MOTIFS[a.motif] || MOTIFS.cards)(ctx, a, r, w, h, p);
    ctx.restore();
    ctx.fillStyle = a.fg;
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
    roundRect(ctx, w * 0.1, h * 0.16, w * 0.8, h * 0.72, 20); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = a.bg; ctx.globalAlpha = .9;
    roundRect(ctx, w * 0.1, h * 0.16, w * 0.8, h * 0.11, 20); ctx.fill();
    ctx.fillRect(w * 0.1, h * 0.23, w * 0.8, h * 0.04);
    ctx.globalAlpha = 1;
    ctx.font = `400 ${h * 0.055}px ${SERIF}`; ctx.fillStyle = a.fg; ctx.textBaseline = 'middle';
    ctx.fillText(p.name, w * 0.14, h * 0.215);
    ctx.fillStyle = a.bg2; ctx.globalAlpha = .17;
    for (let i = 0; i < 5; i++) roundRect(ctx, w * 0.14, h * (0.35 + i * 0.1), w * (0.2 + r() * 0.45), h * 0.045, 9), ctx.fill();
    ctx.globalAlpha = 1; ctx.fillStyle = a.accent;
    roundRect(ctx, w * 0.62, h * 0.35, w * 0.24, h * 0.36, 16); ctx.fill();
  }

  grain(ctx, w, h, 0.07);
  return c;
}

/* ── the scene behind the discs ───────────────────────────────────────────
   A loose backdrop per project, drawn with a wobbling pen rather than clean
   geometry: a horizon, a few shapes and some hatching in that project's
   colour. It cross-fades as you scroll from one disc to the next. */
function pen(ctx, pts, jitter, r) {
  /* a line drawn by hand wanders, and is gone over more than once */
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      const jx = (r() - 0.5) * jitter, jy = (r() - 0.5) * jitter;
      i ? ctx.lineTo(x + jx, y + jy) : ctx.moveTo(x + jx, y + jy);
    });
    ctx.globalAlpha *= 0.75;
    ctx.stroke();
  }
}

function hatch(ctx, x, y, w, h, step, angle, r) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const len = Math.hypot(w, h);
  for (let i = -len; i < len; i += step) {
    ctx.beginPath();
    ctx.moveTo(x + i + (r() - 0.5) * 4, y - 10);
    ctx.lineTo(x + i + Math.tan(angle) * (h + 20) + (r() - 0.5) * 4, y + h + 10);
    ctx.stroke();
  }
  ctx.restore();
}

/* ── things worth drawing ─────────────────────────────────────────────────
   Blooms, butterflies, hearts, bows, sparkles and trailing vines. Each is
   drawn with the same wandering pen as everything else, so they belong to
   the same hand as the hero and the rules. */
function bloom(ctx, x, y, size, petals, r) {
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + r() * 0.2;
    const pts = [];
    for (let t = 0; t <= 1.001; t += 0.1) {
      const spread = Math.sin(t * Math.PI) * size * 0.42;
      const along = t * size;
      pts.push([x + Math.cos(a) * along - Math.sin(a) * spread,
                y + Math.sin(a) * along + Math.cos(a) * spread]);
    }
    for (let t = 1; t >= -0.001; t -= 0.1) {
      const spread = -Math.sin(t * Math.PI) * size * 0.42;
      const along = t * size;
      pts.push([x + Math.cos(a) * along - Math.sin(a) * spread,
                y + Math.sin(a) * along + Math.cos(a) * spread]);
    }
    pen(ctx, pts, size * 0.06, r);
  }
  const c = [];
  for (let t = 0; t <= Math.PI * 2 + .3; t += .4) c.push([x + Math.cos(t) * size * 0.17, y + Math.sin(t) * size * 0.17]);
  pen(ctx, c, size * 0.04, r);
}

function butterfly(ctx, x, y, size, r) {
  for (const side of [-1, 1]) {
    const up = [], down = [];
    for (let t = 0; t <= 1.001; t += 0.12) {
      up.push([x + side * Math.sin(t * Math.PI) * size * 0.85, y - size * 0.1 - Math.sin(t * Math.PI * 0.9) * size * 0.62]);
      down.push([x + side * Math.sin(t * Math.PI) * size * 0.62, y + size * 0.12 + Math.sin(t * Math.PI * 0.9) * size * 0.46]);
    }
    pen(ctx, [[x, y - size * 0.1], ...up, [x, y]], size * 0.05, r);
    pen(ctx, [[x, y], ...down, [x, y + size * 0.1]], size * 0.05, r);
  }
  pen(ctx, [[x, y - size * 0.3], [x, y + size * 0.3]], size * 0.04, r);
  pen(ctx, [[x, y - size * 0.3], [x - size * 0.16, y - size * 0.52]], size * 0.04, r);
  pen(ctx, [[x, y - size * 0.3], [x + size * 0.16, y - size * 0.52]], size * 0.04, r);
}

function heart(ctx, x, y, size, r) {
  const pts = [];
  for (let t = 0; t <= Math.PI * 2 + 0.2; t += 0.18) {
    const px = 16 * Math.pow(Math.sin(t), 3);
    const py = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push([x + px * size / 18, y + py * size / 18]);
  }
  pen(ctx, pts, size * 0.05, r);
}

function sparkle(ctx, x, y, size, r) {
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI;
    const l = size * (i % 2 ? 0.55 : 1);
    pen(ctx, [[x - Math.cos(a) * l, y - Math.sin(a) * l], [x + Math.cos(a) * l, y + Math.sin(a) * l]], size * 0.08, r);
  }
}

function bow(ctx, x, y, size, r) {
  for (const side of [-1, 1]) {
    const loop = [];
    for (let t = 0; t <= Math.PI * 2 + .2; t += .35)
      loop.push([x + side * size * 0.55 + Math.cos(t) * size * 0.42, y + Math.sin(t) * size * 0.3]);
    pen(ctx, loop, size * 0.06, r);
    pen(ctx, [[x + side * size * 0.15, y + size * 0.1],
              [x + side * size * 0.5, y + size * 0.85],
              [x + side * size * 0.3, y + size * 0.95]], size * 0.06, r);
  }
  const knot = [];
  for (let t = 0; t <= Math.PI * 2 + .2; t += .5) knot.push([x + Math.cos(t) * size * 0.16, y + Math.sin(t) * size * 0.16]);
  pen(ctx, knot, size * 0.04, r);
}

function vine(ctx, x, y, len, size, r, dir = 1) {
  const spine = [];
  for (let t = 0; t <= 1.001; t += 0.08)
    spine.push([x + t * len * dir, y - Math.sin(t * Math.PI * 1.6) * size * 1.6]);
  pen(ctx, spine, size * 0.1, r);
  spine.forEach(([sx, sy], i) => {
    if (i % 2 || i === 0) return;
    const a = (i % 4 ? 1 : -1) * 1.1;
    const leaf = [];
    for (let t = 0; t <= 1.001; t += 0.15) {
      const spread = Math.sin(t * Math.PI) * size * 0.3;
      leaf.push([sx + Math.cos(a) * t * size - Math.sin(a) * spread, sy + Math.sin(a) * t * size + Math.cos(a) * spread]);
    }
    pen(ctx, leaf, size * 0.06, r);
  });
}

export function sceneImage(p, w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext('2d'), a = p.art, r = rng(p.slug + 'scene');
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = a.bg2;

  const S = Math.min(w, h);

  /* a loose garland of blooms along the bottom, and one climbing each side */
  ctx.globalAlpha = .34; ctx.lineWidth = Math.max(1.4, S * 0.0022);
  vine(ctx, -w * 0.02, h * 0.93, w * 0.55, S * 0.05, r, 1);
  vine(ctx, w * 1.02, h * 0.88, w * 0.5, S * 0.045, r, -1);

  ctx.globalAlpha = .4;
  const blooms = 5;
  for (let i = 0; i < blooms; i++) {
    const x = w * (0.08 + i * (0.84 / (blooms - 1))) + (r() - .5) * w * 0.05;
    const y = h * (0.82 + (r() - .5) * 0.1);
    bloom(ctx, x, y, S * (0.045 + r() * 0.03), 5 + Math.floor(r() * 2), r);
  }

  /* a couple of blooms up high, drifting free */
  ctx.globalAlpha = .3;
  bloom(ctx, w * (0.12 + r() * 0.08), h * (0.2 + r() * 0.1), S * 0.05, 6, r);
  bloom(ctx, w * (0.78 + r() * 0.1), h * (0.16 + r() * 0.1), S * 0.04, 5, r);

  /* butterflies, hearts and bows, picked per project so each scene differs */
  ctx.globalAlpha = .38;
  const kind = ['butterfly', 'heart', 'bow', 'sparkle'][Math.floor(r() * 4)];
  for (let i = 0; i < 3; i++) {
    const x = w * (0.2 + r() * 0.62), y = h * (0.26 + r() * 0.4), s = S * (0.03 + r() * 0.025);
    if (kind === 'butterfly') butterfly(ctx, x, y, s, r);
    else if (kind === 'heart') heart(ctx, x, y, s * 1.5, r);
    else if (kind === 'bow') bow(ctx, x, y, s, r);
    else sparkle(ctx, x, y, s, r);
  }

  /* sparkles scattered through, because everything is better with them */
  ctx.globalAlpha = .34;
  for (let i = 0; i < 9; i++)
    sparkle(ctx, w * r(), h * (0.1 + r() * 0.75), S * (0.008 + r() * 0.014), r);

  return c;
}

/* a single doodle, for margins and stickers elsewhere on the site */
export function doodle(kind, size, seed = '', colour = '#161616') {
  const c = document.createElement('canvas');
  c.width = c.height = Math.round(size * 2.4);
  const ctx = c.getContext('2d'), r = rng(kind + seed);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = colour; ctx.globalAlpha = .75;
  ctx.lineWidth = Math.max(1.3, size * 0.07);
  const m = c.width / 2;
  if (kind === 'bloom') bloom(ctx, m, m, size * 0.78, 6, r);
  else if (kind === 'butterfly') butterfly(ctx, m, m, size * 0.7, r);
  else if (kind === 'heart') heart(ctx, m, m, size, r);
  else if (kind === 'bow') bow(ctx, m, m * 0.85, size * 0.7, r);
  else sparkle(ctx, m, m, size * 0.8, r);
  return c;
}

/* ══ THE HERO SCENE ══════════════════════════════════════════════════════
   Everything here is drawn with the same wobbling pen as the rest of the
   site, and every piece is rendered three times from three different seeds.
   Cycling those three frames a few times a second is what gives hand-drawn
   animation its boil: the line is alive without anything actually moving. */

const INK = '#161616';

function layer(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext('2d');
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  return { c, ctx };
}

/* a closed-ish ring, gone round once and a bit, the way you draw a circle */
function ring(ctx, cx, cy, rad, wobble, r, turns = 1.08) {
  ctx.beginPath();
  const steps = 42;
  for (let i = 0; i <= steps * turns; i++) {
    const a = (i / steps) * Math.PI * 2 - 0.6;
    const rr = rad + (r() - 0.5) * wobble;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.98;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
}

export function heroScenery(w, h, variant) {
  const { c, ctx } = layer(w, h);
  const r = rng('scenery' + variant);
  const horizon = h * 0.76;

  /* far ridge, light */
  ctx.globalAlpha = .28; ctx.lineWidth = 1.4;
  const far = [];
  for (let x = -20; x <= w + 20; x += w / 16)
    far.push([x, horizon - h * 0.16 + Math.sin(x / w * 4.2) * h * 0.05 + (r() - 0.5) * 6]);
  pen(ctx, far, 3, r);

  /* middle ridge, with hatching under it */
  ctx.globalAlpha = .4; ctx.lineWidth = 1.5;
  const mid = [];
  for (let x = -20; x <= w + 20; x += w / 20)
    mid.push([x, horizon - h * 0.07 + Math.sin(x / w * 6.5 + 1.4) * h * 0.028 + (r() - 0.5) * 5]);
  pen(ctx, mid, 2.6, r);
  ctx.globalAlpha = .12; ctx.lineWidth = 1;
  hatch(ctx, 0, horizon - h * 0.06, w, h * 0.06, 14, 0.45, r);

  /* the ground the procession walks on */
  ctx.globalAlpha = .55; ctx.lineWidth = 1.7;
  const front = [];
  for (let x = -20; x <= w + 20; x += w / 24) front.push([x, horizon + (r() - 0.5) * 3]);
  pen(ctx, front, 2, r);

  /* a few tufts, so the ground is not a bare line */
  ctx.globalAlpha = .3; ctx.lineWidth = 1.2;
  for (let i = 0; i < 26; i++) {
    const x = r() * w, s = 4 + r() * 7;
    pen(ctx, [[x, horizon], [x + (r() - .5) * 4, horizon - s]], 1.2, r);
  }
  return c;
}

export function heroSun(size, variant) {
  const { c, ctx } = layer(size, size);
  const r = rng('sun' + variant), m = size / 2, rad = size * 0.26;
  ctx.globalAlpha = .72; ctx.lineWidth = 2.2;
  ring(ctx, m, m, rad, 3, r);
  ctx.globalAlpha = .6; ctx.lineWidth = 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + r() * .1;
    const i0 = rad * 1.22, i1 = rad * (1.72 + r() * 0.3);
    pen(ctx, [[m + Math.cos(a) * i0, m + Math.sin(a) * i0],
              [m + Math.cos(a) * i1, m + Math.sin(a) * i1]], 1.6, r);
  }
  return c;
}

export function heroMoon(size, variant) {
  const { c, ctx } = layer(size, size);
  const r = rng('moon' + variant), m = size / 2, rad = size * 0.24;
  ctx.globalAlpha = .68; ctx.lineWidth = 2;
  ring(ctx, m, m, rad, 2.5, r);
  /* the shadow edge that makes it read as a moon rather than a sun */
  ctx.globalAlpha = .4; ctx.lineWidth = 1.5;
  const crescent = [];
  for (let i = 0; i <= 18; i++) {
    const a = -Math.PI / 2 + (i / 18) * Math.PI;
    crescent.push([m + Math.cos(a) * rad * 0.52, m + Math.sin(a) * rad * 0.98]);
  }
  pen(ctx, crescent, 2, r);
  ctx.globalAlpha = .3; ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) ring(ctx, m + (r() - .6) * rad * .7, m + (r() - .5) * rad * .8, rad * (.08 + r() * .07), 1.5, r, 1);
  return c;
}

export function heroCloud(w, variant, seed = '') {
  const h = w * 0.42;
  const { c, ctx } = layer(w, h);
  const r = rng('cloud' + variant + seed);
  ctx.globalAlpha = .34; ctx.lineWidth = 1.5;
  const pts = [];
  const bumps = 4 + Math.floor(r() * 2);
  pts.push([w * .06, h * .74]);
  for (let i = 0; i < bumps; i++) {
    const x = w * (.12 + i * (.76 / bumps));
    pts.push([x, h * (.4 - r() * .2)], [x + w * (.38 / bumps), h * (.24 + r() * .14)]);
  }
  pts.push([w * .94, h * .74], [w * .06, h * .74]);
  pen(ctx, pts, 2.4, r);
  return c;
}

export function heroBird(size, variant, seed = '') {
  const { c, ctx } = layer(size, size * 0.5);
  const r = rng('bird' + variant + seed);
  ctx.globalAlpha = .45; ctx.lineWidth = 1.4;
  const m = size * 0.5, y = size * 0.26;
  pen(ctx, [[m - size * .4, y], [m - size * .12, y - size * .16], [m, y - size * .02]], 1.2, r);
  pen(ctx, [[m, y - size * .02], [m + size * .12, y - size * .16], [m + size * .4, y]], 1.2, r);
  return c;
}
