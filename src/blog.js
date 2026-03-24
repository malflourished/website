import { initGlobalPhosphor } from './globalPhosphor.js';

initGlobalPhosphor();

import './styles/theme.css';
import './styles/layout.css';
import './styles/atmosphere.css';
import './styles/blog.css';

import posts from './data/blog-posts.json';

const root = document.getElementById('blog-app');
if (!root) {
  throw new Error('blog: missing #blog-app');
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function bodyToParagraphs(body) {
  return body
    .trim()
    .split(/\n\n+/)
    .map((p) => `<p>${escapeHtml(p).split('\n').join('<br>')}</p>`)
    .join('');
}

/** Build step writes trusted HTML from repo Markdown; legacy posts may use plain `body`. */
function renderArticleBody(post) {
  if (post.bodyHtml) return post.bodyHtml;
  if (post.body) return bodyToParagraphs(post.body);
  return '';
}

function sortedPosts() {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function renderList() {
  const items = sortedPosts()
    .map(
      (p) => `
      <li class="blog-list__item">
        <a class="blog-list__link" href="blog.html#${escapeHtml(p.id)}">
          <p class="blog-list__meta">${escapeHtml(formatDate(p.date))}</p>
          <h2 class="blog-list__title">${escapeHtml(p.title)}</h2>
          <p class="blog-list__excerpt">${escapeHtml(p.excerpt ?? '')}</p>
        </a>
      </li>
    `,
    )
    .join('');

  root.innerHTML = `<ul class="blog-list">${items}</ul>`;
  document.title = 'Blog — malflourished';
}

function renderPost(id) {
  const post = posts.find((p) => p.id === id);
  if (!post) {
    renderList();
    return;
  }

  root.innerHTML = `
    <div class="blog-toolbar">
      <a class="blog-back" href="blog.html">← All posts</a>
    </div>
    <article class="blog-article" aria-labelledby="blog-article-title">
      <header class="blog-article__header">
        <p class="blog-article__meta">${escapeHtml(formatDate(post.date))}</p>
        <h2 class="blog-article__title" id="blog-article-title">${escapeHtml(post.title)}</h2>
      </header>
      <div class="blog-article__body blog-article__body--md">${renderArticleBody(post)}</div>
    </article>
  `;
  document.title = `${post.title} — Blog — malflourished`;
}

function route() {
  const id = location.hash.replace(/^#/, '').trim();
  if (id && posts.some((p) => p.id === id)) {
    renderPost(id);
  } else {
    renderList();
  }
}

route();
window.addEventListener('hashchange', route);
