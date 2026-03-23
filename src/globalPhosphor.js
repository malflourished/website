/**
 * Site-wide phosphor-style bloom: same-document SVG filter + wrapper so all UI
 * (canvas, nav, copy, grain) composites as one layer.
 */
const FILTER_ID = 'malf-phosphor-bloom';
const SVG_ID = 'malf-phosphor-svg';
const ROOT_CLASS = 'phosphor-root';

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
  const filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', FILTER_ID);
  filter.setAttribute('x', '-80%');
  filter.setAttribute('y', '-80%');
  filter.setAttribute('width', '260%');
  filter.setAttribute('height', '260%');
  filter.setAttribute('color-interpolation-filters', 'sRGB');

  // Soft glyph pass + wide bloom; σ tuned in one place (halve/ double for strength).
  const soft = document.createElementNS(svgNS, 'feGaussianBlur');
  soft.setAttribute('in', 'SourceGraphic');
  soft.setAttribute('stdDeviation', '0.575');
  soft.setAttribute('result', 'glyphSoft');

  const bloom = document.createElementNS(svgNS, 'feGaussianBlur');
  bloom.setAttribute('in', 'glyphSoft');
  bloom.setAttribute('stdDeviation', '8');
  bloom.setAttribute('result', 'bloomBlur');

  const merge = document.createElementNS(svgNS, 'feComposite');
  merge.setAttribute('in', 'glyphSoft');
  merge.setAttribute('in2', 'bloomBlur');
  merge.setAttribute('operator', 'arithmetic');
  merge.setAttribute('k1', '0');
  merge.setAttribute('k2', '1');
  merge.setAttribute('k3', '1');
  merge.setAttribute('k4', '0');

  filter.appendChild(soft);
  filter.appendChild(bloom);
  filter.appendChild(merge);
  defs.appendChild(filter);
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
