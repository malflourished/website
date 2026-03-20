import memories from './data/memories.json';

const timelineEl = document.getElementById('timeline');
const inspectorEl = document.getElementById('inspector');

let activeId = null;

/**
 * Dispatched when the selected memory changes so other modules
 * (e.g. the Three.js scene) can react without tight coupling.
 */
function emitSelectionChange(memory) {
  window.dispatchEvent(
    new CustomEvent('memory:select', { detail: memory }),
  );
}

function renderTimeline() {
  memories.forEach((mem) => {
    const node = document.createElement('button');
    node.className = 'timeline-node';
    node.setAttribute('role', 'listitem');
    node.setAttribute('aria-selected', 'false');
    node.dataset.id = mem.id;

    node.innerHTML = `
      <span class="timeline-node__year">${mem.year}</span>
      <span class="timeline-node__title">${mem.title}</span>
    `;

    node.addEventListener('click', () => selectMemory(mem.id));
    timelineEl.appendChild(node);
  });

  restoreFromHash();
  window.addEventListener('hashchange', restoreFromHash);
}

function selectMemory(id) {
  if (id === activeId) return;
  activeId = id;

  timelineEl.querySelectorAll('.timeline-node').forEach((n) => {
    n.setAttribute('aria-selected', n.dataset.id === id ? 'true' : 'false');
  });

  const memory = memories.find((m) => m.id === id);
  if (!memory) return;

  history.replaceState(null, '', `#${memory.id}`);
  renderInspector(memory);
  emitSelectionChange(memory);
}

function renderInspector(mem) {
  inspectorEl.innerHTML = `
    <div class="inspector__content">
      <p class="inspector__year">${mem.year}</p>
      <h2 class="inspector__title">${mem.title}</h2>
      <p class="inspector__body">${mem.body}</p>
      ${mem.tags?.length
        ? `<div class="inspector__tags">
            ${mem.tags.map((t) => `<span class="inspector__tag">${t}</span>`).join('')}
           </div>`
        : ''}
    </div>
  `;
}

function restoreFromHash() {
  const hash = location.hash.slice(1);
  if (hash && memories.some((m) => m.id === hash)) {
    selectMemory(hash);
  }
}

export function initTimeline() {
  renderTimeline();
}
