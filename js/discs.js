/* ═══════════════════════════════════════════════════════════════════════════
   The discs. A real CD's anatomy, built in three.js:

     centre hole ─ clear polycarbonate hub ─ stacking ridge ─ mirror band ─
     printed label (glossy, clear-coated) ─ clear outer rim ─ moulded edge

   and on the reverse, the silver data side with thin-film iridescence,
   which is what you see when a disc is flipped. Everything is lit by a
   studio environment map rather than lamps, which is what makes a glossy
   object read as physical instead of as a flat texture on a circle.
   ═══════════════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';
import { discLabel, dataSide } from './art.js';

/* proportions of a 120mm disc, normalised to radius 1 */
const R = 1, HOLE = 0.125, HUB = 0.305, BAND = 0.335, LABEL_OUT = 0.985, T = 0.018;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));

function planarUV(geo) {
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (2 * R) + 0.5, p.getY(i) / (2 * R) + 0.5);
  uv.needsUpdate = true;
  return geo;
}

/* shared, created once per renderer */
function materials(renderer) {
  const clear = new THREE.MeshPhysicalMaterial({
    color: 0x8d949d, roughness: 0.26, metalness: 0.2, envMapIntensity: 0.55,
    clearcoat: 1, clearcoatRoughness: 0.05,
    transparent: true, opacity: 0.62, depthWrite: false, side: THREE.DoubleSide
  });
  const ridge = new THREE.MeshPhysicalMaterial({
    color: 0x9aa1aa, roughness: 0.28, metalness: 0.3, transparent: true, opacity: 0.9
  });
  const mirror = new THREE.MeshPhysicalMaterial({
    color: 0xc9ced4, metalness: 1, roughness: 0.2, envMapIntensity: 0.8, clearcoat: 1, clearcoatRoughness: 0.08
  });
  /* the data side: aluminium under polycarbonate, with the rainbow sheen
     that the pits cause, approximated with thin-film iridescence */
  const dataTex = new THREE.CanvasTexture(dataSide());
  dataTex.colorSpace = THREE.SRGBColorSpace;
  dataTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const data = new THREE.MeshPhysicalMaterial({
    map: dataTex, color: 0xffffff, metalness: 1, roughness: 0.16, envMapIntensity: 1.5,
    iridescence: 0.35, iridescenceIOR: 1.4, iridescenceThicknessRange: [200, 500],
    clearcoat: 1, clearcoatRoughness: 0.04
  });
  const edge = new THREE.MeshPhysicalMaterial({
    color: 0xc4cad1, metalness: 0.5, roughness: 0.24,
    transparent: true, opacity: 0.6, side: THREE.DoubleSide
  });
  return { clear, ridge, mirror, data, edge };
}

function ring(inner, outer, segs = 160) { return planarUV(new THREE.RingGeometry(inner, outer, segs, 1)); }

/* Builds one disc. Hierarchy: root (placement, tilt) → flip (turns it over)
   → spin (rotation about its own axis) → meshes. */
