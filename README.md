# Tolulope Elijah — Portfolio (v2, the disc library)

Every project is a physical disc. Browse the library, open a disc, and its
project page unfolds. Plain HTML, CSS and JavaScript with three.js loaded from
a CDN. No build step.

**All projects, figures and testimonials are placeholder.** See
_Swapping in real content_.

The layout, type hierarchy and interaction model follow
[a24.raviklaassens.com](https://a24.raviklaassens.com/) by Ravi Klaassens. It
uses no A24 branding, and none of that site's artwork, copy or code.

## How it behaves

**Home: the library**
- A row of large 3D discs running on a diagonal. The disc ahead waits beyond
  the top right corner and travels down across the frame to leave at the
  bottom left, so scrolling reads as falling rather than sliding. Neighbours
  stay nearly full size and crop into the corners, which keeps the screen
  full instead of empty.
- **Scroll**, **← / →**, or **swipe** to move one disc at a time. The discs
  roll as they travel, and each returns to its own resting angle in front.
- **Hover** the front disc and a hand-drawn marker loop circles it. Every loop
  is drawn fresh, so no two are identical. The disc also trembles very
  slightly while you point at it, so it reads as held rather than mounted.
- One disc per scroll gesture. A trackpad flick arrives as dozens of small
  deltas, so the carousel steps once and then refuses to step again until the
  events stop, rather than running through three projects per flick.
- **Space** flips the disc to its data side: silver, with the rainbow bands
  real discs throw.
- **Click** the front disc, or press **Enter**, to open it. Click a neighbour
  to bring it to the front.
- Top left: title, role, year, team. Bottom: two reviews. Both roll over as
  the disc changes.
- The bar: wordmark, **Client work / Explorations**, and **Index**. Index
  opens a list above the bar with the current project inverted; pick any to
  jump to it.

**Project page** — a full case study
- Centred title, credits line, and a ruled table: client, year, industry,
  platform, timeline and status.
- The hero image is revealed through a torn-paper edge, pinned while the
  project's tagline scrolls past word by word, alternating sides between
  hairlines.
- Then the case study proper, each chapter a ruled row with its label in the
  margin: an opening summary, **the problem**, **the work** as numbered
  steps, a **gallery** of three generated screens with captions, **the
  outcome** as three metrics, and a pull quote.
- A *View live* link and a signature.
- It ends on a tall sticky grid carrying the next project's title, split
  across ruled rows. Scrolling through it lifts that project's spinning disc
  from below the fold, up and off the top of the screen; once it has left,
  the handover happens on its own and the next project animates in. Clicking
  anywhere in the section jumps straight there instead.

## Routes

Hash based, so deep links work on GitHub Pages with no server config:

| Route | Shows |
| --- | --- |
| `#/` | Client work library |
| `#/explore` | Explorations library |
| `#/p/<slug>` | A project page |

The browser Back button returns from a project to the library, landing on
that project's disc.

## The discs

Each disc is modelled on a real 120mm disc's anatomy, normalised to radius 1:
centre hole, clear polycarbonate hub with its stacking ridge, mirror band,
printed label, clear outer rim and moulded edge.

Two decisions carry most of the realism:

- **The label is two layers.** Underneath, the print itself, unlit and not
  tone mapped, so ink is exactly the colour it was designed in. On top, a
  glossy layer that adds reflections only. A single lit material washed every
  label out to pastel.
- **The reflections come from a custom soft studio**: a grey gradient room
  with two softboxes. three.js's stock room environment has very hot light
  panels, and a flat glossy disc reflects one direction across its whole
  face, so any disc angled at a panel went solid white.

## Swapping in real content

Everything lives in `js/data.js`. Each project carries its library entry
(name, year, role, team, two reviews) and its case study: client, status,
industry, platform, timeline, a tagline (one word per row over the hero), a
summary, the `challenge` paragraph, three `approach` steps, three `outcome`
metrics, three `gallery` captions and a pull `quote`.

**Artwork.** Each disc label and each hero image is generated from the
project's `art` colours and motif, so the site looks finished with no image
files at all. To use real images, add to the project:

```js
discImage: 'assets/discs/kora.webp',   // square, printed on the disc
heroImage: 'assets/heroes/kora.webp',  // landscape, the project page image
```

Gallery shots come in three looks, set per image by its `variant`: `detail`
(a close crop of the interface), `system` (the component set laid out flat)
and `context` (the thing in use).

Keep anything important on a disc label more than a third of the way out
from the centre, where the hole and the clear hub are. Hero images should be
dark enough for white type to read over them.

**Collections.** `COLLECTIONS` in `js/data.js` defines the two tabs. Rename
them freely; a project's `collection` field says which tab it belongs to.

## Type

| Role | Face | Stand-in for |
| --- | --- | --- |
| Headings, labels | Instrument Serif | PP Eiko, PP Museum |
| Everything else | Inter Tight | PP Neue Montreal |

The reference's fonts are commercial (Pangram Pangram), so free equivalents
are used. If she licenses the originals, add the files and change `--serif`
and `--sans` in `css/site.css`.

Sizing is fluid: `1em` derives from the viewport through `--size-font` (12px
at 1440 wide, 16px at 1920), with its own curve inside each breakpoint band.
Everything is sized in `em`, so the whole layout scales as one piece.

## Accessibility

- Screen-reader instructions for the keyboard controls, a live region
  announcing the current project, and a hidden list of links to every
  project, since the discs themselves are drawn on a canvas.
- Keyboard: ← → to browse, Enter to open, Space to flip, Escape to close the
  index.
- `prefers-reduced-motion` removes the rolling, floating and transitions.

## Running locally

```bash
python3 -m http.server 4321
```

Then open <http://localhost:4321>. It needs a browser with WebGL; without it,
the page says so and the index still works.

## Deploying

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to
`main`. It copies `index.html`, `css/`, `js/` and `assets/`, and stamps the
`?v=` cache buster with the commit hash — including the `?v=` on the ES
module imports inside `js/`, so a fresh `app.js` can never run against a
cached `discs.js`. Bump those numbers by hand when working locally. One-time setup: **Settings → Pages →
Source → GitHub Actions**.

This version lives on the `v2` branch. Merge it into `main` to make it live.
