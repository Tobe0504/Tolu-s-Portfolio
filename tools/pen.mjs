/* The same hand js/art.js draws the rest of the site with, emitting SVG
   path data instead of painting to a canvas. Kept identical in spirit so
   the loading screen is drawn by the same pen as the hero: a line wanders,
   it is gone over twice, and it overshoots its corners. */

export function rng(seed) {
  let h = 2166136261;
  for (const c of seed) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

const n = (v) => Number(v.toFixed(1));
const dOf = (pts) => "M" + pts.map(([x, y]) => `${n(x)} ${n(y)}`).join("L");

/* push a segment's ends a little past where they should stop, the way a
   pen does when the hand is moving faster than it is accurate */
function overshoot(pts, amount, r) {
  if (pts.length < 2 || !amount) return pts;
  const out = pts.map((p) => [...p]);
  const ext = (from, to, by) => {
    const dx = to[0] - from[0],
      dy = to[1] - from[1];
    const len = Math.hypot(dx, dy) || 1;
    return [to[0] + (dx / len) * by, to[1] + (dy / len) * by];
  };
  out[0] = ext(out[1], out[0], amount * r());
  out[out.length - 1] = ext(out[out.length - 2], out[out.length - 1], amount * r());
  return out;
}

export function wander(pts, jitter, r) {
  return pts.map(([x, y]) => [
    x + (r() - 0.5) * jitter,
    y + (r() - 0.5) * jitter,
  ]);
}

/* one stroke, gone over twice, the second pass lighter */
export function stroke(pts, { jitter = 1.6, r, alpha = 1, over = 2.2, passes = 2, close = false } = {}) {
  const shapes = [];
  for (let i = 0; i < passes; i++) {
    let p = wander(pts, jitter, r);
    if (close) p = [...p, p[0]];
    p = overshoot(p, over, r);
    shapes.push({ d: dOf(p), opacity: Number((alpha * (i === 0 ? 1 : 0.5)).toFixed(2)) });
  }
  return shapes;
}

/* a circle gone round once and a bit, so the ends do not meet cleanly */
export function circle(cx, cy, rad, { jitter = 1.1, r, alpha = 1, turns = 1.07, squash = 1, passes = 2 } = {}) {
  const shapes = [];
  for (let p = 0; p < passes; p++) {
    const steps = 44;
    const pts = [];
    const start = r() * Math.PI * 2;
    for (let i = 0; i <= steps * turns; i++) {
      const a = (i / steps) * Math.PI * 2 + start;
      const rr = rad + (r() - 0.5) * jitter;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * squash]);
    }
    shapes.push({ d: dOf(pts), opacity: Number((alpha * (p === 0 ? 1 : 0.45)).toFixed(2)) });
  }
  return shapes;
}

/* shade: parallel strokes walked between two edges, each one over- or
   undershooting so the block never reads as a printed fill */
export function hatch(a, b, c, d, count, { jitter = 1.2, r, alpha = 0.45 } = {}) {
  const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const shapes = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const from = lerp(a, d, t);
    const to = lerp(b, c, t);
    const trim = 0.06 + r() * 0.16;
    shapes.push(
      ...stroke([lerp(from, to, trim * r()), lerp(from, to, 1 - trim)], {
        jitter,
        r,
        alpha,
        over: 1.4,
        passes: 1,
      }),
    );
  }
  return shapes;
}

export const render = (shapes, cls) =>
  shapes
    .map(
      (s) =>
        `<path${cls ? ` class="${cls}"` : ""} d="${s.d}"${s.opacity < 1 ? ` opacity="${s.opacity}"` : ""} />`,
    )
    .join("\n");