export function buildDisc(project, renderer, mats) {
  const root = new THREE.Group(), flip = new THREE.Group(), spin = new THREE.Group();
  root.add(flip); flip.add(spin);

  const tex = new THREE.CanvasTexture(discLabel(project));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (project.discImage) {
    new THREE.TextureLoader().load(project.discImage, t => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = tex.anisotropy;
      label.material.map = t; label.material.needsUpdate = true; tex.dispose();
    });
  }

  const zf = T / 2 + 0.0006, zb = -T / 2 - 0.0006;

  /* The label is two layers. Underneath, the print itself, unlit and
     un-tonemapped, so the ink is exactly the colour it was designed in.
     On top, a glossy coat that contributes only reflections (additive over
     black), which is the clear lacquer catching the room. Lighting a single
     material instead washed every label toward pastel. */
  const label = new THREE.Mesh(ring(BAND, LABEL_OUT), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  label.position.z = zf;
  const gloss = new THREE.Mesh(ring(BAND, LABEL_OUT), new THREE.MeshPhysicalMaterial({
    color: 0x000000, metalness: 0, roughness: 0.14, envMapIntensity: 0.32,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  gloss.position.z = zf + 0.0004; gloss.renderOrder = 1;

  const hubF = new THREE.Mesh(ring(HOLE, HUB, 96), mats.clear);  hubF.position.z = zf;
  const bandF = new THREE.Mesh(ring(HUB, BAND, 128), mats.mirror); bandF.position.z = zf;
  const rimF = new THREE.Mesh(ring(LABEL_OUT, R), mats.clear);    rimF.position.z = zf;

  const ridge = new THREE.Mesh(new THREE.TorusGeometry(0.228, 0.0065, 10, 128), mats.ridge);
  ridge.scale.z = 0.5; ridge.position.z = zf;

  const back = new THREE.Mesh(ring(BAND, R), mats.data);
  back.rotation.y = Math.PI; back.position.z = zb;
  const hubB = new THREE.Mesh(ring(HOLE, BAND, 96), mats.clear);
  hubB.rotation.y = Math.PI; hubB.position.z = zb;

  const outer = new THREE.Mesh(new THREE.CylinderGeometry(R, R, T, 192, 1, true), mats.edge);
  outer.rotation.x = Math.PI / 2;
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(HOLE, HOLE, T, 64, 1, true), mats.edge);
  inner.rotation.x = Math.PI / 2;

  /* transparent parts draw after the opaque ones */
  [hubF, hubB, rimF].forEach(m => { m.renderOrder = 2; });

  spin.add(label, gloss, hubF, bandF, rimF, ridge, back, hubB, outer, inner);

  /* invisible, slightly generous hit target for pointer picking */
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.02, R * 1.02, T * 6, 48),
    new THREE.MeshBasicMaterial({ visible: false }));
  hit.rotation.x = Math.PI / 2;
  spin.add(hit);

  root.userData = { project, flip, spin, hit, label, gloss, tex };
  return root;
}

function disposeDisc(root) {
  root.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material && o.material.map) o.material.map.dispose();
  });
  root.userData.label.material.dispose();
  root.userData.gloss.material.dispose();
}

/* A controlled studio for reflections: a grey gradient room with two soft
   boxes. Three's stock room environment has very hot light panels, and a
   flat glossy disc reflects one direction across its whole face, so any
   disc angled at a panel went solid white. Nothing here exceeds ~1.9, so
   gloss reads as a sheen and never as a blowout. */
function studio(renderer) {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(10, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: `varying vec3 vDir;
        void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vDir;
        float box(vec3 d, vec3 at, float size, float soft){ return smoothstep(size - soft, size, dot(d, normalize(at))); }
        void main(){
          float h = vDir.y * 0.5 + 0.5;
          vec3 c = mix(vec3(0.46), vec3(0.93), smoothstep(0.0, 1.0, h));
          c += vec3(0.95) * box(vDir, vec3(-0.45, 0.75, 0.55), 0.93, 0.12);   /* key softbox */
          c += vec3(0.55) * box(vDir, vec3(0.85, 0.15, 0.45), 0.95, 0.10);   /* rim strip */
          c += vec3(0.25) * box(vDir, vec3(0.0, -0.2, 1.0), 0.90, 0.25);     /* bounce from the floor */
          gl_FragColor = vec4(c, 1.0);
        }`
    })
  );
  scene.add(room);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.02).texture;
  pmrem.dispose(); room.geometry.dispose(); room.material.dispose();
  return env;
}

function makeRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

