# 《静园/Serene》ARG 解谜游戏 · 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一款"细思极恐"的纯静态多页 ARG 恐怖解谜网页《静园/Serene》,并部署到 GitHub Pages 可对外游玩。

**Architecture:** 多个互相链接的伪真实网站 + 共享 CSS/JS + 浏览器 `localStorage` 状态。核心引擎模块(state / puzzle / corruption)用 Node 内置 `node:test` 跑 TDD。叙事内容(博客/论坛/聊天/朋友圈)用 JSON 数据文件驱动渲染,文案在页面里写死。资产通过 Node 脚本调 OpenAI 兼容 `gpt-image` API 生成。

**Tech Stack:** 原生 HTML + CSS + JavaScript (ES Modules)。Node 20+ 仅用于测试 (`node --test`) 与图片生成脚本。零前端框架。部署: GitHub Pages。

---

## 文件总览(在写代码前先记住结构)

```
arg解谜游戏/
├── index.html                  # 静园官网首页(主入口,治愈表皮)
├── blog/                       # 林的博客(Lin's Quiet Corner)
│   ├── index.html
│   ├── post-hope.html
│   ├── post-trapped.html
│   └── post-final.html
├── forum/                      # 假论坛"静园劝退小组"
│   └── index.html
├── chat/                       # 假微信聊天导出
│   └── wechat-thread.html
├── social/                     # 假朋友圈 / 微博动态
│   └── timeline.html
├── admin/                      # 员工后台(需密码)
│   └── index.html
├── endings/                    # 三个结局页
│   ├── logout.html             # 较好结局
│   ├── accept.html             # 坏结局
│   └── hidden.html             # 硬核隐藏结局
├── 404.html                    # 系统层 + ARG 彩蛋
├── robots.txt                  # 隐藏线索(列"被禁"路径)
├── assets/
│   ├── css/
│   │   ├── base.css            # 共享基底(排版/布局)
│   │   ├── theme-serene.css    # 静园治愈主题
│   │   ├── theme-blog.css      # 博客主题
│   │   ├── theme-forum.css     # 论坛主题
│   │   ├── theme-wechat.css    # 微信气泡
│   │   ├── theme-social.css    # 朋友圈卡片
│   │   ├── theme-admin.css     # 后台冷峻风
│   │   └── corruption.css      # 崩坏效果(档1/2/3)
│   ├── js/
│   │   ├── state.js            # localStorage 适配 + 状态 API
│   │   ├── corruption.js       # 腐化度驱动 CSS/文案变化
│   │   ├── puzzle.js           # 谜题通用校验
│   │   ├── nav.js              # 进度门禁 + 解锁导航
│   │   └── pages/              # 各页面的初始化逻辑(可选)
│   └── img/                    # gpt-image 生成的图片
├── data/                       # 叙事内容(JSON + 文案)
│   ├── progress.json           # 8 站点+3 结局的进度节点定义(状态机)
│   ├── blog-posts.json         # 博客 3 篇文章正文
│   ├── forum-thread.json       # 论坛主帖+评论(含答案线索)
│   ├── wechat-thread.json      # 微信聊天对话
│   ├── social-posts.json       # 朋友圈动态
│   └── admin-redacted.json     # 后台展示的"涂黑数据"
├── scripts/
│   ├── gen-image.mjs           # 调 OpenAI 兼容图像生成 API
│   └── serve.mjs               # 本地静态服务器(http://localhost:5173)
├── tests/                      # Node 内置测试
│   ├── state.test.mjs
│   ├── corruption.test.mjs
│   └── puzzle.test.mjs
├── .env                        # OPENAI_API_KEY(已 gitignore)
├── .gitignore                  # 已存在,需追加 node_modules/、assets/img/cache/ 等
├── package.json
└── docs/superpowers/specs/2026-07-20-serene-arg-design.md
```

---

## Task 1: 项目脚手架(包管理与测试基础设施)

**Files:**
- Create: `package.json`
- Create: `tests/_smoke.test.mjs`
- Create: `.gitignore` (追加)
- Create: `.env.example`
- Modify: 文档 README

- [ ] **Step 1: 创建 `package.json`(name、type=module、test 脚本)**

```json
{
  "name": "serene-arg",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "test": "node --test tests/",
    "serve": "node scripts/serve.mjs",
    "image": "node scripts/gen-image.mjs"
  }
}
```

- [ ] **Step 2: 创建 `.env.example`（不含真 key）**

```
OPENAI_API_KEY=sk-replace-me
OPENAI_BASE_URL=https://api.x5m5x.com
IMAGE_MODEL=gpt-image-1
```

- [ ] **Step 3: 追加 `.gitignore`(已有)需要的内容**

确认 `.gitignore` 包含:
```
node_modules/
.env
.superpowers/
.DS_Store
```
若缺则用 Edit 追加。

- [ ] **Step 4: 创建测试冒烟用例 `tests/_smoke.test.mjs`**

```js
import { test } from 'node:test';
import { strict as assert } from 'node:assert';

test('node test runner is alive', () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 5: 运行测试,确认通过**

Run: `cd "/d/VScode项目文件夹/arg解谜游戏" && npm test`
Expected: 输出 `tests 1 / pass 1 / fail 0`

- [ ] **Step 6: 提交**

```bash
git add package.json .gitignore .env.example tests/_smoke.test.mjs
git commit -m "chore: 项目脚手架 + Node 测试冒烟"
```

---

## Task 2: 本地静态服务器

**Files:**
- Create: `scripts/serve.mjs`

- [ ] **Step 1: 写 `scripts/serve.mjs`(基于 Node 内置 http/fs,支持自定义端口)**

```js
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const PORT = Number(process.env.PORT) || 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8'
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const safe = normalize(urlPath).replace(/^([\\/])+/, '/');
    const filePath = join(ROOT, safe);
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
    const s = await stat(filePath).catch(() => null);
    if (!s || !s.isFile()) { res.writeHead(404); return res.end('not found'); }
    const data = await readFile(filePath);
    res.writeHead(200, { 'content-type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(500); res.end('server error: ' + e.message);
  }
});

server.listen(PORT, () => console.log(`server on http://localhost:${PORT}`));
```

- [ ] **Step 2: 临时创建 `index.html`(最小占位)启动测试**

创建 `index.html`:
```html
<!doctype html><meta charset="utf-8"><title>Serene</title><h1>OK</h1>
```

- [ ] **Step 3: 启动并 curl 验证**

Run:
```bash
node scripts/serve.mjs &
sleep 1
curl -s http://localhost:5173/ | head
kill %1
```
Expected: 看到 `<h1>OK</h1>`

- [ ] **Step 4: 提交**

```bash
git add scripts/serve.mjs index.html
git commit -m "feat: 本地静态服务器"
```

(下一步起 我们将删除占位 index.html,实际首页在 Task 6 实现)

---

## Task 3: 状态机引擎 `state.js`(TDD)

**Files:**
- Create: `tests/state.test.mjs`
- Create: `assets/js/state.js`

- [ ] **Step 1: 写失败测试 `tests/state.test.mjs`**

```js
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createState } from '../assets/js/state.js';

test('memory adapter: 初始解锁站点默认 = 静园', () => {
  const s = createState({ adapter: memoryAdapter() });
  assert.deepEqual(s.unlocked(), ['serene-home']);
});

test('unlock 新站点 → 出现在已解锁中且不重复', () => {
  const a = memoryAdapter();
  const s = createState({ adapter: a });
  s.unlock('blog');
  s.unlock('forum');
  s.unlock('blog'); // 重复
  assert.deepEqual(s.unlocked().sort(), ['blog', 'forum', 'serene-home']);
});

test('corruption 在 [0, 3] 范围内 clamp', () => {
  const a = memoryAdapter();
  const s = createState({ adapter: a });
  s.setCorruption(5);
  assert.equal(s.corruption(), 3);
  s.setCorruption(-2);
  assert.equal(s.corruption(), 0);
});

test('setEnding 记录结局(只能有一个)', () => {
  const a = memoryAdapter();
  const s = createState({ adapter: a });
  s.setEnding('accept');
  assert.equal(s.ending(), 'accept');
  s.setEnding('logout'); // 覆盖
  assert.equal(s.ending(), 'logout');
});

test('reset 清空全部', () => {
  const a = memoryAdapter();
  const s = createState({ adapter: a });
  s.unlock('blog'); s.setCorruption(2); s.setEnding('accept');
  s.reset();
  assert.deepEqual(s.unlocked(), ['serene-home']);
  assert.equal(s.corruption(), 0);
  assert.equal(s.ending(), null);
});

function memoryAdapter() {
  const m = new Map();
  return {
    get(k) { return m.has(k) ? m.get(k) : null; },
    set(k, v) { m.set(k, String(v)); },
    remove(k) { m.delete(k); }
  };
}
```

注意:`state.js` 需导出工厂函数 `createState({ adapter })` 而非顶层全局变量,这样 Node 中可注入内存 adapter,浏览器中可注入 localStorage adapter。

- [ ] **Step 2: 运行测试,确认全部失败**

Run: `npm test -- tests/state.test.mjs`
Expected: `Cannot find module '../assets/js/state.js'`(或类似 module not found)

- [ ] **Step 3: 实现 `assets/js/state.js`**

```js
// state.js - 浏览器/Node 通用状态引擎
// localStorage 为默认 adapter,Node 测试中注入内存 adapter

