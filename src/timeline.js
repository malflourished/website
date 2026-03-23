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

/** Top hero: optional `video` URL, else `image`, else placeholder (see experience.json). */
function renderHeroMedia(entry) {
  const ariaLabel = escapeAttr(`${entry.role} — project media`);

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

function renderTimeline() {
  experience.forEach((entry) => {
    const node = document.createElement('button');
    node.className = 'timeline-node';
    node.setAttribute('role', 'listitem');
    node.setAttribute('aria-selected', 'false');
    node.dataset.id = entry.id;

    const studioLine = escapeHtml(entry.studio ?? entry.company);

    node.innerHTML = `
      <span class="timeline-node__period">${escapeHtml(entry.period)}</span>
      <span class="timeline-node__studio">${studioLine}</span>
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

function renderInspector(entry) {
  const studioLine = escapeHtml(entry.studio ?? entry.company);

  inspectorEl.innerHTML = `
    <div class="inspector__content">
      <div class="inspector__hero phosphor-bloom--media">
        ${renderHeroMedia(entry)}
      </div>
      <div class="inspector__text-stack phosphor-bloom--full">
        <div class="inspector__meta">
          <p class="inspector__period">${escapeHtml(entry.period)}</p>
          <p class="inspector__studio">${studioLine}</p>
        </div>
        <h2 class="inspector__title">${escapeHtml(entry.role)}</h2>
        <div class="inspector__divider" aria-hidden="true"></div>
        <div class="inspector__body-scroll">
          <p class="inspector__body">${formatBody(entry.body)}</p>
          ${entry.tags?.length
            ? `<div class="inspector__tags">
                ${entry.tags.map((t) => `<span class="inspector__tag">${escapeHtml(t)}</span>`).join('')}
               </div>`
            : ''}
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
  renderTimeline();
}
