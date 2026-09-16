# Tolulope Elijah — Portfolio

A single-page portfolio for Tolulope Elijah, product designer. Vanilla HTML,
CSS and JavaScript. No build step: open `index.html` and it runs; deploy by
dragging the folder onto Netlify, Vercel or GitHub Pages.

**All copy, projects, testimonials and metrics are placeholder.** See
_Swapping in real content_ below.

## Art direction — "Golden Hour"

The page is one continuous journey from a warm late-afternoon sky, down
through dusk, into a night you can hang stars in:

| Section | Where the light is |
| --- | --- |
| Hero | Golden hour. Ribbed sun, drifting clouds, birds, layered dunes, and a small procession walking the front ridge. |
| About / Work | Paper. A swift flies a scroll-driven path down the section, paying out a dotted contrail behind it. |
| Testimonials | Dusk band rises to meet the page; ridge silhouette on the horizon. |
| Contact | The light drains out and the ground goes dark, or warm, depending on theme. |
| Contact | The light drains out; hills go dark. |
| Footer | The ground the page settles on. At night, a sky you hang stars in; by day, warm sand you connect ink dots on. Same mechanic, two palettes. |

Both palettes share one stylesheet by re-pointing a single set of role
tokens. There is no manual switch: the site follows the operating system's
appearance setting and keeps following it if the visitor changes it
mid-visit. Day is warm — sand, clay, amber. Night is
deliberately neutral: near-black through greys to off-white, with the amber
accent kept so the brand survives the switch. The choice persists in `localStorage` and
defaults to the visitor's system preference.

### Type

| Role | Face |
| --- | --- |
| Headings, display | Fraunces (variable; its `opsz`, `SOFT` and `WONK` axes are animated on the rotating word) |
| Everything else | Outfit |

Two families, no monospace anywhere. Outfit is the rounded geometric sans
carrying interface, body copy and every small label — it is the closest free
stand-in for Gilroy. Where those labels used to be monospaced they are now
Outfit at weight 600 with tighter tracking: mono brings its own width and
weight, so dropping it means adding both back by hand.

Gilroy itself is a commercial licence, so it is not linked. If she buys it,
repointing `--f-ui` is the only change needed.

### Colour

Raw palette lives in Tier 1 of `:root` (`--c-clay`, `--c-amber`, `--c-olive`…).
Everything else references Tier 2 semantic roles (`--text`, `--accent`,
`--surface`…). To rebrand, change Tier 1 and the `body.night` block; nothing
else should need touching.

## The interactions

- **Aperture preloader** — six iris blades that rotate open onto the page,
  with rotating status lines. Hard 6s ceiling, plus a CSS-only bail-out at 9s
  if the script never runs.
- **The reel** — the hero centrepiece. A slide viewer with spinning spools,
  perforated film window and a brass lever. Auto-advances only while it's on
  screen and the tab is visible; tilts toward the pointer.
- **Rotating headline** — characters leave upward and arrive from below while
  Fraunces' `SOFT`/`WONK` axes settle. Pauses when the tab is hidden.
- **The procession** — four hand-drawn hooded figures walking the hero's front
  ridge, the leader carrying a stereo with notes drifting out of the speaker.
  **Hovering the leader sits the whole line down**: each figure holds two poses
  in the same SVG (walking and sitting) which cross-fade on a stagger, the
  leader sets his stereo on the ground, and the traversal eases to a stop
  rather than cutting, then eases back up on the way out. They are
  positioned from the *same curve the hill is drawn with*, sampled in pixel
  space, so they meet the crest at any viewport shape rather than at one
  hard-coded set of coordinates. Limbs are CSS keyframes; only the traversal
  is scripted, and it advances in pixels per second rather than fraction per
  second so they walk at one speed on every screen. Silhouette colour is a
  token (`--walker`), dark on the day sky and pale against the night ridge.
  The two rearmost figures drop out below 620px, where the tail of the line
  stops being legible.
- **The flight** — the spine of the work section. Scroll pays out a dotted
  trail along an SVG path and flies a swift at the head of it, the same birds
  that cross the hero. The path is parameterised by height rather than arc
  length, so the bird stays pinned near the middle of the screen and only its
  horizontal swooping changes. The trail sits behind the tiles; the bird flies
  above them. Hidden below 1080px, where the stacked layout squashes the curve
  into a vertical line.
- **Testimonial deck** — a stacked deck that fans out as it centres. Collapses
  to a plain stack below 860px.
- **Constellation footer** — canvas, and fully themed in both light and dark.
  Ambient parallax field, click-to-place marks that wire themselves to their
  two nearest neighbours, and meteors at night only. Caps at 90 marks. The
  arrival animations run off wall-clock age rather than frame count, so they
  play at the right speed on a 120Hz display and still land correctly in a
  throttled background tab.
- **Custom cursor** — a tight dot with a lagging ring; grows and takes a label
  over anything marked `data-cursor="…"`. Mouse-only.
- **Momentum scrolling** — interpolates the real scroll position (rather than
  transforming a wrapper) so `position: fixed` and the footer canvas keep
  working. Off for touch and reduced motion.

## Search

A command palette covers the whole site. It opens on **Cmd/Ctrl + K**, on
**`/`**, or from the search button in the nav, and is built for the keyboard:
arrows move, Enter opens, Escape closes.

The index is assembled at open time from the page itself — sections, every
entry in `CASES`, the social links in the footer, plus actions like copying
the email address. Choosing a project opens its case study directly rather
than just scrolling to the tile.

