import './styles/fonts.css';
import './styles/theme.css';
import './styles/layout.css';
import './styles/atmosphere.css';
import './styles/landing.css';

const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const RAMP_LEN = RAMP.length;

const CELL_W = 9;
const CELL_H = 13;
const INNER_R = 72;
const OUTER_R = 320;

// How many ramp positions the field can push a cell from its true luminance
const WANDER = 2;

// Base animation speed — a slow global drift that the field amplifies
const DRIFT_HZ = 0.6;

// Spotlight follows cursor with a soft lag (0 = frozen, 1 = instant)
const CURSOR_LERP = 0.07;

// Flicker: layered sines → flame-like pulse
const FLICKER_SLOW_HZ = 0.09;
const FLICKER_FAST = [
  { hz: 1.42, amp: 0.08 },
  { hz: 2.26, amp: 0.056 },
  { hz: 2.74, amp: 0.036 },
];
const FLICKER_SLOW_AMP = 0.12;

const TWO_PI = Math.PI * 2;

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function smoothstep(a, b, t) {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

function hash(i, j) {
  let h = (i * 374761393 + j * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

function publicAsset(path) {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${path.replace(/^\//, '')}`;
}

function buildGrid(img, cols, rows) {
  const sample = document.createElement('canvas');
  sample.width = cols;
  sample.height = rows;
  const sctx = sample.getContext('2d', { willReadFrequently: true });
  if (!sctx) return [];

  const ir = img.naturalWidth / img.naturalHeight;
  const vr = cols / rows;
  let sx, sy, sw, sh;
  if (ir > vr) {
    sh = img.naturalHeight;
    sw = sh * vr;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / vr;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }
  sctx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
  const { data } = sctx.getImageData(0, 0, cols, rows);

  const cells = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const p = (j * cols + i) * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const baseIdx = Math.min(RAMP_LEN - 1, Math.floor(l * (RAMP_LEN - 1)));
      const seed = (hash(i, j) & 0xffff) / 0xffff;
      cells.push({ baseIdx, seed, r, g, b, l });
    }
  }
  return cells;
}

function initAsciiSpotlight() {
  const canvas = document.getElementById('ascii-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const img = new Image();

  let cells = [];
  let cols = 0;
  let rows = 0;
  let dpr = 1;
  let logicalW = 0;
  let logicalH = 0;

  let mx = 0;
  let my = 0;
  let sx = 0;
  let sy = 0;
  let navH = 0;
  let hasPointer = false;
  let running = false;
  let frameId = null;

  const nav = document.querySelector('.site-nav');

  function layout() {
    navH = nav ? nav.offsetHeight : 0;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    logicalW = window.innerWidth;
    logicalH = window.innerHeight - navH;
    canvas.style.top = `${navH}px`;
    canvas.width = Math.floor(logicalW * dpr);
    canvas.height = Math.floor(logicalH * dpr);
    canvas.style.width = `${logicalW}px`;
    canvas.style.height = `${logicalH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `500 ${CELL_H * 0.92}px "Departure Mono", ui-monospace, monospace`;
    ctx.textBaseline = 'top';

    cols = Math.ceil(logicalW / CELL_W);
    rows = Math.ceil(logicalH / CELL_H);

    if (img.complete && img.naturalWidth) {
      cells = buildGrid(img, cols, rows);
    }

    if (!hasPointer) {
      sx = logicalW * 0.5;
      sy = logicalH * 0.48;
    }
  }

  // --- flicker: sum of slow breath + fast incommensurate sines ---
  function flicker(t, spotlight) {
    const slow = Math.sin(t * TWO_PI * FLICKER_SLOW_HZ) * FLICKER_SLOW_AMP;
    let fast = 0;
    for (let k = 0; k < FLICKER_FAST.length; k++) {
      fast += Math.sin(t * TWO_PI * FLICKER_FAST[k].hz) * FLICKER_FAST[k].amp;
    }
    // Stronger flutter near cursor center
    const weight = 0.5 + 0.5 * spotlight;
    return 1 + slow + fast * weight;
  }



  function draw(t) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, logicalW, logicalH);

    if (!cells.length) return;

    const tx = hasPointer ? mx : logicalW * 0.5;
    const ty = hasPointer ? my : logicalH * 0.48;
    sx += (tx - sx) * CURSOR_LERP;
    sy += (ty - sy) * CURSOR_LERP;
    const cx = sx;
    const cy = sy;

    const pad = OUTER_R + CELL_W;
    const i0 = Math.max(0, Math.floor((cx - pad) / CELL_W));
    const i1 = Math.min(cols - 1, Math.ceil((cx + pad) / CELL_W));
    const j0 = Math.max(0, Math.floor((cy - pad) / CELL_H));
    const j1 = Math.min(rows - 1, Math.ceil((cy + pad) / CELL_H));

    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const cell = cells[j * cols + i];
        if (!cell) continue;

        const px = i * CELL_W + CELL_W * 0.5;
        const py = j * CELL_H + CELL_H * 0.5;
        const dist = Math.hypot(px - cx, py - cy);
        if (dist > OUTER_R) continue;

        const spotlight = 1 - smoothstep(INNER_R, OUTER_R, dist);

        // Field-driven glyph: one slow global drift, field strength
        // controls how much of that drift actually reaches each cell.
        // At field=0 the cell is frozen at its base character.
        let ch;
        if (prefersReducedMotion) {
          ch = RAMP[cell.baseIdx];
        } else {
          const f = spotlight * spotlight;
          const drift = Math.sin(t * TWO_PI * DRIFT_HZ + cell.seed * TWO_PI);
          const offset = Math.round(drift * WANDER * f);
          const ci = Math.max(0, Math.min(RAMP_LEN - 1, cell.baseIdx + offset));
          ch = RAMP[ci];
        }

        const lBoost = 0.12 + 0.88 * cell.l;
        let alpha = spotlight * lBoost;

        // Flame flicker on alpha (skip for reduced motion)
        if (!prefersReducedMotion) {
          alpha *= flicker(t, spotlight);
        }

        if (alpha < 0.02) continue;
        alpha = Math.min(alpha, 1);

        ctx.fillStyle = `rgba(${cell.r},${cell.g},${cell.b},${alpha})`;
        ctx.fillText(ch, i * CELL_W, j * CELL_H);
      }
    }
  }

  // --- continuous rAF loop ---
  function tick(now) {
    frameId = requestAnimationFrame(tick);
    draw(now / 1000);
  }

  function start() {
    if (running) return;
    running = true;
    frameId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (frameId != null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  // --- events ---
  img.onload = () => {
    layout();
    start();
  };
  img.onerror = () => {
    cells = [];
    layout();
  };

  img.src = publicAsset('landing-hero.png');
  if (img.complete && img.naturalWidth) {
    layout();
    start();
  }

  window.addEventListener('resize', layout);

  document.addEventListener(
    'mousemove',
    (e) => {
      mx = e.clientX;
      my = e.clientY - navH;
      hasPointer = true;
    },
    { passive: true },
  );

  document.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches[0]) {
        mx = e.touches[0].clientX;
        my = e.touches[0].clientY - navH;
        hasPointer = true;
      }
    },
    { passive: true },
  );

  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches[0]) {
        mx = e.touches[0].clientX;
        my = e.touches[0].clientY - navH;
        hasPointer = true;
      }
    },
    { passive: true },
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else if (cells.length) {
      start();
    }
  });
}

initAsciiSpotlight();
