/**
 * Site-wide phosphor bloom: two SVG filters (full UI vs softer on media).
 * Tune strength in BLOOM_* and MEDIA_BLOOM_FACTOR below.
 */
const FILTER_ID = 'malf-phosphor-bloom';
const FILTER_MEDIA_ID = 'malf-phosphor-bloom-media';
const SVG_ID = 'malf-phosphor-svg';
const ROOT_CLASS = 'phosphor-root';

/** Base bloom (glyph soft σ, wide σ, additive k3). */
const BLOOM_SOFT = 0.575;
const BLOOM_WIDE = 8;
const BLOOM_K3 = 1;

/**
 * Media (img / video / hero frame) uses this fraction of the base blur + add.
 * 0.1 ≈ 10% of the UI text bloom; raise toward 1 to match text.
 */
const MEDIA_BLOOM_FACTOR = 0.1;

function appendBloomFilter(defs, id, soft, wide, k3) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', id);
  filter.setAttribute('x', '-80%');
  filter.setAttribute('y', '-80%');
  filter.setAttribute('width', '260%');
  filter.setAttribute('height', '260%');
  filter.setAttribute('color-interpolation-filters', 'sRGB');

  const softEl = document.createElementNS(svgNS, 'feGaussianBlur');
  softEl.setAttribute('in', 'SourceGraphic');
  softEl.setAttribute('stdDeviation', String(soft));
  softEl.setAttribute('result', 'glyphSoft');

  const bloomEl = document.createElementNS(svgNS, 'feGaussianBlur');
  bloomEl.setAttribute('in', 'glyphSoft');
  bloomEl.setAttribute('stdDeviation', String(wide));
  bloomEl.setAttribute('result', 'bloomBlur');

  const merge = document.createElementNS(svgNS, 'feComposite');
  merge.setAttribute('in', 'glyphSoft');
  merge.setAttribute('in2', 'bloomBlur');
  merge.setAttribute('operator', 'arithmetic');
  merge.setAttribute('k1', '0');
  merge.setAttribute('k2', '1');
  merge.setAttribute('k3', String(k3));
  merge.setAttribute('k4', '0');

  filter.appendChild(softEl);
  filter.appendChild(bloomEl);
  filter.appendChild(merge);
  defs.appendChild(filter);
}

function injectFilterSvg(body) {
  if (document.getElementById(SVG_ID)) return;

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.id = SVG_ID;
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.style.cssText =
    'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';

  const defs = document.createElementNS(svgNS, 'defs');

  appendBloomFilter(defs, FILTER_ID, BLOOM_SOFT, BLOOM_WIDE, BLOOM_K3);
  appendBloomFilter(
    defs,
    FILTER_MEDIA_ID,
    BLOOM_SOFT * MEDIA_BLOOM_FACTOR,
    BLOOM_WIDE * MEDIA_BLOOM_FACTOR,
    BLOOM_K3 * MEDIA_BLOOM_FACTOR,
  );

  svg.appendChild(defs);
  body.insertBefore(svg, body.firstChild);
}

function wrapContent(body) {
  if (document.querySelector(`.${ROOT_CLASS}`)) return;

  const svgEl = document.getElementById(SVG_ID);
  const root = document.createElement('div');
  root.className = ROOT_CLASS;

  const movable = [...body.children].filter(
    (el) => el !== svgEl && el.tagName !== 'SCRIPT',
  );
  movable.forEach((el) => root.appendChild(el));

  if (svgEl && svgEl.nextSibling) {
    body.insertBefore(root, svgEl.nextSibling);
  } else {
    body.appendChild(root);
  }
}

export function initGlobalPhosphor() {
  const body = document.body;
  if (!body) return;

  injectFilterSvg(body);
  wrapContent(body);
}