Matching is a subsequence search weighted toward word starts and runs of
adjacent characters, so `loom` finds LOOMFOLK and `proc` finds Process. A
match in a title always outranks one buried in a description. Matched
characters are highlighted, and all interpolated text is escaped.

## Accounts

**This is a static site. Nothing here authenticates anybody, and nothing here
can.** There is no server, no session and no access control. Anything gated
behind "signed in" is presentational only.

What exists is the UI and its wiring point. `readSession()` in `js/site.js`
is the single seam: point it at whatever your auth provider exposes — Clerk,
Auth0, Supabase, Netlify Identity, or a cookie read by a server that renders
this page — and the avatar and its menu appear. Until then it returns `null`
and the nav renders nothing at all, which is the correct behaviour for a
portfolio with no accounts.

To see the signed-in state locally, load `?session=demo` (and `?session=out`
to clear it). That flag is presentation only and must never be treated as a
credential.

Menu contents live in `ACCOUNT_ITEMS`. Each entry dispatches a `CustomEvent`
on `document` that a host application can listen for; standalone they just
close the menu. Sign out clears the demo flag and removes the avatar.

Real gating has to happen on a server. If private case studies are ever
wanted, this site would need to move somewhere that can run one.

## Case studies

The site stays one page. Clicking a project opens a full-screen dialog:

- The tile's own artwork is cloned and **grows into the case study hero**, so
  the click lands on the thing you clicked (a FLIP transition, skipped under
  reduced motion).
- The URL becomes `#work/<slug>`, so **a case study can be linked to directly
  and the browser Back button closes it**. Loading that URL opens it straight
  away.
- Escape closes it, focus is trapped inside while open, the page behind is
  `inert`, and focus returns to the tile on close.
- A reading-progress bar runs along the top edge, and each case ends with a
  link to the next one (which replaces rather than stacks history, so Back
  always returns to the page rather than walking back through projects).

Bands are composed from data, not hand-written markup. Each case is an entry
in `CASES` in `js/site.js` with a list of `bands`, each one of four kinds:

| Kind | Renders |
| --- | --- |
| `text` | Eyebrow, heading, paragraphs |
| `quote` | Large centred pull quote with attribution |
| `steps` | Numbered list of titled steps |
| `metrics` | Row of large figures with captions, plus body copy |

Set `tone: 'dark'` on a band to put it on the raised surface instead of the
page ground, so a case study alternates the way the home page does.

**KORA is written out in full** to show the shape a real case study takes.
The other three carry the same structure with stub copy and render a
`Placeholder case study` flag. Delete the `placeholder: true` key once real
words are in and the flag disappears.

## Swapping in real content

| What | Where |
| --- | --- |
| Projects (tiles) | `index.html` → `.tiles` |
| Projects (hero reel) | `js/site.js` → `FRAMES` |
| Rotating headline words | `js/site.js` → `ROTATE_WORDS` (keep them short — the line is right-aligned and long words run into the reel) |
| Case studies | `js/site.js` → `CASES` |
| Procession | `js/site.js` → `WALKERS` for spacing and scale; the two poses per figure are inline SVG in `index.html` (`.wk-walk` / `.wk-sit`) |
| Flight path shape | `index.html` → the two identical `d="…"` values in `.flight` (the visible path and its reveal mask must match) |
| Preloader lines | `js/site.js` → `LINES` |
| "Featured on" marquee | `js/site.js` → `OUTLETS` |
| Testimonials | `index.html` → `.t-deck` |
| Process steps, stats, contact | `index.html` |
| Avatar | `assets/avatar.svg` — replace with a real photo (`<img>` in `.nav-avatar`) |

Tile artwork is pure CSS (`.art-kora`, `.art-azza`, `.art-loom`, `.art-tide`
in `css/site.css`). To use photography instead, drop an `<img>` inside
`.tile-art` and delete the corresponding art rules.

## Accessibility

- Skip link, one `h1`, ordered headings, visible focus rings.
- Every animation is disabled under `prefers-reduced-motion`; the constellation
  paints one static frame and the marquee holds still.
- 44px minimum hit areas on coarse pointers, applied as invisible pads so the
  visual sizing is unaffected.
- `<noscript>` reveals all content and removes the loader.

## Running locally

```bash
python3 -m http.server 4321
```

Then open <http://localhost:4321>. Any static server works. There are no
dependencies and no build step; the only external request is Google Fonts.

## Browser support

Modern evergreen browsers. Uses `color-mix()`, `svh` units, backdrop filters
and CSS custom properties throughout. `document.startViewTransition` is used
for the theme swap where available and falls back to a plain class toggle.

The `?v=` query on the CSS and JS links is a cache buster. The deploy
workflow rewrites it to the commit hash on every push, so returning visitors
always get fresh files — there is nothing to bump by hand.

## Deploying

The site deploys to GitHub Pages through `.github/workflows/deploy.yml` on
every push to `main`. The workflow copies only `index.html`, `css/`, `js/`
and `assets/` into the published artifact, stamps the cache buster, and hands
it to Pages.

One-time setup: **Settings → Pages → Build and deployment → Source → GitHub
Actions.** After that, pushing is deploying.

The site is served from a subpath (`/Tolu-s-Portfolio/`), which is why every
asset reference in the markup is relative. Keep it that way: a path starting
with `/` will 404 in production while working fine locally.
