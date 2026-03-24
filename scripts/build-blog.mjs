import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const contentDir = path.join(root, 'content/blog');
const outFile = path.join(root, 'src/data/blog-posts.json');

function listMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
}

/** Keep calendar day stable when YAML parses `2026-03-23` as a Date. */
function normalizeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(value).trim();
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return iso ? iso[1] : s;
}

function main() {
  const files = listMarkdownFiles(contentDir);
  if (files.length === 0) {
    console.warn(
      `build-blog: no .md files in ${path.relative(root, contentDir)} — writing empty array`,
    );
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, '[]\n', 'utf8');
    return;
  }

  const posts = [];

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    const slug = path.basename(file, '.md');
    const id = data.id != null ? String(data.id) : slug;
    const title = data.title;
    const date = data.date;

    if (!title || !date) {
      console.warn(`build-blog: skipping ${file} (missing title or date in frontmatter)`);
      continue;
    }

    const bodyHtml = marked.parse((content || '').trim() || '', { async: false });
    posts.push({
      id,
      title: String(title),
      date: normalizeDate(date),
      excerpt: data.excerpt != null ? String(data.excerpt) : '',
      bodyHtml,
    });
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
  console.log(
    `build-blog: wrote ${posts.length} post(s) → ${path.relative(root, outFile)}`,
  );
}

main();
