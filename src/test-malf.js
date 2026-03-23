import { initGlobalPhosphor } from './globalPhosphor.js';
import { accentFillStyle } from './theme/accent.js';

import './styles/theme.css';
import './styles/atmosphere.css';

initGlobalPhosphor();

/**
 * Isolated CRT glyph test — bloom/soften via global site filter only.
 */
const TEXT = 'MALFLOURISHED';

const canvas = document.getElementById('c');
if (canvas) {
  const ctx = canvas.getContext('2d');

  function draw() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = Math.min(420, Math.max(240, window.innerHeight * 0.55));
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const fontPx = Math.min(72, Math.max(28, W * 0.085));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.font = `bold ${fontPx}px monospace`;
    ctx.textBaseline = 'middle';

    const tw = ctx.measureText(TEXT).width;
    const x0 = (W - tw) / 2;
    const y = H / 2;

    ctx.fillStyle = accentFillStyle();
    ctx.fillText(TEXT, x0, y);
  }

  draw();
  window.addEventListener('resize', draw);
}