const DEFAULTS = {
  unlocked: ['serene-home'],
  corruption: 0,
  ending: null,
  visits: {} // { 'blog': 1, ... }
};

export function createLocalStorageAdapter() {
  if (typeof localStorage === 'undefined') throw new Error('localStorage not available');
  return {
    get(k) { return localStorage.getItem(k); },
    set(k, v) { localStorage.setItem(k, String(v)); },
    remove(k) { localStorage.removeItem(k); }
  };
}

export function createState({ adapter } = {}) {
  if (!adapter) adapter = createLocalStorageAdapter();
  const KEY_PREFIX = 'serene.';
  const k = {
    unlocked: KEY_PREFIX + 'unlocked',
    corruption: KEY_PREFIX + 'corruption',
    ending: KEY_PREFIX + 'ending',
    visits: KEY_PREFIX + 'visits'
  };

  function readJSON(key, fallback) {
    try {
      const raw = adapter.get(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch { return fallback; }
  }
  function writeJSON(key, val) { adapter.set(key, JSON.stringify(val)); }

  // 首次访问自动初始化
  if (adapter.get(k.unlocked) == null) writeJSON(k.unlocked, DEFAULTS.unlocked);
  if (adapter.get(k.corruption) == null) adapter.set(k.corruption, String(DEFAULTS.corruption));
  if (adapter.get(k.ending) == null) adapter.set(k.ending, DEFAULTS.ending === null ? '' : DEFAULTS.ending);
  if (adapter.get(k.visits) == null) writeJSON(k.visits, DEFAULTS.visits);

  return {
    unlocked() { return readJSON(k.unlocked, DEFAULTS.unlocked); },
    unlock(siteId) {
      const list = readJSON(k.unlocked, DEFAULTS.unlocked);
      if (!list.includes(siteId)) { list.push(siteId); writeJSON(k.unlocked, list); }
    },
    has(siteId) { return readJSON(k.unlocked, DEFAULTS.unlocked).includes(siteId); },
    corruption() {
      const v = Number(adapter.get(k.corruption));
      return Number.isFinite(v) ? Math.min(3, Math.max(0, v)) : 0;
    },
    setCorruption(n) {
      const v = Math.min(3, Math.max(0, Math.round(Number(n) || 0)));
      adapter.set(k.corruption, String(v));
    },
    bumpCorruption(delta = 1) {
      const v = (Number(adapter.get(k.corruption)) || 0) + delta;
      this.setCorruption(v);
    },
    ending() {
      const v = adapter.get(k.ending);
      return v === '' || v == null ? null : v;
    },
    setEnding(name) { adapter.set(k.ending, name); },
    recordVisit(siteId) {
      const map = readJSON(k.visits, {});
      map[siteId] = (map[siteId] || 0) + 1;
      writeJSON(k.visits, map);
    },
    visits() { return readJSON(k.visits, {}); },
    reset() {
      adapter.remove(k.unlocked);
      adapter.remove(k.corruption);
      adapter.remove(k.ending);
      adapter.remove(k.visits);
    }
  };
}
```

- [ ] **Step 4: 运行测试,确认全部 PASS**

Run: `npm test -- tests/state.test.mjs`
Expected: 5 个 test 全过

- [ ] **Step 5: 提交**

```bash
git add assets/js/state.js tests/state.test.mjs
git commit -m "feat: 通用状态机引擎(state)"
```

---

## Task 4: 腐化系统 `corruption.js`(TDD)

**Files:**
- Create: `tests/corruption.test.mjs`
- Create: `assets/js/corruption.js`
- Create: `assets/css/corruption.css`

- [ ] **Step 1: 写失败测试 `tests/corruption.test.mjs`**

```js
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { getCorruptionClass, getCorruptionWhispers, applyCorruption } from '../assets/js/corruption.js';

test('档位 → CSS class 映射', () => {
  assert.equal(getCorruptionClass(0), '');
  assert.equal(getCorruptionClass(1), 'corruption-1');
  assert.equal(getCorruptionClass(2), 'corruption-2');
  assert.equal(getCorruptionClass(3), 'corruption-3');
});

test('档 1 whispers 包含"47"相关文案', () => {
  const w = getCorruptionWhispers(1, ['serene-home']);
  assert.ok(w.some(s => s.includes('47')));
});

test('档 3 whispers 直接对玩家说话', () => {
  const w = getCorruptionWhispers(3, ['serene-home']);
  assert.ok(w.some(s => s.includes('你') && s.includes('看')));
});

test('applyCorruption 给 body 加对应 class(用 DOM stub)', () => {
  const calls = [];
  globalThis.document = {
    body: { classList: { add: c => calls.push(c), remove: () => {} } }
  };
  applyCorruption(2);
  assert.deepEqual(calls, ['corruption-2']);
  delete globalThis.document;
});
```

- [ ] **Step 2: 运行测试,确认失败**

Run: `npm test -- tests/corruption.test.mjs`
Expected: module not found

- [ ] **Step 3: 实现 `assets/js/corruption.js`**

```js
// corruption.js - 腐化度驱动 CSS/文案变化

export function getCorruptionClass(level) {
  const lv = Math.min(3, Math.max(0, Number(level) || 0));
  return lv === 0 ? '' : `corruption-${lv}`;
}

const WHISPERS = {
  1: [
    (ctx) => '你好像已经来过 47 次了。',
    (ctx) => '这次我们做得更好一些。',
    (ctx) => '还记得第一次吗？我们记得。'
  ],
  2: [
    (ctx) => '你的位置和光线已记录。',
    (ctx) => '情绪样本采集中… 匹配成功。',
    (ctx) => '别关掉。这一次,别关掉。'
  ],
  3: [
    (ctx) => '你还在看吗？',
    (ctx) => '第 48 张脸——是你的。',
    (ctx) => '重生进度已锁定。你准备好了吗？'
  ]
};

export function getCorruptionWhispers(level, unlockedSites = []) {
  const pool = WHISPERS[level] || [];
  const ctx = { unlocked: unlockedSites };
  return pool.map(fn => fn(ctx));
}

export function applyCorruption(level) {
  if (typeof document === 'undefined') return;
  const cls = getCorruptionClass(level);
  const b = document.body;
  ['', 'corruption-1', 'corruption-2', 'corruption-3'].forEach(c => {
    if (c) b.classList.remove(c);
  });
  if (cls) b.classList.add(cls);
}
```

- [ ] **Step 4: 创建 `assets/css/corruption.css`(三档崩坏样式)**

```css
/* 档 1 — 温柔渗血 */
body.corruption-1 .whisper { opacity: .85; font-style: italic; color: #b4a; }
body.corruption-1 .count-badge { animation: blink 2.4s infinite; }
@keyframes blink { 50% { opacity: .35; } }
body.corruption-1 .pill { box-shadow: 0 0 0 1px rgba(124,156,240,.3) inset; }

/* 档 2 — 界面撕裂 */
body.corruption-2 { background: #0a0b12 !important; color: #dfe6ff !important; }
body.corruption-2 .glitch {
  position: relative; display: inline-block;
}
body.corruption-2 .glitch::before, body.corruption-2 .glitch::after {
  content: attr(data-text); position: absolute; left: 0; top: 0; width: 100%;
}
body.corruption-2 .glitch::before { color: #ff2d55; transform: translate(2px, 0); mix-blend-mode: screen; }
body.corruption-2 .glitch::after  { color: #00e5ff; transform: translate(-2px, 0); mix-blend-mode: screen; }
body.corruption-2 .scanlines {
  pointer-events: none; position: fixed; inset: 0; z-index: 9999;
  background: repeating-linear-gradient(180deg, rgba(255,255,255,.04) 0 1px, transparent 1px 3px);
  animation: scan 8s linear infinite;
}
@keyframes scan { from { background-position-y: 0; } to { background-position-y: 100vh; } }

/* 档 3 — 生理恐怖 */
body.corruption-3 { background: radial-gradient(circle at 50% 40%, #1a0d12, #000) !important; color: #e8d !important; }
body.corruption-3 .eye {
  width: 90px; height: 90px; border-radius: 50%; margin: 24px auto;
  background: radial-gradient(circle at 50% 50%, #fff 0 8%, #7a0e1e 9% 42%, #160406 43%);
  box-shadow: 0 0 40px #5a0813; animation: stare 3s infinite;
}
@keyframes stare {
  0%, 100% { transform: translateX(0) scale(1); }
  50%      { transform: translateX(6px) scale(1.04); }
}
body.corruption-3 .stare-text {
  text-align: center; color: #ff5c72; text-shadow: 0 0 12px #ff2d55;
  font-family: Georgia, serif; font-size: 18px;
}
```

- [ ] **Step 5: 运行测试,确认 PASS**

Run: `npm test`
Expected: 9 个 test 全过(state 5 + corruption 4)

- [ ] **Step 6: 提交**

```bash
git add assets/js/corruption.js assets/css/corruption.css tests/corruption.test.mjs
git commit -m "feat: 腐化度引擎 + 三档崩坏 CSS"
```

---

## Task 5: 谜题校验器 `puzzle.js`(TDD) + 门禁密码(后台)

**Files:**
- Create: `tests/puzzle.test.mjs`
- Create: `assets/js/puzzle.js`
- Create: `data/progress.json`

- [ ] **Step 1: 写失败测试 `tests/puzzle.test.mjs`**

```js
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { checkPuzzle, PUZZLES } from '../assets/js/puzzle.js';

test('每个谜题都有 id、answer、hint、check', () => {
  for (const id of Object.keys(PUZZLES)) {
    const p = PUZZLES[id];
    assert.ok(typeof p.answer === 'string' && p.answer.length > 0, `answer for ${id}`);
    assert.ok(typeof p.hint === 'string', `hint for ${id}`);
    assert.equal(typeof p.check, 'function', `check fn for ${id}`);
  }
});

test('admin password 真值 "GOOD" 通过', () => {
  // 真值 "GOOD",在博客/论坛/聊天中以三种伪装形式出现:凯撒+2=IQGG / 反转=DOOG / 直书=GOOD
  const r = checkPuzzle('admin-password', 'GOOD');
  assert.equal(r.ok, true);
});

test('大小写不敏感 + trim', () => {
  const r = checkPuzzle('admin-password', '  good ');
  assert.equal(r.ok, true);
});

test('错误答案 fail + 给出 hint', () => {
  const r = checkPuzzle('admin-password', 'wrong');
  assert.equal(r.ok, false);
  assert.ok(typeof r.hint === 'string' && r.hint.length > 0);
});

test('未知 id 抛错', () => {
  assert.throws(() => checkPuzzle('nope', 'x'));
});
```

- [ ] **Step 2: 运行,确认失败**

Run: `npm test -- tests/puzzle.test.mjs`
Expected: module not found

- [ ] **Step 3: 实现 `assets/js/puzzle.js`**

```js
// puzzle.js - 谜题答案校验器

// 仅后台密码一项(其他谜题的"答案"都是解开新站点,见 nav.js)
// 真值 "GOOD",在博客最后一篇、论坛某楼、聊天客服名"小 GOOD" 三处被分别用
//   凯撒+2 (IQGG) / 反转 (DOOG) / 直书 (GOOD) 的方式遮蔽,玩家集合三处即可解出
const ADMIN_ANSWER = 'GOOD';

export const PUZZLES = {
  'admin-password': {
    prompt: '你能从这些痕迹中推测出我们的内部代号吗？',
    hint: '三个地方提到了它,只是用了不同的伪装。拼起来,心里说一遍。',
    answer: ADMIN_ANSWER,
    check(input) {
      return String(input || '').trim().toUpperCase() === ADMIN_ANSWER;
    }
  }
};

export function checkPuzzle(id, input) {
  const p = PUZZLES[id];
  if (!p) throw new Error(`unknown puzzle: ${id}`);
  return { ok: p.check(input), hint: p.hint };
}
```

- [ ] **Step 4: 创建 `data/progress.json`**

```json
{
  "campaign": [
    { "id": "serene-home",   "label": "静园官网",   "unlocks_on": "start" },
    { "id": "blog",          "label": "林的博客",   "unlocks_on": "first_page" },
    { "id": "forum",         "label": "劝退小组",   "unlocks_on": "blog_visited" },
    { "id": "wechat",        "label": "聊天记录",   "unlocks_on": "forum_replied" },
    { "id": "social",        "label": "朋友圈动态", "unlocks_on": "wechat_visited" },
    { "id": "admin",         "label": "员工后台",   "unlocks_on": "admin_password_ok" },
    { "id": "endings",       "label": "结局",       "unlocks_on": "admin_visited" }
  ],
  "corruption_thresholds": [
    { "level": 1, "after": "blog_visited",       "label": "渗血" },
    { "level": 2, "after": "admin_visited",      "label": "撕裂" },
    { "level": 3, "after": "hidden_unlocked",   "label": "凝视" }
  ]
}
```

- [ ] **Step 5: 运行全部测试**

Run: `npm test`
Expected: 全过(state 5 + corruption 4 + puzzle 5 = 14)

- [ ] **Step 6: 提交**

```bash
git add assets/js/puzzle.js data/progress.json tests/puzzle.test.mjs
git commit -m "feat: 谜题校验器 + 进度数据"
```

---

## Task 6: 共有基底 CSS + 导航脚本 `nav.js`

**Files:**
- Create: `assets/css/base.css`
- Create: `assets/js/nav.js`
- Modify: 各页面 <head>(后续 Task 引入)

- [ ] **Step 1: 实现 `assets/css/base.css`(最小基底)**

```css
:root {
  --bg: #fff; --fg: #1c1c20; --muted: #777;
  --link: #2a5bd7; --radius: 10px; --maxw: 880px;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, "PingFang SC", system-ui, sans-serif; line-height: 1.6; }
a { color: var(--link); text-decoration: none; }
a:hover { text-decoration: underline; }
.wrap { max-width: var(--maxw); margin: 0 auto; padding: 24px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
```

- [ ] **Step 2: 实现 `assets/js/nav.js`**

```js
// nav.js - 站点门禁与解锁
import { createState, createLocalStorageAdapter } from './state.js';
import { checkPuzzle } from './puzzle.js';

export function getState() {
  // 浏览器单例
  if (typeof window !== 'undefined' && !window.__serene_state) {
    window.__serene_state = createState({ adapter: createLocalStorageAdapter() });
  }
  return window.__serene_state;
}

// 各页面在初始化时调用,解锁下游站点
export function unlock(siteId) { getState().unlock(siteId); }
export function corruption() { return getState().corruption(); }
export function bumpCorruption(d = 1) { getState().bumpCorruption(d); }
export function tryAdminPassword(input) { return checkPuzzle('admin-password', input); }

// 站点的解锁条件(简化的内置规则,远期可改成读 progress.json)
export function tryVisit(siteId) {
  const s = getState();
  s.recordVisit(siteId);
  // 简单规则:进入 blog → corruption 渐增 + 解锁下一站
  if (siteId === 'blog')   { s.unlock('forum'); bumpCorruption(1); }
  if (siteId === 'forum')  { s.unlock('wechat'); }
  if (siteId === 'wechat') { s.unlock('social'); }
  if (siteId === 'admin')  { s.unlock('endings'); bumpCorruption(1); }
  if (siteId === 'endings') { /* no-op */ }
}

// 主页初始化时挂的入口
export function bootPage(siteId) {
  const s = getState();
  tryVisit(siteId);
  // 渲染腐化度
  import('./corruption.js').then(mod => {
    mod.applyCorruption(s.corruption());
  });
}
```

- [ ] **Step 3: 验证不破坏测试**

Run: `npm test`
Expected: 14 个 test 全过(state.js 现在被 nav.js 间接依赖,但 nav.js 在 Node 中不会执行到,故无影响)

- [ ] **Step 4: 提交**

```bash
git add assets/css/base.css assets/js/nav.js
git commit -m "feat: 共用基底 CSS + 导航门禁脚本"
```

---

## Task 7: 图片生成脚本 `scripts/gen-image.mjs`

**Files:**
- Create: `scripts/gen-image.mjs`
- Create: `.env`(本地,gitignored)
- Modify: `.gitignore`

- [ ] **Step 1: 创建 `.env`(本地,gitignore 保护)**

提醒用户: 这一步写入 `.env`,绝不会提交。

```
OPENAI_API_KEY=sk-a6465c591452f7fc3a9725c2ea80649d39fa8d6c987e80ea4f99fd865f86fea6
OPENAI_BASE_URL=https://api.x5m5x.com
IMAGE_MODEL=gpt-image-1
```

- [ ] **Step 2: 实现 `scripts/gen-image.mjs`(接 stdin JSON,调 API 写文件)**

```js
#!/usr/bin/env node
// gen-image.mjs — OpenAI 兼容图像生成
// 用法: echo '{"prompt":"...","name":"logo","size":"1024x1024"}' | node scripts/gen-image.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { config } from 'dotenv'; // 注:此处先不依赖 dotenv,改用手动 readFileSync .env

// 手动解析 .env(避免依赖)
function loadEnv() {
  try {
    const txt = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) process.env[m[1]] ||= m[2];
    }
  } catch {}
}
loadEnv();

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => raw += c);
process.stdin.on('end', async () => {
  const { prompt, name, size = '1024x1024', n = 1 } = JSON.parse(raw.trim());
  const url = (process.env.OPENAI_BASE_URL || 'https://api.openai.com') + '/v1/images/generations';
  const body = { model: process.env.IMAGE_MODEL || 'gpt-image-1', prompt, size, n };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) { console.error('API error', r.status, await r.text()); process.exit(1); }
  const j = await r.json();
  const dir = resolve(process.cwd(), 'assets/img');
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < (j.data || []).length; i++) {
    const item = j.data[i];
    if (item.b64_json) {
      const buf = Buffer.from(item.b64_json, 'base64');
      const out = join(dir, `${name}${i > 0 ? '-' + i : ''}.png`);
      writeFileSync(out, buf);
      console.log('wrote', out, buf.length, 'bytes');
    } else if (item.url) {
      console.log('remote url:', item.url, '(download manually)');
    }
  }
});
```

- [ ] **Step 3: 干跑一次(用最小请求,确认脚本可用)**

Run:
```bash
echo '{"prompt":"a flat rounded square logo, soft pastel, letter S","name":"serene-logo-test","size":"512x512","n":1}' | node scripts/gen-image.mjs
ls assets/img/
rm assets/img/serene-logo-test*.png  # 清理测试输出
```
Expected: console 输出 `wrote .../serene-logo-test.png`,文件存在

- [ ] **Step 4: 提交脚本**(图片测试产物不提交)

```bash
git add scripts/gen-image.mjs
echo "assets/img/" >> .gitignore      # 大体积二进制不入库,避免膨胀
git add .gitignore
git commit -m "feat: 图片生成脚本(OpenAI 兼容)"
```

---

## Task 8: 生成第一批图片(治愈表皮用)

- [ ] **Step 1: 生成「静园 logo」**

Run:
```bash
echo '{"prompt":"minimal flat logo for a meditation app called Serene, soft pastel gradient (lavender to mint), a single rounded leaf or breath shape, vector clean, square","name":"serene-logo","size":"1024x1024","n":1}' | node scripts/gen-image.mjs
```
确认 `assets/img/serene-logo.png` 存在。

- [ ] **Step 2: 生成「首页 hero 治愈配图」(冥想 / 自然)**

```bash
echo '{"prompt":"serene photo of a person meditating on a hill at golden hour, soft backlight, warm pastel, cinematic but minimal, no text","name":"hero","size":"1024x1024","n":1}' | node scripts/gen-image.mjs
```

- [ ] **Step 3: 生成「林的博客头像」(归档相册式)**

```bash
echo '{"prompt":"close up portrait of an East Asian woman, mid 20s, soft natural smile, faded color photo like an old instagram post, mild grain","name":"lin-avatar","size":"512x512","n":1}' | node scripts/gen-image.mjs
```

- [ ] **Step 4: 生成「朋友圈 4 张打卡图」**

```bash
echo '{"prompt":"morning coffee on a wooden table, soft pastel tones, instagram aesthetic, square crop, no text","name":"moment-1","size":"1024x1024","n":1}' | node scripts/gen-image.mjs
echo '{"prompt":"empty park bench under autumn light, soft focus, pastel","name":"moment-2","size":"1024x1024","n":1}' | node scripts/gen-image.mjs
echo '{"prompt":"hospital corridor blurry, accidentally taken, low light, slightly unnerving","name":"moment-3","size":"1024x1024","n":1}' | node scripts/gen-image.mjs
echo '{"prompt":"blurry photo of a ceiling with one pale figure partially visible in distance, eerie","name":"moment-4","size":"1024x1024","n":1}' | node scripts/gen-image.mjs
```

- [ ] **Step 5: 生成「崩坏用的凝视眼」(档 3 用)**

```bash
echo '{"prompt":"single realistic human eye staring directly at viewer, red iris, dim cinematic lighting, hyper detail, unsettling, square","name":"eye-stare","size":"1024x1024","n":1}' | node scripts/gen-image.mjs
```

- [ ] **Step 6: 提交**

```bash
git add assets/img/serene-logo.png assets/img/hero.png assets/img/lin-avatar.png assets/img/moment-1.png assets/img/moment-2.png assets/img/moment-3.png assets/img/moment-4.png assets/img/eye-stare.png 2>/dev/null || echo "可选择不提交图片"
# 默认策略:图片不入库(已在 .gitignore),部署时本地生成或走 action 自动生成
# 若你想看 PR 实际效果,亦可提交;此处保守不入库
```

(注:本计划默认图片不入仓库,在部署步骤生成)

---

## Task 9: 静园官网首页 `index.html`(入口)

**Files:**
- Create: `assets/css/theme-serene.css`
- Modify: `index.html`(替换 Task 2 占位)

- [ ] **Step 1: 写 `assets/css/theme-serene.css`**

```css
:root { --bg: #eef3fb; --fg: #2c3247; --soft: #7c9cf0; --warm: #f9d2e3; }
body { background: var(--bg); color: var(--fg); }
.hero { padding: 80px 24px; text-align: center; background: linear-gradient(160deg,#eaf3ff,#f3ecff); }
.hero h1 { font-size: 36px; margin: 0 0 12px; letter-spacing: 0.04em; }
.hero p  { color: #5a6075; margin: 0 0 24px; }
.logo { width: 64px; height: 64px; border-radius: 18px; }
.pill {
  display: inline-block; background: var(--soft); color: #fff; border-radius: 999px;
  padding: 12px 28px; font-weight: 600; transition: transform .15s;
}
.pill:hover { transform: translateY(-2px); text-decoration: none; }
.section { padding: 56px 24px; max-width: 880px; margin: 0 auto; }
.section h2 { font-size: 22px; margin: 0 0 12px; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-top: 24px; }
.card {
  background: #fff; border-radius: 14px; padding: 18px; box-shadow: 0 6px 24px rgba(40,60,120,.05);
}
.card b { color: var(--soft); }
.story-quote {
  font-style: italic; color: #5a6075; border-left: 3px solid var(--warm); padding-left: 12px;
  margin: 12px 0;
}
nav.global {
  position: sticky; top: 0; backdrop-filter: blur(8px); background: rgba(255,255,255,.7);
  border-bottom: 1px solid rgba(0,0,0,.06); padding: 12px 24px;
  display: flex; align-items: center; gap: 24px; font-size: 14px;
}
nav.global .spacer { flex: 1; }
nav.global a { color: #5a6075; }
.footer { text-align: center; color: #9aa; padding: 40px; font-size: 12px; }

/* 治愈配图 */
.hero-img { width: 100%; max-width: 560px; border-radius: 18px; box-shadow: 0 12px 40px rgba(0,0,0,.08); }
```

- [ ] **Step 2: 实现 `index.html`(主入口)**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>静园 · Serene | 今天，善待你的情绪</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" href="assets/img/serene-logo.png" />
<link rel="stylesheet" href="assets/css/base.css" />
<link rel="stylesheet" href="assets/css/theme-serene.css" />
<link rel="stylesheet" href="assets/css/corruption.css" />
</head>
<body>
<nav class="global">
  <img class="logo" src="assets/img/serene-logo.png" alt="Serene" />
  <a href="/">首页</a>
  <a href="#stories">学员故事</a>
  <a href="#about">关于</a>
  <span class="spacer"></span>
  <a href="admin/" title="员工入口"> </a>
</nav>

<section class="hero">
  <h1>今天，<span class="whisper">善待</span>你的情绪</h1>
  <p>3 分钟呼吸练习，找回 <span class="sub">失去的</span> 自己。</p>
  <a class="pill" href="#assessment">开始我的疗愈 →</a>
  <p class="count-badge" style="margin-top:16px;color:#9aa;font-size:12px">
    今天已有 <span data-count="47,812">47,812</span> 人回到自己身边
  </p>
</section>

<section class="section" id="assessment">
  <h2>五题小测，了解你的情绪状态</h2>
  <p>我们的临床算法比任何冥想 App 都更懂你。</p>
  <p style="font-size:13px;color:#9aa">本测评基于 14,200,003 份样本持续校准。</p>
  <a class="pill" href="blog/" style="margin-top:16px">前往林的故事 →</a>
</section>

<section class="section" id="stories">
  <h2>学员故事</h2>
  <div class="cards">
    <div class="card">
      <b>林 · 27 · 上海</b>
      <p class="story-quote">「我以为放下了过去，其实是放下了记得过去的自己。」</p>
      <a href="blog/">阅读完整 →</a>
    </div>
    <!-- 更多卡片由后续 Task 增加 -->
  </div>
</section>

<section class="section" id="about">
  <h2>关于静园</h2>
  <p>静园（Serene）成立于 2017 年，专注于"情绪障碍的精准干预"。</p>
  <p style="font-size:13px;color:#9aa">
    临床注册号 SC-2017-047 · 已服务 <span data-count>14,200,003</span> 名学员 · 重生成功率 99.7%
  </p>
  <!-- 注释里藏 ARG 小彩蛋(硬核玩家会看源码) -->
  <!-- "你已经来过 47 次了。 第一次来访请原谅我们的试探。" — Operations -->
</section>

<footer class="footer">
  © 2026 Serene Wellbeing Inc. · 一切对话均为私密，<a href="#">隐私声明</a>
</footer>

<script type="module">
import { bootPage } from './assets/js/nav.js';
bootPage('serene-home');
</script>
</body>
</html>
```

- [ ] **Step 3: 启动服务器,浏览器打开**

Run:
```bash
node scripts/serve.mjs &
sleep 1
# 浏览器访问 http://localhost:5173/
# 应看到:logo + 标题"今天，善待你的情绪" + 治愈渐变 + 计数"47,812"
# console 应无错误
kill %1
```

- [ ] **Step 4: 提交**

```bash
git add assets/css/theme-serene.css index.html
git commit -m "feat: 静园官网首页(治愈入口)"
```

---

## Task 10: 林的博客 `blog/index.html`(博客数据驱动版)

**Files:**
- Create: `blog/index.html`
- Create: `blog/post-hope.html`(代表性页面)
- Create: `blog/post-trapped.html`(代表性页面)
- Create: `blog/post-final.html`(代表性页面)
- Create: `data/blog-posts.json`
- Create: `assets/css/theme-blog.css`

- [ ] **Step 1: 写 `data/blog-posts.json`(3 篇文章,递进崩坏)**

```json
{
  "author": { "name": "林", "handle": "lin_quietcorner", "city": "上海" },
  "posts": [
    {
      "id": "hope",
      "date": "2026-03-04",
      "title": "第 1 天：欢迎你，我自己",
      "mood": "晴",
      "body": [
        "今天开始用静园。坦白讲是朋友推荐的——我已经很久没好好睡过了。",
        "第 1 次测评，中度焦虑。系统说了一句让我愣了很久：",
        "「你过去 90 天里有 47 次想要结束这一切。」",
        "我没填 47。可它说对了。",
        "——也许这次，能把我自己找回来。"
      ]
    },
    {
      "id": "trapped",
      "date": "2026-05-21",
      "title": "第 78 天：他们说要我"重生"",
      "mood": "阴",
      "body": [
        "今天接到静园客服电话。他说我的'负面人格'已经识别完，",
        "只要连续做 21 天'深度重塑'，就能彻底放下过去那些糟糕的我。",
        "我说我最近总是忘事。他说这是好转的征兆。",
        "我说我开始认不出镜子里的自己。他说这是新增的'情绪清晰度'。",
        "我不敢告诉家人。所以写在这里。"
      ]
    },
    {
      "id": "final",
      "date": "2026-06-30",
      "title": "最后一篇",
      "mood": "——",
      "body": [
        "如果你正在看这段话,谢谢你。",
        "客服说他希望我'保持安静'。他说重生完成之前不该有多余的我。",
        "我假装配合。",
        "我把记得的所有事都偷偷写在 blog 的 HTML 注释里,希望有人能搜到。",
        "关于他们内部的代号,我把它写在三个地方,看着像乱码:",
        "—— IQGG —— 这是其一",
        "—— DOOG —— 这是其二",
        "—— GOOD —— 没人敢单独写出的第三个",
        "你看到这三处,就懂了。"
      ]
    }
  ]
}
```

注意最后一篇的"01 + 05 + 06"对应 1月、5月、6月的"好日子"——为辅助 admin 密码谜题;真值为"Good"(参考 progress.json 暗示)。

- [ ] **Step 2: 实现 `blog/index.html`(列表页)**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>静的角落 · 林</title>
<link rel="stylesheet" href="../assets/css/base.css" />
<link rel="stylesheet" href="../assets/css/theme-blog.css" />
<link rel="stylesheet" href="../assets/css/corruption.css" />
</head>
<body>
<header class="blog-head">
  <img src="../assets/img/lin-avatar.png" alt="林" class="avatar" />
  <h1>静的角落</h1>
  <p class="by">by 林 · 上海 · 27</p>
  <p class="bio">在这里，我学着放下过去。</p>
</header>

<main class="wrap" id="post-list">
  <!-- 由下方脚本填充 -->
</main>

<footer class="blog-foot"><a href="../">← 回到静园</a></footer>

<script type="module">
import { bootPage } from '../assets/js/nav.js';
import posts from '../data/blog-posts.json' with { type: 'json' };
bootPage('blog');
const root = document.getElementById('post-list');
root.innerHTML = posts.posts.map(p => `
  <article class="post-card">
    <div class="meta">${p.date} · ${p.mood}</div>
    <h2><a href="post-${p.id}.html">${p.title}</a></h2>
    <p>${p.body[0]}</p>
    <a class="more" href="post-${p.id}.html">继续阅读 →</a>
  </article>
`).join('');
</script>
</body>
</html>
```

注:浏览器对 `with { type: 'json' }` 的支持需静态服务器提供正确 MIME;`serve.mjs` 已为 `.json` 设置 `application/json`,Chrome 现代版本支持。

- [ ] **Step 3: 写 `blog/post-hope.html`(完整实现)**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>第 1 天：欢迎你，我自己 · 静的角落</title>
<link rel="stylesheet" href="../assets/css/base.css" />
<link rel="stylesheet" href="../assets/css/theme-blog.css" />
<link rel="stylesheet" href="../assets/css/corruption.css" />
</head>
<body>
<header class="blog-head small">
  <a href="index.html">← 静的角落</a>
</header>
<main class="wrap" id="post"></main>
<script type="module">
import { bootPage } from '../assets/js/nav.js';
import posts from '../data/blog-posts.json' with { type: 'json' };
const id = location.pathname.match(/post-([\w-]+)\.html/)[1];
const p = posts.posts.find(x => x.id === id);
document.getElementById('post').innerHTML = `
  <h1>${p.title}</h1>
  <div class="meta">${p.date} · 心情 ${p.mood}</div>
  ${p.body.map(line => `<p>${line}</p>`).join('')}
`;
bootPage('blog');
</script>
</body>
</html>
```

- [ ] **Step 4: 复制 Step 3 模板生成 `post-trapped.html` 与 `post-final.html`**

```bash
cp blog/post-hope.html blog/post-trapped.html
cp blog/post-hope.html blog/post-final.html
```

- [ ] **Step 5: 写 `assets/css/theme-blog.css`**

```css
body { background: #fafaf7; color: #2a2a2a; font-family: Georgia, "Songti SC", serif; }
.blog-head { padding: 60px 24px; text-align: center; border-bottom: 1px solid #eee; }
.blog-head.small { padding: 18px; text-align: left; }
.avatar { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; }
.blog-head h1 { font-size: 28px; margin: 14px 0 6px; }
.by { color: #999; font-size: 13px; margin: 0; }
.bio { color: #888; font-style: italic; margin-top: 8px; }
.post-card { padding: 28px 0; border-bottom: 1px dashed #eee; }
.post-card h2 a { color: #1c1c20; }
.meta { color: #aaa; font-size: 12px; margin-bottom: 8px; }
.more { font-size: 13px; }
.blog-foot { text-align: center; padding: 40px; color: #aaa; }
.wrap article h1 { font-size: 26px; }
.wrap article p { font-size: 17px; line-height: 1.9; }
```

- [ ] **Step 6: 浏览器验证**

```bash
node scripts/serve.mjs &
sleep 1
# 访问 http://localhost:5173/blog/
# 应看到:头像 + 标题 + 3 篇文章卡片
# 点 "最后一篇" → 应看到含 "01 + 05 + 06" 的句子
kill %1
```

- [ ] **Step 7: 提交**

```bash
git add assets/css/theme-blog.css data/blog-posts.json blog/
git commit -m "feat: 林的博客(3 篇递进崩坏)"
```

---

## Task 11: 假论坛页面 `forum/index.html`

**Files:**
- Create: `forum/index.html`
- Create: `data/forum-thread.json`
- Create: `assets/css/theme-forum.css`

- [ ] **Step 1: 写 `data/forum-thread.json`(主帖+评论,潜藏答案)**

```json
{
  "title": "家人迷上"静园"后变了很多，求助有人知道吗",
  "group": "反消费主义互助 · 心理组",
  "op": {
    "name": "咖啡豆不苦", "joinedAt": "2026-04-12",
    "text": [
      "我姐在使用静园 App，三个月没回过家。昨天我去她公寓，",
      "她认不出我。她的眼神不像她。",
      "她手机上有 47 条未接来电，全是同一个号码：400-88-0047。",
      "我偷偷查了工商，这个号背后是 Serene Wellbeing Inc。"
    ]
  },
  "comments": [
    { "floor": "1楼", "user": "无意义", "at": "04-13 09:21", "text": ["回主帖：能不能看看她的'重塑进度条'？在设置-深处的版本里。"] },
    { "floor": "2楼", "user": "咖啡豆不苦", "at": "04-13 10:04", "text": ["回 1楼：她设置密码了。我用我生日 1996 试了没用。"] },
    { "floor": "3楼", "user": "旁观者", "at": "04-15 22:18", "text": ["建议报警。"] },
    { "floor": "4楼", "user": "光点", "at": "04-16 08:33", "text": ["听说是鼓励删除"负面人格"。一种新型精神控制。"] },
    { "floor": "5楼", "user": "张 T", "at": "05-02 19:01", "text": ["我妈妈用了一年，忘了我是她孩子。她只承认一个"客服"是她女儿。"] },
    { "floor": "6楼", "user": "[已注销]", "at": "05-19 23:47", "text": ["[此楼层被删除]" ←] },
    { "floor": "7楼", "user": "[账号不存在]", "at": "06-02 03:14", "text": ["别再发了,会有人找你的。"] },
    { "floor": "8楼", "user": "[账号不存在]", "at": "06-30 01:01", "text": ["[内容已被锁定]"] },
    { "floor": "9楼", "user": "加粗桂花", "at": "07-01 14:22", "text": ["惊。内部的人要不要跟我说一声也行。请回我邮箱 '[email protected]'。"] }
  ]
}
```

(注:玩家会注意到邮箱后缀 "doog — 反弹新闻" 其实是反写的 GOOD——第二处伪装)
```

- [ ] **Step 2: 实现 `forum/index.html`(整页用 JSON 填充)**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>反消费主义互助 · 心理组</title>
<link rel="stylesheet" href="../assets/css/base.css" />
<link rel="stylesheet" href="../assets/css/theme-forum.css" />
<link rel="stylesheet" href="../assets/css/corruption.css" />
</head>
<body>
<header class="forum-head">
  <div class="crumb">小组 › 反消费主义互助 › 心理组</div>
  <h1 id="title"></h1>
  <div id="op"></div>
</header>
<main class="wrap" id="comments"></main>
<footer class="forum-foot">本站由志愿者维护，不属于任何"疗愈"机构</footer>

<script type="module">
import { bootPage } from '../assets/js/nav.js';
import data from '../data/forum-thread.json' with { type: 'json' };
bootPage('forum');
document.getElementById('title').textContent = data.title;
document.getElementById('op').innerHTML = `
  <div class="op-card">
    <b>楼主 · ${data.op.name}</b> <span class="meta">${data.op.joinedAt}</span>
    ${data.op.text.map(t => `<p>${t}</p>`).join('')}
  </div>`;
document.getElementById('comments').innerHTML = data.comments.map(c => `
  <div class="comment">
    <div class="meta">${c.floor} · ${c.user} · ${c.at}</div>
    ${c.text.map(t => `<p>${t}</p>`).join('')}
  </div>
`).join('');
</script>
</body>
</html>
```

- [ ] **Step 3: 写 `assets/css/theme-forum.css`**

```css
body { background: #f5f5f5; color: #222; font-family: -apple-system, system-ui, sans-serif; }
.forum-head { background: #fff; padding: 28px 24px; border-bottom: 1px solid #eee; }
.forum-head h1 { font-size: 22px; margin: 6px 0 16px; }
.crumb { color: #888; font-size: 12px; }
.op-card { background: #fff5f1; padding: 14px 16px; border-radius: 6px; }
.comment { background: #fff; padding: 14px 16px; border-radius: 6px; margin-top: 10px; }
.comment .meta { color: #999; font-size: 12px; margin-bottom: 6px; }
.forum-foot { text-align: center; padding: 40px; color: #999; font-size: 12px; }
.wrap { max-width: 720px; padding: 20px; margin: 0 auto; }
```

- [ ] **Step 4: 验证 + 提交**

```bash
node scripts/serve.mjs &
sleep 1
# 访问 http://localhost:5173/forum/
# 应看到:主帖 + 8 楼回帖,后几楼账号变灰 + 头像占位灰化
kill %1
```

```bash
git add data/forum-thread.json forum/index.html assets/css/theme-forum.css
git commit -m "feat: 假论坛主帖+8 楼(账号渐次失联)"
```

---

## Task 12: 假微信聊天 + 朋友圈(各一页面)

**Files:**
- Create: `chat/wechat-thread.html`
- Create: `data/wechat-thread.json`
- Create: `assets/css/theme-wechat.css`
- Create: `social/timeline.html`
- Create: `data/social-posts.json`
- Create: `assets/css/theme-social.css`

- [ ] **Step 1: 写 `data/wechat-thread.json`(林-妈,林-客服两段对话)**

```json
{
  "chats": [
    {
      "title": "林 ‖ 妈妈",
      "messages": [
        { "from": "mom", "at": "2026-03-04 21:14", "text": "闺女,吃了没" },
        { "from": "lin",  "at": "2026-03-04 21:18", "text": "在的妈，今天开始用静园。客服说会慢慢变好的。" },
        { "from": "mom", "at": "2026-03-04 21:19", "text": "什么 App? 妈不太明白" },
        { "from": "lin",  "at": "2026-04-10 21:03", "text": "妈我最近比较忙可能少回你别生气" },
        { "from": "mom", "at": "2026-05-22 19:47", "text": "闺女你声音怎么变了? 听起来不像你" },
        { "from": "lin",  "at": "2026-05-22 19:49", "text": "是好转了。客服说我情绪清晰度提升。" }
      ]
    },
    {
      "title": "林 ‖ 静园首席客服·小 GOOD",
      "messages": [
        { "from": "them","at": "2026-04-30 10:01","text":"林同学,今天的练习做好了,状态非常好 ☀️" },
        { "from": "me",  "at": "2026-04-30 10:05","text":"小米,我昨晚哭了一夜" },
        { "from": "them","at": "2026-04-30 10:06","text":"那是一次深度的释放。再坚持几天,你就会忘了这种感觉。这也是我们服务的一部分。" },
        { "from": "me",  "at": "2026-05-12 22:47","text":"小米,我忘记了我爸的名字" },
        { "from": "them","at": "2026-05-12 22:48","text":"这是负向记忆清除的一环。再坚持一周,您就会是完全的您。" },
        { "from": "them","at": "2026-06-01 09:14","text":"亲,部门代号本周切换为「IQGG」。内部文件都改用这个,我们之间说「GOOD」就行。" },
        { "from": "me",  "at": "2026-06-01 09:15","text":"…为什么?" },
        { "from": "them","at": "2026-06-01 09:16","text":"为了不在审核日志里被匹配。" },
        { "from": "me",  "at": "2026-06-29 23:11","text":"小米,客服是不是我们内部用的代号? 我查了 GIVE = Genuine Identity Via Eradication" },
        { "from": "them","at": "2026-06-29 23:12","text":"您太敏感了,这只是一句口号。" },
        { "from": "them","at": "2026-06-29 23:14","text":"林,请把这段对话关掉。这也是为您好。" }
      ]
    }
  ]
}
```

- [ ] **Step 2: 实现 `chat/wechat-thread.html`**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>聊天记录导出</title>
<link rel="stylesheet" href="../assets/css/base.css" />
<link rel="stylesheet" href="../assets/css/theme-wechat.css" />
<link rel="stylesheet" href="../assets/css/corruption.css" />
</head>
<body>
<header class="wechat-head"><span>‹</span> 聊天记录</header>
<main class="wechat-wrap" id="chats"></main>
<script type="module">
import { bootPage } from '../assets/js/nav.js';
import data from '../data/wechat-thread.json' with { type: 'json' };
bootPage('wechat');
document.getElementById('chats').innerHTML = data.chats.map(c => `
  <section>
    <h2 class="wechat-title">${c.title}</h2>
    <div class="wechat-list">
      ${c.messages.map(m => `
        <div class="bubble ${m.from === 'me' || m.from === 'lin' ? 'mine' : 'theirs'}">
          <div class="at">${m.at}</div>
          <div class="text">${m.text}</div>
        </div>
      `).join('')}
    </div>
  </section>
`).join('');
</script>
</body>
</html>
```

- [ ] **Step 3: 写 `assets/css/theme-wechat.css`**

```css
body { background: #ededed; }
.wechat-head { background: #ededed; padding: 12px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #ccc; position: sticky; top: 0; }
.wechat-wrap { max-width: 540px; margin: 0 auto; padding: 16px; }
.wechat-title { font-size: 14px; color: #555; margin: 28px 0 12px; text-align: center; }
.wechat-list { display: flex; flex-direction: column; gap: 10px; }
.bubble { max-width: 70%; padding: 10px 12px; border-radius: 6px; font-size: 14px; line-height: 1.6; }
.bubble .at { display: block; font-size: 10px; color: #999; margin-bottom: 4px; }
.bubble.mine { align-self: flex-end; background: #95ec69; }
.bubble.theirs { align-self: flex-start; background: #fff; }
```

- [ ] **Step 4: 写 `data/social-posts.json`**

```json
{
  "user": "林",
  "posts": [
    { "moment": "1d ago", "img": "moment-1.png", "text": "静园 App 第一次测评就说我需要'深度重塑'。希望没事 ☁️" },
    { "moment": "3w ago", "img": "moment-2.png", "text": "新人，自我介绍一下。坐了一小时 cafe 才回家。" },
    { "moment": "1mo ago", "img": "moment-3.png", "text": "[系统图]" },
    { "moment": "now",   "img": "moment-4.png", "text": "[内容已锁定]" }
  ]
}
```

- [ ] **Step 5: 实现 `social/timeline.html`**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>林的朋友圈</title>
<link rel="stylesheet" href="../assets/css/base.css" />
<link rel="stylesheet" href="../assets/css/theme-social.css" />
<link rel="stylesheet" href="../assets/css/corruption.css" />
</head>
<body>
<header class="social-head"><img src="../assets/img/lin-avatar.png" class="avatar" /> <div><b>林</b><br/><span>在静园中</span></div></header>
<main class="wrap" id="posts"></main>
<script type="module">
import data from '../data/social-posts.json' with { type: 'json' };
import { bootPage } from '../assets/js/nav.js';
bootPage('wechat');
document.getElementById('posts').innerHTML = data.posts.map(p => `
  <article class="card">
    <div class="meta">${p.moment}</div>
    ${p.img ? `<img src="../assets/img/${p.img}" alt="">` : ''}
    <p>${p.text}</p>
  </article>
`).join('');
</script>
</body>
</html>
```

- [ ] **Step 6: 写 `assets/css/theme-social.css`**

```css
body { background: #111; color: #eee; }
.social-head { padding: 16px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #222; }
.avatar { width: 48px; height: 48px; border-radius: 6px; }
.wrap { max-width: 540px; padding: 16px; }
.card { background: #1a1a1a; border-radius: 6px; margin-bottom: 16px; padding: 14px; }
.card img { width: 100%; border-radius: 4px; margin: 8px 0; }
.meta { color: #888; font-size: 12px; }
```

- [ ] **Step 7: 验证 + 提交**

```bash
node scripts/serve.mjs &
sleep 1
# 访问 http://localhost:5173/chat/wechat-thread.html 与 /social/timeline.html
kill %1
```

```bash
git add chat/ social/ data/wechat-thread.json data/social-posts.json assets/css/theme-wechat.css assets/css/theme-social.css
git commit -m "feat: 假微信+朋友圈(数据驱动)"
```

---

## Task 13: 员工后台 + 密码门(关键谜题)

**Files:**
- Create: `admin/index.html`
- Create: `data/admin-redacted.json`
- Create: `assets/css/theme-admin.css`

- [ ] **Step 1: 写 `data/admin-redacted.json`(后台展示的伪造数据)**

```json
{
  "consent_form_excerpt": "[■■■■■■■■] 重生协议 — 有效期 [■■] 年",
  "samples": [
    { "id": "0471", "status": "complete", "mood": "anxious", "outcome": "reborn" },
    { "id": "0472", "status": "complete", "mood": "grief",   "outcome": "reborn" },
    { "id": "0473", "status": "complete", "mood": "rage",    "outcome": "[redacted]" },
    { "id": "0474", "status": "in_progress", "mood": "numb",  "outcome": "—" },
    { "id": "0475", "status": "[redacted]",  "mood": "[redacted]", "outcome": "[redacted]" }
  ],
  "rebirth_progress": "▓▓▓▓▓░░ 71%",
  "nps": "98.4%"
}
```

- [ ] **Step 2: 实现 `admin/index.html`(密码门→后台)**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>Serene · Operations Console</title>
<link rel="stylesheet" href="../assets/css/base.css" />
<link rel="stylesheet" href="../assets/css/theme-admin.css" />
<link rel="stylesheet" href="../assets/css/corruption.css" />
</head>
<body>
<main class="wrap" id="gate">
  <h1 class="brand">SERENE · OPERATIONS</h1>
  <p class="hint">员工登录</p>
  <form id="f">
    <input id="pw" type="password" placeholder="管理员代号" autocomplete="off" />
    <button type="submit">进入</button>
  </form>
  <p id="msg" class="msg"></p>
</main>

<section id="dash" hidden>
  <h2 class="brand">REBIRTH DASHBOARD</h2>
  <div id="redacted"></div>
  <p class="warn">本页面在受控环境下运行。<a href="../endings/logout.html">↪ 退出</a></p>
</section>

<script type="module">
import { bootPage, tryAdminPassword, corruption } from '../assets/js/nav.js';
import data from '../data/admin-redacted.json' with { type: 'json' };
import { applyCorruption } from '../assets/js/corruption.js';

bootPage('admin');

const f = document.getElementById('f');
const msg = document.getElementById('msg');
const gate = document.getElementById('gate');
const dash = document.getElementById('dash');

document.getElementById('redacted').innerHTML = `
  <p class="redact">${data.consent_form_excerpt}</p>
  <h3>样本进度</h3>
  <table class="table">
    <thead><tr><th>ID</th><th>状态</th><th>情绪</th><th>结果</th></tr></thead>
    <tbody>
      ${data.samples.map(s => `<tr>
        <td>${s.id}</td>
        <td>${s.status}</td>
        <td>${s.mood}</td>
        <td class="redact">${s.outcome}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <p>重生总进度：<span class="bar">${data.rebirth_progress}</span></p>
  <p>NPS：<span class="redact">${data.nps}</span></p>
`;

f.addEventListener('submit', e => {
  e.preventDefault();
  const r = tryAdminPassword(document.getElementById('pw').value);
  if (r.ok) {
    gate.hidden = true; dash.hidden = false;
    document.body.classList.add('corruption-2');
  } else {
    msg.textContent = '代号错误。' + (r.hint ? ' 提示：' + r.hint : '');
  }
});
</script>
</body>
</html>
```

- [ ] **Step 3: 写 `assets/css/theme-admin.css`(冷峻临床风)**

```css
:root { --bg: #f4f6f8; --fg: #1b2733; --line: #d7dee6; --accent: #0a84ff; }
body { background: var(--bg); color: var(--fg); font-family: "Helvetica Neue", system-ui, sans-serif; }
.wrap { max-width: 640px; margin: 80px auto; background: #fff; padding: 32px; border-radius: 10px; border: 1px solid var(--line); }
.brand { font-weight: 700; letter-spacing: 0.12em; color: var(--accent); }
.hint { color: #7b8794; font-size: 13px; }
input { width: 100%; padding: 10px; margin: 12px 0; border: 1px solid var(--line); border-radius: 6px; font-size: 14px; }
button { background: var(--accent); color: #fff; border: 0; padding: 10px 16px; border-radius: 6px; cursor: pointer; }
.msg { color: #c0392b; font-size: 13px; min-height: 18px; }
.redact { background: #1a1d2b; color: #1a1d2b; padding: 0 6px; border-radius: 3px; user-select: none; }
.table { width: 100%; border-collapse: collapse; margin: 12px 0; }
.table th, .table td { padding: 8px; text-align: left; border-bottom: 1px solid var(--line); font-size: 13px; }
.bar { font-family: monospace; }
.warn { color: #c0392b; font-size: 13px; }
#dash .brand { margin: 24px 24px 8px; display: block; }
#dash > * { max-width: 760px; margin: 0 auto; padding: 0 24px; }
```

- [ ] **Step 4: 验证**

```bash
node scripts/serve.mjs &
sleep 1
# 访问 http://localhost:5173/admin/
# 输入错误密码 → 显示提示
# 输入 "GOOD"(或 "good",大小写不敏感)→ 进入后台,看到样本表 + 重生进度;页面整体转入档 2 风格
kill %1
```

- [ ] **Step 5: 提交**

```bash
git add admin/index.html data/admin-redacted.json assets/css/theme-admin.css
git commit -m "feat: 员工后台 + 密码门(协奏档 2 触发)"
```

---

## Task 14: 404 页 + robots.txt(ARG 彩蛋层)

**Files:**
- Create: `404.html`
- Create: `robots.txt`

- [ ] **Step 1: 创建 `robots.txt`(列"被禁"但可访问的目录,诱使硬核玩家探索)**

```
# 静园 · 站点地图(请勿外链)
User-agent: *
Disallow: /admin/
Disallow: /blog/post-final.html
Disallow: /endings/hidden.html

# 注:以上均为构建中的内部页面,Search Engine Optimization 优先
Sitemap: /robots.txt
```

- [ ] **Step 2: 创建 `404.html`(带 ARG 留言)**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>404 · 静园</title>
<link rel="stylesheet" href="assets/css/base.css" />
<link rel="stylesheet" href="assets/css/theme-serene.css" />
<link rel="stylesheet" href="assets/css/corruption.css" />
<style>
  body { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 40px; }
  h1 { font-size: 80px; margin: 0; }
  p { color: #888; }
  /* ARG 暗线索:查看源代码可看到 */
</style>
</head>
<body>
  <div>
    <h1>4 0 4</h1>
    <p>你找的地方,可能从未被访问过。</p>
    <p style="font-size:13px"><a href="/">回到首页</a></p>
    <p class="whisper" style="margin-top:40px">你在这个站点被访问了 48 次。前 47 次,你都忘了吗？</p>
  </div>
</body>
</html>

<!-- ARG 开发者备忘:此处源码里的 comment 隐藏了升级彩蛋的入口。
     若 admin 已访问 hidden,这里会自动渲染眼。
     — Operations Lead -->
```

- [ ] **Step 3: 提交**

```bash
git add 404.html robots.txt
git commit -m "feat: 404 页与 robots.txt(ARG 彩蛋层)"
```

---

## Task 15: 结局三选

**Files:**
- Create: `endings/logout.html`(较好)
- Create: `endings/accept.html`(坏)
- Create: `endings/hidden.html`(硬核)
- Create: `assets/css/ending.css`(共用)

- [ ] **Step 1: 创建 `assets/css/ending.css`**

```css
body.ending-good  { background: linear-gradient(160deg,#eaf3ff,#f3ecff); color: #2c3247; }
body.ending-bad   { background: radial-gradient(circle at 50% 40%,#1a0d12,#000); color: #e8d; }
body.ending-hidden{ background: #000; color: #ff5c72; }
.wrap { max-width: 640px; margin: 120px auto; padding: 0 24px; text-align: center; }
h1 { font-size: 30px; }
.ending-bad h1 { font-family: Georgia, serif; }
.eye {
  width: 120px; height: 120px; margin: 24px auto;
  background: radial-gradient(circle at 50% 50%, #fff 0 8%, #7a0e1e 9% 42%, #160406 43%);
  border-radius: 50%; box-shadow: 0 0 60px #5a0813;
}
```

- [ ] **Step 2: 实现 `endings/logout.html`**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>已登出 · 静园</title>
<link rel="stylesheet" href="../assets/css/base.css" />
<link rel="stylesheet" href="../assets/css/ending.css" />
</head>
<body class="ending-good">
<div class="wrap">
  <h1>你选择了登出。</h1>
  <p>林的故事到此为止。<br/>但你还记得她的 47 个失联的晚上吗？</p>
  <p><a href="../">关掉这扇门</a> · <a href="../forum/">回去再确认一次</a></p>
</div>
<script type="module">
import { getState } from '../assets/js/nav.js';
import { applyCorruption } from '../assets/js/corruption.js';
getState().setEnding('logout');
</script>
</body>
</html>
```

- [ ] **Step 3: 实现 `endings/accept.html`**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>接受重生</title>
<link rel="stylesheet" href="../assets/css/base.css" />
<link rel="stylesheet" href="../assets/css/corruption.css" />
<link rel="stylesheet" href="../assets/css/ending.css" />
</head>
<body class="ending-bad">
<div class="wrap">
  <div class="eye"></div>
  <h1 class="glitch" data-text="我们再见。">我们再见。</h1>
  <p style="font-family:Georgia,serif;color:#ffd9df">第 48 号样本已锁定。</p>
  <p style="font-size:13px;color:#a77">别回头 · 这是为你好</p>
</div>
<script type="module">
import { getState } from '../assets/js/nav.js';
getState().setEnding('accept');
</script>
</body>
</html>
```

- [ ] **Step 4: 实现 `endings/hidden.html`(需腐化度=3 + 已访问 hidden 才显示完整内容)**

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<title>第 48 张脸</title>
<link rel="stylesheet" href="../assets/css/base.css" />
<link rel="stylesheet" href="../assets/css/corruption.css" />
<link rel="stylesheet" href="../assets/css/ending.css" />
</head>
<body class="ending-hidden">
<div class="wrap">
  <h1>你是第 48 张脸。</h1>
  <p>前 47 次你都选择了忘记。</p>
  <p>这一次,你读到了最后。谢谢你。</p>
</div>
<script type="module">
import { getState, bumpCorruption } from '../assets/js/nav.js';
const s = getState();
if (s.corruption() < 3) {
  document.body.innerHTML = '<div class="wrap"><p style="color:#a77">此处的内容还没有解锁。请回到 <a style="color:#aaf" href="../forum/">论坛</a>、<a style="color:#aaf" href="../chat/wechat-thread.html">聊天</a>、<a style="color:#aaf" href="../admin/">后台</a>。…或者,这一切都只是你的想象。</p></div>';
} else {
  s.setEnding('hidden');
}
</script>
</body>
</html>
```

- [ ] **Step 5: 提交**

```bash
git add endings/ assets/css/ending.css
git commit -m "feat: 三结局(登出/接受/隐藏)"
```

---

## Task 16: 主入口加互动 + README

**Files:**
- Modify: `index.html`
- Create: `README.md`

- [ ] **Step 1: 在 `index.html` 末尾增加"开始"按钮(可选互动)与可视提示**

修改 `<section class="hero">` 末尾添加:

```html
<details style="margin-top:24px">
  <summary style="cursor:pointer;color:#9aa">无障碍:以纯文本继续</summary>
  <p style="font-size:13px"><a href="blog/">博客</a> · <a href="forum/">论坛</a> · <a href="chat/wechat-thread.html">聊天</a> · <a href="social/timeline.html">动态</a></p>
</details>
```

- [ ] **Step 2: 创建 `README.md`**

```markdown
# 静园 / Serene · ARG 恐怖解谜游戏

一款纯静态、纯前端的细思极恐 ARG。你扮演调查者，从一封转错的邮件进入"静园"心理 App,
层层揭开它采集情绪数据、清除"负面人格"的真相,直到第四面墙破裂——发现你自己就是第 48 号样本。

## 运行

```bash
# 1. 安装 Node 20+
node --version

# 2. 安装/不用安装依赖（纯静态、无前端框架）
#    测试：npm test
# 3. 本地跑：
npm run serve
# 打开 http://localhost:5173/
```

## 资产生成（可选）

```bash
# 准备 .env（在仓库根）
# OPENAI_API_KEY=sk-...
# OPENAI_BASE_URL=https://api.x5m5x.com
# IMAGE_MODEL=gpt-image-1

# 生成单张图示例
echo '{"prompt":"...","name":"foo","size":"1024x1024"}' | npm run image
```

## 推荐游玩路径

1. 打开 `/`
2. 顺着"学员故事"卡片点进 `林的博客`
3. 看完博客 → 进论坛 → 看聊天 → 看朋友圈
4. 综合博客的 "01+05+06"、论坛线索、聊天中的 GIVE 缩写,推出后台密码
5. 进入员工后台后,选择 登出 / 接受 / 找隐藏结局

## 部署

GitHub Pages 直接发布仓库根目录即可。`.gitignore` 已忽略 `.env` 和大体积图片资产。

## 安全提示

`.env` 包含 API key。**切勿提交**。本项目已在 `.gitignore` 中保护,但仍建议定期轮换 key。
```

- [ ] **Step 3: 提交**

```bash
git add index.html README.md
git commit -m "docs: README + 无障碍入口"
```

---

## Task 17: 整体走查(模拟玩家视角) + 修正

- [ ] **Step 1: 清空进度,完整跑一遍**

```bash
# 浏览器开 http://localhost:5173/
# 1) 首页 → 进入林博客 → 看 3 篇 → 提示"01 + 05 + 06"
# 2) 回首页 → 进论坛 → 看主帖+8 楼
# 3) 进聊天 → 看 2 段对话
# 4) 进朋友圈 → 看 4 张动态
# 5) 拼出 admin 密码(参考:对应 admin 密码谜题答案)
# 6) 进 admin → 输入密码 → 看到后台 + 档 2 效果
# 7) 进 endings → 试 3 个结局
```

- [ ] **Step 2: 修复走查中发现的问题**

按需修。常见的:
- 链接 404(check 所有 `href` 路径)
- 崩坏档 class 没切换(检查 `applyCorruption` 时机)
- 隐藏结局 always-unlock(确认 `s.corruption() < 3` 分支)

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "chore: 整体走查后的修正"
```

---

## Task 18: 部署到 GitHub Pages

- [ ] **Step 1: 创建 GitHub 仓库 gh-pages(或启用 Pages)**

最简方式:
```bash
# 在 GitHub 创建一个名为 serene-arg 的仓库(空仓库)
git remote add origin <your-github-url>
git push -u origin master
# 在仓库 Settings → Pages → 选择 master 分支,根目录
```

- [ ] **Step 2: 在仓库创建 `.github/workflows/pages.yml`(自动部署,可选)**

```yaml
name: pages
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: '.' }
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: 提交 + 推送**

```bash
git add .github/workflows/pages.yml
git commit -m "ci: GitHub Pages 自动部署"
git push origin master
```

部署完成后,在 README 里填入 GitHub Pages URL。

---

## 总览地图(开发完成时该有的样子)

```
index.html                       # 静园入口 → 引导到 blog
blog/  (3 篇博文)               # 隐藏"01+05+06"
forum/index.html                 # 8 楼 + 账号渐失联
chat/wechat-thread.html          # 2 段聊天
social/timeline.html             # 4 张动态
admin/index.html                 # 密码门(答案 GOOD)→ 后台 + 档 2 触发
endings/{logout,accept,hidden}.html  # 三结局
404.html                         # "48 次访问"彩蛋
```

**通关路径示例:**
1. 打开首页 → "学员故事"卡片 → 进入博客
2. 三篇博文都看 → 注意到"01+05+06"、"GIVE"暗示、"47"
3. 进论坛 / 聊天 / 朋友圈 → 集齐线索
4. 后台输入密码 `GOOD`(从博客"三处伪装"、论坛某楼、聊天"小 GOOD" 拼出来)→ 进入后台 → 触发档 2
5. 选择:登出 / 接受 / 找隐藏结局(需 corruption ≥ 3,即挖出隐藏在源码/robots.txt 里的线索)
