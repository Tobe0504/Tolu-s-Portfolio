/* Draws the loading screen's deck: an original turntable seen from three
   quarters, sitting on a table. Run `npm run draw` and it rewrites the
   block between the TURNTABLE markers in ../index.html. Nothing here ships;
   only its output does. */
import { readFileSync, writeFileSync } from "node:fs";
import { rng, stroke, circle, hatch, render } from "./pen.mjs";

const r = rng("turntable-07");
const S = (pts, o = {}) => stroke(pts, { r, ...o });
const C = (x, y, rad, o = {}) => circle(x, y, rad, { r, ...o });

/* ── the deck, as a flat box seen from above and in front ─────────────── */
const BL = [66, 116],
  BR = [234, 104],
  FR = [258, 142],
  FL = [84, 156];
const drop = 15;
const FLd = [FL[0], FL[1] + drop],
  FRd = [FR[0], FR[1] + drop],
  BLd = [BL[0], BL[1] + drop];

const deck = [
  ...S([BL, BR, FR, FL], { close: true, jitter: 1.7, over: 3 }), // top face
  ...S([FL, FLd], { jitter: 1.2, over: 1.6 }), // front-left corner
  ...S([FR, FRd], { jitter: 1.2, over: 1.6 }), // front-right corner
  ...S([FLd, FRd], { jitter: 1.5, over: 2.4 }), // bottom of the front face
  ...S([BL, BLd], { jitter: 1.2, over: 1.4, alpha: 0.7 }), // sliver of the left side
  ...S([BLd, FLd], { jitter: 1.2, over: 1.6, alpha: 0.7 }),
];

/* ── the shadow it throws across the table ────────────────────────────── */
const shade = hatch(FLd, FRd, [244, 174], [72, 188], 9, { r, alpha: 0.3 });

/* ── the table it all stands on ───────────────────────────────────────── */
const table = [
  ...S([[6, 198], [152, 194], [294, 197]], { jitter: 1.8, over: 3, alpha: 0.5 }),
  ...S([[18, 202], [20, 226]], { jitter: 1.1, alpha: 0.45 }),
  ...S([[48, 201], [50, 224]], { jitter: 1.1, alpha: 0.45 }),
  ...S([[268, 201], [270, 224]], { jitter: 1.1, alpha: 0.45 }),
];

/* ── a sleeve leaning against it ──────────────────────────────────────── */
const sleeve = [
  ...S([[24, 190], [36, 124], [70, 131], [58, 196]], { close: true, jitter: 1.5, over: 2 }),
  ...S([[34, 130], [67, 136]], { jitter: 1.1, alpha: 0.6 }),
];

/* ── the record. Drawn as true circles about the origin; the group that
      holds it squashes them, so a plain rotation inside reads as a disc
      turning in perspective rather than an ellipse falling over. ──────── */
const platter = [
  ...C(0, 0, 54, { jitter: 1.3 }),
  ...C(0, 0, 45, { jitter: 1, alpha: 0.32 }),
  ...C(0, 0, 37, { jitter: 1, alpha: 0.32 }),
  ...C(0, 0, 29, { jitter: 1, alpha: 0.32 }),
  ...S([[1, -52], [0, -14]], { jitter: 1.3, alpha: 0.4, over: 1 }), // one scratch, so the turning shows
];
const label = C(0, 0, 16, { jitter: 0.9, passes: 1 });
const spindle = C(0, 0, 2.6, { jitter: 0.5, passes: 1 });

/* ── the arm, down and playing ────────────────────────────────────────── */
const arm = [
  ...C(236, 114, 7, { jitter: 0.8, alpha: 0.65 }),
  ...S([[242, 109], [256, 106]], { jitter: 1, alpha: 0.65, over: 1.2 }), // counterweight
  ...S([[232, 118], [196, 130], [170, 138]], { jitter: 1.1, over: 1.6 }),
  ...S([[170, 138], [173, 146]], { jitter: 0.9, over: 1 }), // headshell
];

const svg = `
          <g class="pl-table">
${render(table)}
          </g>
          <g class="pl-sleeve">
${render(sleeve)}
          </g>
          <g class="pl-shade">
${render(shade)}
          </g>
          <g class="pl-deck">
${render(deck)}
          </g>
          <g transform="translate(148 132) scale(1 0.38)">
            <g class="pl-platter">
${render(platter)}
              <g class="pl-label">
${render(label)}
              </g>
              <g class="pl-spindle">
${render(spindle)}
              </g>
            </g>
          </g>
          <g class="pl-arm-rig">
${render(arm)}
          </g>
          <g class="pl-notes">
            <g transform="translate(184 116)">
              <g class="pl-note n1">
                <path d="M0 13V2.4l9.4-2.2V11" />
                <ellipse cx="-2.4" cy="13.4" rx="3.1" ry="2.4" />
                <ellipse cx="7" cy="11.4" rx="3.1" ry="2.4" />
              </g>
            </g>
            <g transform="translate(212 108)">
              <g class="pl-note n2">
                <path d="M0 11V1.8l7-1.6V9.4" />
                <ellipse cx="-2.1" cy="11.4" rx="2.7" ry="2.1" />
              </g>
            </g>
            <g transform="translate(160 102)">
              <g class="pl-note n3">
                <path d="M0 10V1.5l6-1.4V8.4" />
                <ellipse cx="-1.9" cy="10.4" rx="2.5" ry="1.9" />
              </g>
            </g>
          </g>
`;

const file = new URL("../index.html", import.meta.url);
let html = readFileSync(file, "utf8");
const A = "<!-- TURNTABLE:START -->";
const B = "<!-- TURNTABLE:END -->";
if (!html.includes(A)) throw new Error("markers missing from index.html");
html =
  html.slice(0, html.indexOf(A) + A.length) +
  svg +
  "          " +
  html.slice(html.indexOf(B));
writeFileSync(file, html);
console.log(
  "drew the deck:",
  (svg.match(/<path/g) || []).length,
  "strokes spliced into index.html",
);
