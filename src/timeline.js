import experience from './data/experience.json';

const timelineEl = document.getElementById('timeline');
const inspectorEl = document.getElementById('inspector');

let activeId = null;

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Preserve line breaks from JSON `body` strings in the inspector. */
function formatBody(text) {
  return escapeHtml(text).split('\n').join('<br>');
}

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function videoMimeType(url) {
  if (/\.webm$/i.test(url)) return 'video/webm';
  if (/\.ogg$/i.test(url)) return 'video/ogg';
  return 'video/mp4';
}

function vimeoEmbedSrc(videoId) {
  const id = String(videoId).replace(/[^\d]/g, '');
  if (!id) return '';
  const q = new URLSearchParams({
    badge: '0',
    autopause: '0',
    player_id: '0',
    app_id: '58479',
    autoplay: '1',
  });
  return `https://player.vimeo.com/video/${id}?${q}`;
}

/** Top hero: optional Vimeo id, else `video` URL, else `image`, else placeholder (see experience.json). */
function renderHeroMedia(entry) {
  const ariaLabel = escapeAttr(`${entry.role} — project media`);

  if (entry.vimeo) {
    const src = vimeoEmbedSrc(entry.vimeo);
    if (src) {
      const title = escapeAttr(entry.vimeoTitle || 'Vimeo video');
      return `
      <div class="inspector__hero-frame inspector__hero-frame--embed">
        <iframe
          class="inspector__embed"
          src="${escapeAttr(src)}"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          title="${title}"
          aria-label="${ariaLabel}"
        ></iframe>
      </div>
    `;
    }
  }

  if (entry.video) {
    const poster = entry.videoPoster
      ? ` poster="${escapeAttr(entry.videoPoster)}"`
      : '';
    const type = videoMimeType(entry.video);
    return `
      <div class="inspector__hero-frame">
        <video
          class="inspector__video"
          controls
          playsinline
          preload="metadata"${poster}
          aria-label="${ariaLabel}"
        >
          <source src="${escapeAttr(entry.video)}" type="${type}" />
        </video>
      </div>
    `;
  }

  if (entry.image) {
    return `
      <div class="inspector__hero-frame">
        <figure class="inspector__figure inspector__figure--hero">
          <img
            class="inspector__image inspector__image--hero"
            src="${escapeAttr(entry.image)}"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    `;
  }

  return `
    <div class="inspector__hero-frame inspector__hero-frame--placeholder" aria-label="Video or project media (to be added)">
      <div class="inspector__video-placeholder"></div>
    </div>
  `;
}

function emitSelectionChange(entry) {
  window.dispatchEvent(
    new CustomEvent('memory:select', { detail: entry }),
  );
}

/** Pixels for one wheel tick when deltaMode is DOM_DELTA_LINE. */
const WHEEL_LINE_PX = 16;

function wheelDeltaYpx(e) {
  const y = e.deltaY;
  switch (e.deltaMode) {
    case 1:
      return y * WHEEL_LINE_PX;
    case 2: {
      const h = e.currentTarget?.clientHeight ?? 0;
      return y * (h || window.innerHeight);
    }
    default:
      return y;
  }
}

/**
 * Wheel anywhere on the inspector (hero, meta, title, etc.) scrolls the body column,
 * same as wheeling directly over `.inspector__body-scroll`. Iframes receive their own
 * wheel events and are unaffected.
 */
function initInspectorScrollProxy() {
  if (!inspectorEl) return;

  inspectorEl.addEventListener(
    'wheel',
    (e) => {
      const scrollEl = inspectorEl.querySelector('.inspector__body-scroll');
      if (!scrollEl) return;

      const t = e.target;
      if (t instanceof Node && scrollEl.contains(t)) return;

      const max = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (max <= 0) return;

      e.preventDefault();
      const dy = wheelDeltaYpx(e);
      scrollEl.scrollTop = Math.min(
        max,
        Math.max(0, scrollEl.scrollTop + dy),
      );
    },
    { passive: false },
  );
}

function timelineProductionLine(entry) {
  const p = entry.production?.trim();
  return p
    ? `<span class="timeline-node__production">${escapeHtml(p)}</span>`
    : '';
}

function renderTimeline() {
  experience.forEach((entry) => {
    const node = document.createElement('button');
    node.className = 'timeline-node';
    node.setAttribute('role', 'listitem');
    node.setAttribute('aria-selected', 'false');
    node.dataset.id = entry.id;

    node.innerHTML = `
      <span class="timeline-node__period">${escapeHtml(entry.period)}</span>
      <span class="timeline-node__company">${escapeHtml(entry.company)}</span>
      ${timelineProductionLine(entry)}
      <span class="timeline-node__title">${escapeHtml(entry.role)}</span>
    `;

    node.addEventListener('click', () => selectEntry(entry.id));
    timelineEl.appendChild(node);
  });

  restoreFromHash();
  window.addEventListener('hashchange', restoreFromHash);
}

function selectEntry(id) {
  if (id === activeId) return;
  activeId = id;

  timelineEl.querySelectorAll('.timeline-node').forEach((n) => {
    n.setAttribute('aria-selected', n.dataset.id === id ? 'true' : 'false');
  });

  const entry = experience.find((e) => e.id === id);
  if (!entry) return;

  history.replaceState(null, '', `#${entry.id}`);
  renderInspector(entry);
  emitSelectionChange(entry);
}

function inspectorProductionBlock(entry) {
  const p = entry.production?.trim();
  return p
    ? `<p class="inspector__production">${escapeHtml(p)}</p>`
    : '';
}

const INSPECTOR_THUMB_PLACEHOLDER_COUNT = 5;

function renderImagePlaceholders() {
  const cells = Array.from({ length: INSPECTOR_THUMB_PLACEHOLDER_COUNT }, () => '<span class="inspector__thumb-placeholder"></span>').join('');
  return `
    <div class="inspector__thumb-row" aria-hidden="true">
      ${cells}
    </div>
  `;
}

function renderInspector(entry) {
  const tagsBlock = entry.tags?.length
    ? `<div class="inspector__tags">
        ${entry.tags.map((t) => `<span class="inspector__tag">${escapeHtml(t)}</span>`).join('')}
       </div>`
    : '';

  inspectorEl.innerHTML = `
    <div class="inspector__content">
      <div class="inspector__hero phosphor-bloom--media">
        ${renderHeroMedia(entry)}
      </div>
      <div class="inspector__text-stack phosphor-bloom--full">
        <div class="inspector__meta">
          <p class="inspector__period">${escapeHtml(entry.period)}</p>
          <p class="inspector__company">${escapeHtml(entry.company)}</p>
          ${inspectorProductionBlock(entry)}
          ${entry.location?.trim()
            ? `<p class="inspector__location">${escapeHtml(entry.location.trim())}</p>`
            : ''}
        </div>
        <h2 class="inspector__title">${escapeHtml(entry.role)}</h2>
        <div class="inspector__divider" aria-hidden="true"></div>
        <div class="inspector__body-scroll">
          <p class="inspector__body">${formatBody(entry.body)}</p>
          ${renderImagePlaceholders()}
          ${tagsBlock}
        </div>
      </div>
    </div>
  `;
}

function restoreFromHash() {
  const hash = location.hash.slice(1);
  if (hash && experience.some((e) => e.id === hash)) {
    selectEntry(hash);
  }
}

export function initTimeline() {
  initInspectorScrollProxy();
  renderTimeline();
}
