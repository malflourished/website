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

function renderPhotoBlock(entry) {
  if (entry.image) {
    return `
      <figure class="inspector__figure">
        <img
          class="inspector__image"
          src="${escapeAttr(entry.image)}"
          alt=""
          loading="lazy"
          decoding="async"
        />
      </figure>
    `;
  }
  return `
    <figure class="inspector__figure inspector__figure--placeholder" aria-label="Project image (to be added)">
      <div class="inspector__photo-placeholder"></div>
    </figure>
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
      <header class="inspector__header">
        <p class="inspector__period">${escapeHtml(entry.period)}</p>
        <p class="inspector__studio">${studioLine}</p>
        <h2 class="inspector__title">${escapeHtml(entry.role)}</h2>
      </header>
      <div class="inspector__detail">
        <div class="inspector__copy">
          <p class="inspector__body">${formatBody(entry.body)}</p>
        </div>
        <div class="inspector__media">
          ${renderPhotoBlock(entry)}
        </div>
      </div>
      ${entry.tags?.length
        ? `<div class="inspector__tags">
            ${entry.tags.map((t) => `<span class="inspector__tag">${escapeHtml(t)}</span>`).join('')}
           </div>`
        : ''}
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
