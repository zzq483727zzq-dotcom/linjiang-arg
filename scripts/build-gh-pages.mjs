/**
 * Build a static tree for GitHub project Pages (served under /linjiang-arg/).
 * Copies the site into _site/ and rewrites root-absolute paths.
 *
 * Usage: node scripts/build-gh-pages.mjs
 * Env:   PAGES_BASE=/linjiang-arg  (default)
 */
import {
  cpSync,
  mkdirSync,
  rmSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, '_site');
const BASE = (process.env.PAGES_BASE || '/linjiang-arg').replace(/\/$/, '') || '';
// strip leading slash for lookahead: linjiang-arg
const BASE_SEG = BASE.replace(/^\//, '');

const TOP_EXCLUDE = new Set([
  '.git',
  'node_modules',
  '.worktrees',
  '.superpowers',
  '_site',
  'dist',
  'build',
  'tests',
  'scripts',
  'docs',
  '.github',
  '.env',
]);

const DIR_EXCLUDE = new Set([
  '.git',
  'node_modules',
  '.worktrees',
  '.superpowers',
  '_site',
  'dist',
  'build',
]);

const REWRITABLE = new Set(['.html', '.js', '.mjs', '.css', '.txt', '.json', '.md', '.svg']);

function shouldSkipFile(name) {
  if (name === '.env' || (name.startsWith('.env.') && name !== '.env.example')) return true;
  if (name === 'auth.json' || name.endsWith('.key')) return true;
  return false;
}

function copyTree(src, dest, isRoot = false) {
  mkdirSync(dest, { recursive: true });
  for (const ent of readdirSync(src, { withFileTypes: true })) {
    const name = ent.name;
    if (isRoot && TOP_EXCLUDE.has(name)) continue;
    if (!isRoot && DIR_EXCLUDE.has(name)) continue;
    if (shouldSkipFile(name)) continue;

    const s = join(src, name);
    const d = join(dest, name);
    if (ent.isDirectory()) {
      copyTree(s, d, false);
    } else {
      cpSync(s, d);
    }
  }
}

function rewriteText(text, base) {
  let t = text;
  const baseRe = BASE_SEG ? BASE_SEG.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '(?!)';
  // href="/x" src="/x" action="/x" — not // and not already base
  for (const attr of ['href', 'src', 'action']) {
    t = t.replace(
      new RegExp(`(${attr}=["'])/(?!/|${baseRe})`, 'g'),
      `$1${base}/`,
    );
  }
  // ES module: from '/assets/...'  import('/...')
  t = t.replace(new RegExp(`(from\\s+["'])/(?!/|${baseRe})`, 'g'), `$1${base}/`);
  t = t.replace(new RegExp(`(import\\s*\\(\\s*["'])/(?!/|${baseRe})`, 'g'), `$1${base}/`);
  // location.href = '/...' ; location.assign('/...'); location.replace('/...')
  t = t.replace(
    new RegExp(`(location\\.(?:href|assign)\\s*=\\s*["'])/(?!/|${baseRe})`, 'g'),
    `$1${base}/`,
  );
  t = t.replace(
    new RegExp(`(location\\.replace\\(\\s*["'])/(?!/|${baseRe})`, 'g'),
    `$1${base}/`,
  );
  // object literals: to: '/city/'  href: '/city/...'
  t = t.replace(new RegExp(`((?:to|href)\\s*:\\s*["'])/(?!/|${baseRe})`, 'g'), `$1${base}/`);
  // window.open('/...')
  t = t.replace(new RegExp(`(window\\.open\\(\\s*["'])/(?!/|${baseRe})`, 'g'), `$1${base}/`);
  // css url(/...
  t = t.replace(new RegExp(`url\\(\\s*(['"]?)/(?!/|${baseRe})`, 'g'), `url($1${base}/`);
  // robots.txt Disallow: /path
  t = t.replace(new RegExp(`(Disallow:\\s*)/(?!/|${baseRe})`, 'g'), `$1${base}/`);
  return t;
}

function walkRewrite(dir) {
  let changed = 0;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      changed += walkRewrite(p);
      continue;
    }
    const ext = extname(ent.name).toLowerCase();
    if (!REWRITABLE.has(ext)) continue;
    const orig = readFileSync(p, 'utf8');
    const next = rewriteText(orig, BASE);
    if (next !== orig) {
      writeFileSync(p, next, 'utf8');
      changed += 1;
      console.log('rewrite', relative(OUT, p).replace(/\\/g, '/'));
    }
  }
  return changed;
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
copyTree(ROOT, OUT, true);
// GitHub Pages: skip Jekyll processing
writeFileSync(join(OUT, '.nojekyll'), '', 'utf8');
const n = walkRewrite(OUT);
console.log(`\nBuilt ${OUT}`);
console.log(`Base path: ${BASE || '(root)'}`);
console.log(`Files rewritten: ${n}`);
