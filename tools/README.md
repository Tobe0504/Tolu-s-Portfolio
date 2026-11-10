# Drawing tools

Dev-only, no dependencies, and nothing here ships — only its output does.

`draw-turntable.mjs` draws the loading screen's deck and writes it straight
into the block between the `TURNTABLE` markers in `../index.html`:

```bash
cd tools && npm run draw
```

`pen.mjs` is the hand it draws with: the same wandering, twice-gone-over
stroke that `js/art.js` uses for the hero and the project scenes, emitting
SVG path data instead of painting to a canvas. Keeping one pen for the whole
site is the point — a drawing library would have given the loading screen a
different hand from everything around it.

Change the shapes in `draw-turntable.mjs`, run it again, and commit the
result. The seed at the top (`rng("turntable-07")`) decides how the lines
wander; change the number for a different draw of the same object.
