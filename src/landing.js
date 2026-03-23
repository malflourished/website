import { initGlobalPhosphor } from './globalPhosphor.js';
import { accentFillStyle } from './theme/accent.js';

initGlobalPhosphor();

import './styles/theme.css';
import './styles/layout.css';
import './styles/atmosphere.css';
import './styles/landing.css';

/**
 * CRT-style title: bold monospace, `accentFillStyle()` / --accent on black.
 * Edge softening + phosphor bloom: global SVG filter on `.phosphor-root` (see globalPhosphor.js).
 */
const TITLE = 'MALFLOURISHED';

const FONT = (px) => `bold ${px}px monospace`;

const FLICKER_SLOW_HZ = 0.09;
const FLICKER_SLOW_AMP = 0.03;
const TWO_PI = Math.PI * 2;

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initCrtLanding() {
  const canvas = document.getElementById('ascii-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let dpr = 1;
  let logicalW = 0;
  let logicalH = 0;
  let navH = 0;
  let frameId = null;
  let running = false;

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
  }

  function draw(t) {
    const fontPx = Math.min(
      72,
      Math.max(22, Math.min(logicalW, logicalH) * 0.085),
    );

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, logicalW, logicalH);

    ctx.font = FONT(fontPx);
    ctx.textBaseline = 'middle';

    const tw = ctx.measureText(TITLE).width;
    const cx = (logicalW - tw) / 2;
    const cy = logicalH / 2;

    let flick = 1;
    if (!prefersReducedMotion) {
      flick = 1 + Math.sin(t * TWO_PI * FLICKER_SLOW_HZ) * FLICKER_SLOW_AMP;
    }

    ctx.fillStyle = accentFillStyle();
    ctx.globalAlpha = Math.min(1, flick);
    ctx.fillText(TITLE, cx, cy);
    ctx.globalAlpha = 1;
  }

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

  function boot() {
    layout();
    if (prefersReducedMotion) {
      draw(0);
      window.addEventListener('resize', () => {
        layout();
        draw(0);
      });
    } else {
      start();
      window.addEventListener('resize', layout);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
      });
    }
  }

  boot();
}

initCrtLanding();