/* ═══ the home carousel ═══════════════════════════════════════════════ */
export function createCarousel(canvas, { onChange, onOpen, onHover, onFrame } = {}) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.environment = studio(renderer);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d8d8, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(-3, 4, 6); scene.add(key);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  const mats = materials(renderer);

  let items = [], current = 0, target = 0, lastIndex = -1;
  let W = 1, H = 1, visW = 1, visH = 1, unit = 1;
  let pointer = { x: 0, y: 0, inside: false }, hovering = false;
  let openT = 0, openTarget = 0, active = true, raf = 0, t0 = performance.now();
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width || innerWidth; H = r.height || innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    visH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    visW = visH * camera.aspect;
    /* the centre disc is bounded by whichever of width or height runs out
       first, so it reads the same on a phone and on a wide monitor */
    unit = Math.min(visW * 0.33, visH * 0.265);
  }

  function setProjects(list, start = 0) {
    items.forEach(it => { scene.remove(it.disc); disposeDisc(it.disc); });
    items = list.map((project, i) => {
      const disc = buildDisc(project, renderer, mats);
      /* each disc gets its own resting angle, so the row looks handled
         rather than stamped out */
      const seed = [...project.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
      /* rest angle kept within a small arc, so a title never sits upside down
         when its disc is in front */
      disc.userData.restSpin = (((seed % 100) / 100) - 0.5) * 0.7;
      disc.userData.flipTarget = 0;
      disc.userData.i = i;
      scene.add(disc);
      return { project, disc };
    });
    current = target = clamp(start, 0, items.length - 1);
    lastIndex = -1;
    layout(0.016, true);
  }

  const goTo = i => { target = clamp(Math.round(i), 0, items.length - 1); };
  /* move without travelling: used while the library is hidden, so coming
     back from a project lands on its disc instead of wheeling there */
  const jump = i => { goTo(i); current = target; layout(0.016, true); };
  const step = d => goTo(target + d);
  const index = () => Math.round(target);

  function flip() {
    const it = items[index()];
    if (!it) return;
    it.disc.userData.flipTarget = it.disc.userData.flipTarget ? 0 : Math.PI;
  }

  /* placement as a function of distance from the centre */
  function layout(dt, snap) {
    const now = (performance.now() - t0) / 1000;
    items.forEach(({ disc }, i) => {
      const d = i - current, ad = Math.abs(d), sd = Math.sign(d);
      const near = clamp(ad, 0, 1);

      /* neighbours sit at the edges of the screen, smaller and lower; the
         ones beyond fall away out of frame */
      const x = sd * (near * visW * 0.5 + Math.max(0, ad - 1) * visW * 0.34);
      const y = -near * visH * 0.17 - Math.max(0, ad - 1) * visH * 0.06;
      const z = -ad * 1.1;
      const s = unit * (1 - near * 0.56) * (1 - Math.max(0, ad - 1) * 0.2);

      const u = disc.userData;
      const float = reduce ? 0 : Math.sin(now * 0.9 + i * 1.7) * 0.012 * unit;

      disc.position.set(x, y + float, z);
      disc.scale.setScalar(Math.max(s, 0.0001));

      /* the centre disc lies back and turns toward the light; neighbours
         stand closer to face-on */
      const tiltX = -0.78 + near * 0.46, tiltY = 0.22 - sd * near * 0.35, tiltZ = 0.46 - near * 0.3;
      const px = ad < 0.5 && pointer.inside ? pointer.y * 0.12 : 0;
      const py = ad < 0.5 && pointer.inside ? pointer.x * 0.16 : 0;
      disc.rotation.x = snap ? tiltX : damp(disc.rotation.x, tiltX + px, 8, dt);
      disc.rotation.y = snap ? tiltY : damp(disc.rotation.y, tiltY + py, 8, dt);
      disc.rotation.z = tiltZ;

      /* rolling: the discs spin with the carousel's velocity, like they are
         being wheeled past rather than slid */
      u.spin.rotation.z = u.restSpin + d * 1.9;

      u.flip.rotation.y = snap ? u.flipTarget : damp(u.flip.rotation.y, u.flipTarget, 7, dt);

      /* opening a project: the centre disc lifts and grows, the rest fall away */
      if (openT > 0) {
        if (ad < 0.5) { disc.position.y += openT * visH * 0.12; disc.scale.multiplyScalar(1 + openT * 0.18); }
        else disc.scale.multiplyScalar(1 - openT);
      }
      disc.visible = ad < 2.6 && disc.scale.x > 0.001;
    });

    const idx = Math.round(current);
    if (idx !== lastIndex && items[idx]) { lastIndex = idx; onChange && onChange(idx, items[idx].project); }
  }

  function pick() {
    if (!pointer.inside || !items.length) return null;
    ndc.set(pointer.x, pointer.y);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(items.filter(i => i.disc.visible).map(i => i.disc.userData.hit), false);
    if (!hits.length) return null;
    return items.findIndex(i => i.disc.userData.hit === hits[0].object);
  }

  /* screen-space outline of the centre disc, for the hand-drawn loop */
  const tmp = new THREE.Vector3();
  function centreOutline(n = 56) {
    const it = items[index()];
    if (!it) return null;
    it.disc.updateMatrixWorld(true);
    const m = it.disc.userData.spin.matrixWorld, pts = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      tmp.set(Math.cos(a) * R, Math.sin(a) * R, 0).applyMatrix4(m).project(camera);
      pts.push([(tmp.x * 0.5 + 0.5) * W, (-tmp.y * 0.5 + 0.5) * H]);
    }
    return pts;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!active) return;
    const dt = Math.min((now - (frame.last || now)) / 1000, 0.05);
    frame.last = now;

    current = reduce ? target : damp(current, target, 6.5, dt);
    if (Math.abs(current - target) < 0.0005) current = target;
    openT = reduce ? openTarget : damp(openT, openTarget, 7, dt);

    layout(dt);

    const over = pick();
    const onCentre = over !== null && over === index() && openT < 0.05;
    canvas.style.cursor = over !== null && openT < 0.05 ? 'pointer' : '';
    if (onCentre !== hovering) { hovering = onCentre; onHover && onHover(hovering); }

    renderer.render(scene, camera);
    onFrame && onFrame();
  }

  /* ── input ─────────────────────────────────────────────────────────── */
  let wheelAcc = 0, wheelLock = 0, lastWheel = 0;
  function onWheel(e) {
    if (!active || openTarget) return;
    e.preventDefault();
    const now = performance.now();
    const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (now - lastWheel > 220) wheelAcc = 0;          /* a fresh gesture */
    lastWheel = now;
    wheelAcc += d * (e.deltaMode === 1 ? 16 : 1);
    if (now < wheelLock || Math.abs(wheelAcc) < 42) return;
    step(Math.sign(wheelAcc));
    wheelAcc = 0; wheelLock = now + 420;               /* one disc per flick */
  }

  let drag = null;
  function onDown(e) {
    if (!active || openTarget) return;
    drag = { x: e.clientX, start: target, moved: 0, id: e.pointerId, t: performance.now() };
  }
  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    /* only count as "over the stage" when nothing else (the bar) is on top */
    pointer.inside = e.target === canvas || !!drag;
    if (!drag) return;
    const dx = e.clientX - drag.x;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    if (drag.moved > 6) target = clamp(drag.start - dx / (W * 0.42), -0.35, items.length - 0.65);
  }
  function onUp(e) {
    if (!drag) return;
    const moved = drag.moved;
    const velocity = (drag.x - e.clientX) / Math.max(1, performance.now() - drag.t);
    drag = null;
    if (moved > 6) {
      /* a quick flick carries on to the next disc even if it was short */
      goTo(target + clamp(velocity, -1, 1) * 0.6);
      return;
    }
    const over = pick();
    if (over === null) return;
    if (over === index()) onOpen && onOpen(items[over].project);
    else goTo(over);
  }

  canvas.addEventListener('pointerdown', onDown);
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerup', onUp);
  canvas.addEventListener('pointerleave', () => { pointer.inside = false; });
  addEventListener('resize', resize, { passive: true });

  resize();
  raf = requestAnimationFrame(frame);

  return {
    setProjects, goTo, jump, step, flip, index, centreOutline,
    count: () => items.length,
    project: () => items[index()]?.project,
    wheel: onWheel,
    setActive(on) { active = on; frame.last = 0; },
    open(on) { openTarget = on ? 1 : 0; },
    isHovering: () => hovering
  };
}

/* ═══ a single disc on its own stage (the next-project teaser) ═════════ */
export function createDiscStage(container, project) {
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  scene.environment = studio(renderer);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d8d8, 0.55));
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  const disc = buildDisc(project, renderer, materials(renderer));
  scene.add(disc);

  let raf = 0, alive = true, progress = 0;
  const resize = () => {
    const r = container.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(r.height, 1); camera.updateProjectionMatrix();
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(13)) * 9;
    disc.scale.setScalar(Math.min(vh * camera.aspect * 0.34, vh * 0.42));
  };
  const frame = now => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const t = now / 1000;
    disc.rotation.set(-0.62 - progress * 0.3, 0.18, 0.4);
    disc.userData.spin.rotation.z = reduce ? 0 : t * 0.15;
    renderer.render(scene, camera);
  };
  resize();
  addEventListener('resize', resize, { passive: true });
  raf = requestAnimationFrame(frame);

  return {
    setProgress(p) { progress = clamp(p, 0, 1); },
    dispose() {
      alive = false; cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
      disposeDisc(disc); renderer.dispose(); canvas.remove();
    }
  };
}
