/* ═══════════════════════════════════════════════════════════════════════════
   Generated artwork: the label printed on each disc, and each project's hero
   image. Both are drawn on a canvas from the project's `art` spec, so the
   site looks finished before any real imagery exists. A project with a
   `discImage` / `heroImage` path uses that file instead.
   ═══════════════════════════════════════════════════════════════════════════ */

const SERIF = '"Instrument Serif", "Times New Roman", serif';
const SANS  = '"Inter Tight", "Helvetica Neue", Arial, sans-serif';

let fontsReady = null;
export function whenFonts() {
  if (!fontsReady) {
    fontsReady = document.fonts
      ? Promise.all([
          document.fonts.load(`400 80px ${SERIF}`),
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
  ctx.font = `400 ${titleSize}px ${SERIF}`;
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
