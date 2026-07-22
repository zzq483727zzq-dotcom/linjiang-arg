# 临江 · 幸福家园 ARG 重做 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 `docs/superpowers/specs/2026-07-22-linjiang-home-arg-design.md` 重做可玩主线：说明页→手机→政府站/评论/贴吧→弘科→OA→幸福家园员工端→爆点与红字墙「我们会找到你的！」。

**Architecture:** 继续静态多页站点 + 前端模块状态（localStorage）。新状态键 `linjiangState`（与旧 `sereneState` 隔离，避免脏进度）。`assets/js/state.js` / `puzzle.js` / `nav.js` 重写为新进度与三门禁；各站点 HTML 分目录挂载；监视/摄像头/IP 纯演出。旧 `serene/` `system/` 民俗页等主线降权或删除入口，不在本计划复活香火/48席。

**Tech Stack:** 原生 HTML/CSS/JS（ES modules）、Node 内置 test runner（`node --test`）、现有 `scripts/serve.mjs`、可选 `scripts/batch-images.mjs` 生图。

**Spec:** `docs/superpowers/specs/2026-07-22-linjiang-home-arg-design.md`

**执行策略:** 按 Phase 顺序交付；每一 Phase 结束必须 `npm test` 绿 + 手工主路径可点到本阶段终点。不要并行大改未解锁的站点。

---

## 锁定常量（全计划共用，禁止各写各的）

| 键 | 值 | 公开线索位置 |
|----|-----|----------------|
| 玩家默认名 | `陈知夏`（说明页可改输入，最大 6 字） | 说明页 |
| 已故官员 | `周启明` | 讣告 + 追记 |
| 遗像文件 | `/assets/img/zhou-portrait.png` | 讣告页 |
| OA 用户名 | `zhouqm` | 追记：「系统登录名沿用姓名拼音」 |
| OA 口令 | `19680315` | 讣告出生日期 1968年3月15日 → YYYYMMDD |
| 管线编号 | `HK-SF-03` | 弘科管线页 + 家园林屿档案 |
| 家园员工工号 | `HY-0317` | OA 对接单 |
| 家园员工口令 | `260317` | OA 对接单：「临时授权=文号临心试〔2026〕0317 之六位 260317」 |
| 弘科 F3 用户 | `pilot` | 临江吧主帖 |
| 弘科 F3 口令 | `hk2026` | 临江吧主帖打码图 alt/正文 |
| 林屿个案号 | `LY-2026-0317` | 员工端档案 |
| 域名演出 | `linjiang.gov.example` · `home-serene.example` · `hongke-bio.example` · `lj-bar.example` | browser 路由表 |
| 红字墙主句 | `我们会找到你的！` | 终局页 |
| storage key | `linjiangState` | state.js |
| 旧 key | 不再读写 `sereneState` | — |

---

## 文件结构（目标）

```
index.html                          # 说明页 → 开始调查
phone/
  index.html                        # 桌面（Dock 不重复）
  wechat.html                       # Tab 壳 + 会话列表
  chat-lin.html                     # 林屿
  chat-chen.html                    # 陈默
  moments.html                      # 发现-朋友圈（仅微信内链入）
  mail.html
  xhs.html
  browser.html
  phone.html / sms 可合并 thin
city/                               # 政府公开站（重做内容，可复用 theme-city）
  index.html
  news/*.html                       # 少而精
  search.html
  comments 组件可 inline script
  intranet/
    login.html
    index.html                      # OA 壳
    doc-handoff.html                # 对接单
    attach-chat.html                # F1
home/                               # 幸福家园公开站（新建，替代 serene 主品牌）
  index.html about.html services.html stories.html assess.html contact.html
  staff-login.html
hongke/                             # 弘科生物
  index.html pipeline.html about.html news.html jobs.html
  login.html board.html             # F3
bar/                                # 临江吧
  index.html
  p-batch.html                      # 主爆料帖
staff/                              # 家园员工端（重写叙事）
  dashboard.html
  subject-lin.html
  wall.html
  you.html
  monitor-cam.js 可并入页内
ending/
  warn.html
  redwall.html
  choice.html
  reveal.html silent.html enrolled.html
assets/js/
  state.js                          # 重写
  puzzle.js                         # 重写三门禁 + F3
  nav.js                            # boot/grant 适配
  browser-routes.js                 # 可选从 browser 抽出
  comments.js                       # 政府评论数据
assets/css/
  theme-phone.css                   # 修 Dock
  theme-city.css theme-home.css theme-hongke.css theme-bar.css
  theme-oa.css theme-staff.css theme-ending.css
tests/
  state.test.mjs                    # 重写
  puzzle.test.mjs                   # 重写
  smoke-paths.test.mjs              # 可选：纯函数路由
```

旧目录 `serene/` `system/` `community/` `member/` `lin/`：本计划 **不链入主路径**；Phase 7 再决定删或 404 提示「档案迁移」。

---

## Phase 0 — 清理入口与常量文档

### Task 0: 进度说明写入 README 指针

**Files:**
- Modify: `README.md`（顶部加指向新 spec/plan，旧通关作废声明）

- [ ] **Step 1: 改 README 头部**

在 `README.md` 最上方插入：

```markdown
> **2026-07-22 重做中：** 主设计见 `docs/superpowers/specs/2026-07-22-linjiang-home-arg-design.md`，
> 实现计划见 `docs/superpowers/plans/2026-07-22-linjiang-home-arg-plan.md`。
> 下文旧「静园」通关攻略已过时，勿作准。
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: point README to linjiang redesign spec/plan"
```

---

## Phase 1 — 状态引擎与谜题（TDD，先于页面）

### Task 1: 重写 `defaultState` 与 stage 推断

**Files:**
- Modify: `assets/js/state.js`
- Modify: `tests/state.test.mjs`

- [ ] **Step 1: 重写测试文件为新字段**

将 `tests/state.test.mjs` 整文件替换为：

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultState,
  createState,
  createMemoryAdapter,
  stageOf,
} from '../assets/js/state.js';

test('default state v3 fields', () => {
  assert.equal(defaultState.playerName, '');
  assert.equal(defaultState.stage, 0);
  assert.equal(defaultState.socialRead, false);
  assert.equal(defaultState.assessmentDone, false);
  assert.equal(defaultState.obitFound, false);
  assert.equal(defaultState.hongkeFound, false);
  assert.equal(defaultState.barRead, false);
  assert.equal(defaultState.oaAccess, false);
  assert.equal(defaultState.hongkeBoard, false);
  assert.equal(defaultState.staffAccess, false);
  assert.equal(defaultState.truthSeen, false);
  assert.equal(defaultState.flagged, false);
  assert.equal(defaultState.ending, null);
  assert.equal(defaultState.chatNodeUsed, 0);
});

test('setPlayerName + stage stays 0', () => {
  const s = createState({ adapter: createMemoryAdapter() });
  s.setPlayerName('陈知夏');
  assert.equal(s.all().playerName, '陈知夏');
  assert.equal(s.all().stage, 0);
});

test('mark flags only raise stage', () => {
  const s = createState({ adapter: createMemoryAdapter() });
  s.grant('social');
  assert.equal(s.all().socialRead, true);
  assert.ok(s.all().stage >= 1);
  s.grant('assessment');
  assert.ok(s.all().stage >= 2);
  s.grant('obit');
  s.grant('hongke');
  assert.ok(s.all().stage >= 3);
  s.grant('oa');
  assert.ok(s.all().stage >= 4);
  s.grant('staff');
  assert.ok(s.all().stage >= 5);
  s.grant('truth');
  assert.ok(s.all().stage >= 6);
  s.grant('flagged');
  assert.ok(s.all().stage >= 7);
  const st = s.all().stage;
  s.grant('social');
  assert.equal(s.all().stage, st);
});

test('setEnding + reset', () => {
  const s = createState({ adapter: createMemoryAdapter() });
  s.grant('flagged');
  s.setEnding('silent');
  assert.equal(s.all().ending, 'silent');
  s.reset();
  assert.equal(s.all().ending, null);
  assert.equal(s.all().stage, 0);
  assert.equal(s.all().playerName, '');
});

test('stageOf pure helper matches infer order', () => {
  assert.equal(stageOf({ ...defaultState }), 0);
  assert.equal(stageOf({ ...defaultState, flagged: true }), 7);
  assert.equal(stageOf({ ...defaultState, truthSeen: true }), 6);
  assert.equal(stageOf({ ...defaultState, staffAccess: true }), 5);
  assert.equal(stageOf({ ...defaultState, oaAccess: true }), 4);
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: FAIL resolving exports / old field names.

- [ ] **Step 3: 重写 `assets/js/state.js`**

```js
// state.js — 临江 ARG v3
export const defaultState = {
  playerName: '',
  stage: 0,
  socialRead: false,
  assessmentDone: false,
  obitFound: false,
  hongkeFound: false,
  barRead: false,
  oaAccess: false,
  hongkeBoard: false,
  staffAccess: false,
  truthSeen: false,
  flagged: false,
  ending: null,
  chatNodeUsed: 0,
  visitFlags: [],
};

const STORAGE_KEY = 'linjiangState';

export function createLocalStorageAdapter() {
  if (typeof localStorage === 'undefined') throw new Error('localStorage not available');
  return {
    get(k) { return localStorage.getItem(k); },
    set(k, v) { localStorage.setItem(k, String(v)); },
    remove(k) { localStorage.removeItem(k); },
  };
}

export function createMemoryAdapter() {
  const m = new Map();
  return {
    get(k) { return m.has(k) ? m.get(k) : null; },
    set(k, v) { m.set(k, String(v)); },
    remove(k) { m.delete(k); },
  };
}

export function stageOf(s) {
  if (s.ending) return 8;
  if (s.flagged) return 7;
  if (s.truthSeen) return 6;
  if (s.staffAccess) return 5;
  if (s.oaAccess) return 4;
  if (s.obitFound || s.hongkeFound || s.barRead) return 3;
  if (s.assessmentDone) return 2;
  if (s.socialRead) return 1;
  return 0;
}

const GRANTS = {
  social: { socialRead: true },
  assessment: { assessmentDone: true },
  obit: { obitFound: true },
  hongke: { hongkeFound: true },
  bar: { barRead: true },
  oa: { oaAccess: true },
  board: { hongkeBoard: true },
  staff: { staffAccess: true },
  truth: { truthSeen: true },
  flagged: { flagged: true },
};

export function createState({ adapter } = {}) {
  const a = adapter || createMemoryAdapter();

  function read() {
    try {
      return { ...defaultState, ...JSON.parse(a.get(STORAGE_KEY) || '{}') };
    } catch {
      return { ...defaultState };
    }
  }
  function write(state) {
    const stage = stageOf(state);
    const next = { ...state, stage };
    a.set(STORAGE_KEY, JSON.stringify(next));
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.stage = String(stage);
    }
    return next;
  }

  return {
    all() {
      const s = read();
      return { ...s, stage: stageOf(s) };
    },
    setPlayerName(name) {
      const n = String(name || '').trim().slice(0, 6);
      const s = read();
      write({ ...s, playerName: n || s.playerName });
    },
    grant(key) {
      const patch = GRANTS[key];
      if (!patch) throw new Error('unknown grant: ' + key);
      const s = read();
      write({ ...s, ...patch });
    },
    bumpChatNode() {
      const s = read();
      write({ ...s, chatNodeUsed: (s.chatNodeUsed || 0) + 1 });
    },
    setEnding(id) {
      const s = read();
      write({ ...s, ending: id });
    },
    flagVisit(flag) {
      const s = read();
      const visitFlags = Array.from(new Set([...(s.visitFlags || []), flag]));
      write({ ...s, visitFlags });
    },
    reset() {
      a.remove(STORAGE_KEY);
      write({ ...defaultState });
    },
  };
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```

Expected: state tests PASS（puzzle 若仍旧字段会 FAIL — 下一步立刻改 puzzle）。

- [ ] **Step 5: Commit**

```bash
git add assets/js/state.js tests/state.test.mjs
git commit -m "feat(state): linjiang v3 progress engine"
```

---

### Task 2: 重写 puzzle 三门禁 + F3

**Files:**
- Modify: `assets/js/puzzle.js`
- Modify: `tests/puzzle.test.mjs`

- [ ] **Step 1: 替换 `tests/puzzle.test.mjs`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPuzzle, PUZZLES } from '../assets/js/puzzle.js';

test('exports oa-login staff-login hongke-board', () => {
  assert.ok(PUZZLES['oa-login']);
  assert.ok(PUZZLES['staff-login']);
  assert.ok(PUZZLES['hongke-board']);
});

test('oa-login: zhouqm / 19680315', () => {
  assert.equal(checkPuzzle('oa-login', { username: 'zhouqm', password: '19680315' }).ok, true);
  assert.equal(checkPuzzle('oa-login', { username: 'ZHOUQM', password: '19680315' }).ok, true);
  assert.equal(checkPuzzle('oa-login', { username: 'zhouqm', password: '1968-03-15' }).ok, false);
});

test('staff-login: HY-0317 / 260317', () => {
  assert.equal(checkPuzzle('staff-login', { username: 'HY-0317', password: '260317' }).ok, true);
  assert.equal(checkPuzzle('staff-login', { username: 'hy-0317', password: '260317' }).ok, true);
  assert.equal(checkPuzzle('staff-login', { username: 'HY-0317', password: '0317' }).ok, false);
});

test('hongke-board: pilot / hk2026', () => {
  assert.equal(checkPuzzle('hongke-board', { username: 'pilot', password: 'hk2026' }).ok, true);
  assert.equal(checkPuzzle('hongke-board', { username: 'pilot', password: 'wrong' }).ok, false);
});

test('failHint escalates', () => {
  const h1 = checkPuzzle('oa-login', { username: 'x', password: 'y' }, 1).hint;
  const h6 = checkPuzzle('oa-login', { username: 'x', password: 'y' }, 6).hint;
  assert.ok(h1.length > 0);
  assert.ok(h6.includes('19680315') || h6.includes('zhouqm'));
});

test('unknown id throws', () => {
  assert.throws(() => checkPuzzle('nope', {}), /unknown/);
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test
```

- [ ] **Step 3: 替换 `assets/js/puzzle.js`**

```js
const normalizeUser = (s) => String(s || '').replace(/\s+/g, '').toLowerCase();
const normalizeCode = (s) => String(s || '').replace(/\s+/g, '').toUpperCase();

export const PUZZLES = {
  'oa-login': {
    fields: ['username', 'password'],
    answer: { username: 'zhouqm', password: '19680315' },
    hint: '用户名为周启明姓名拼音；口令为讣告出生日期 YYYYMMDD。',
    check(input) {
      return normalizeUser(input?.username) === 'zhouqm' &&
        String(input?.password ?? '') === '19680315';
    },
    failHint(n) {
      if (n < 3) return '用户名是拼音小写；口令是 8 位数字日期。';
      if (n < 6) return '方向：追记里的登录名 + 讣告上的出生年月日。';
      return '直接填：zhouqm / 19680315';
    },
  },
  'staff-login': {
    fields: ['username', 'password'],
    answer: { username: 'HY-0317', password: '260317' },
    hint: '工号与临时授权见市政府 OA 对接单。',
    check(input) {
      return normalizeCode(input?.username) === 'HY-0317' &&
        String(input?.password ?? '') === '260317';
    },
    failHint(n) {
      if (n < 3) return '工号形如 HY-####；口令 6 位数字。';
      if (n < 6) return '方向：OA 对接单上的家园侧工号与文号六位。';
      return '直接填：HY-0317 / 260317';
    },
  },
  'hongke-board': {
    fields: ['username', 'password'],
    answer: { username: 'pilot', password: 'hk2026' },
    hint: '试点测试账号写在临江吧爆料帖里。',
    check(input) {
      return normalizeUser(input?.username) === 'pilot' &&
        String(input?.password ?? '') === 'hk2026';
    },
    failHint(n) {
      if (n < 3) return '用户名是英文；口令小写字母+数字。';
      if (n < 6) return '方向：临江吧主帖里的测试账号。';
      return '直接填：pilot / hk2026';
    },
  },
};

export function checkPuzzle(id, input, attemptCount = 1) {
  const p = PUZZLES[id];
  if (!p) throw new Error('unknown puzzle: ' + id);
  const ok = p.check(input);
  return {
    ok,
    hint: ok ? '' : p.failHint(attemptCount),
  };
}
```

- [ ] **Step 4: Run — expect all PASS**

```bash
npm test
```

- [ ] **Step 5: Commit**

```bash
git add assets/js/puzzle.js tests/puzzle.test.mjs
git commit -m "feat(puzzle): oa/staff/hongke board logins"
```

---

### Task 3: 适配 `nav.js` 到 v3 state

**Files:**
- Modify: `assets/js/nav.js`
- Modify: `tests/corruption.test.mjs`（若依赖旧 stage 映射，改为宽松或 skip 民俗档）

- [ ] **Step 1: 精简 nav 导出**

保证至少导出：

```js
import { createState, createLocalStorageAdapter } from './state.js';
import { checkPuzzle } from './puzzle.js';

let _state;
export function getState() {
  if (!_state && typeof localStorage !== 'undefined') {
    _state = createState({ adapter: createLocalStorageAdapter() });
  }
  return _state;
}

export function boot(pageId) {
  const s = getState();
  if (s) s.flagVisit(pageId);
  // 可选：轻量 data-stage 已由 write 设置
}

export function resetProgress() {
  getState()?.reset();
}

export function tryPuzzle(id, input, attemptCount) {
  const result = checkPuzzle(id, input, attemptCount);
  if (result.ok) {
    const s = getState();
    if (id === 'oa-login') s?.grant('oa');
    if (id === 'staff-login') s?.grant('staff');
    if (id === 'hongke-board') s?.grant('board');
  }
  return result;
}

// 兼容页内可能仍 import 的名字：空操作或映射
export function recordStoryRead() { getState()?.grant('social'); }
export function recordChatRead() { getState()?.grant('social'); }
export function recordAssessment() { getState()?.grant('assessment'); }
export function flashInkBleed() { /* no-op: 民俗墨渗移除 */ }
```

删除对旧 `riteStage` 腐化强制依赖；`corruption.js` 若仍被引用，改为 `stage >= 6` 才轻微样式或暂不挂载员工端以外页面。

- [ ] **Step 2: 修 `tests/corruption.test.mjs`**

若测试绑定 0..5 民俗档：改为仅测 `stageClass(stage)` 纯函数，或临时：

```js
test('corruption helper still exports', async () => {
  const mod = await import('../assets/js/corruption.js');
  assert.equal(typeof mod.stageClass, 'function');
});
```

保证 `npm test` 全绿。

- [ ] **Step 3: Commit**

```bash
git add assets/js/nav.js assets/js/corruption.js tests/corruption.test.mjs
git commit -m "feat(nav): wire v3 grants and puzzles"
```

---

## Phase 2 — 说明页 + 手机壳

### Task 4: 根 `index.html` 改为说明页

**Files:**
- Modify: `index.html`
- Create: `assets/css/theme-intro.css`（可极短）

- [ ] **Step 1: 写说明页**

`index.html` 结构要求：

- 标题如「备忘 · 临江」
- 正文交代：你是林屿好友；他失联数日；有人说他没事；你决定自己查
- 输入框 `id="player-name"` placeholder 默认展示「陈知夏」
- 按钮「开始调查」：写入 `setPlayerName`（空则默认陈知夏）→ `location.href='/phone/'`
- `boot('intro')`
- **无**剧透替代/弘科

- [ ] **Step 2: 手工验证**

```bash
npm run serve
```

打开 `/` → 填名 → 进入 `/phone/`（下一任务建）。

- [ ] **Step 3: Commit**

```bash
git add index.html assets/css/theme-intro.css
git commit -m "feat(intro): briefing page with player name"
```

---

### Task 5: 手机桌面重做（Dock 不重复）

**Files:**
- Create: `phone/index.html`（若根曾是手机，改为 phone 下）
- Modify: `assets/css/theme-phone.css`

- [ ] **Step 1: 桌面布局**

- Dock **仅 4 个：** 微信 `/phone/wechat.html` · 邮件 `/phone/mail.html` · 浏览器 `/phone/browser.html` · 电话 `/phone/phone.html`
- 桌面区：**小红书** `/phone/xhs.html`（勿再放 Dock 同图标）
- 无第二套重复 Dock 图标
- `boot('phone-home')`

- [ ] **Step 2: 截图或目视确认无重复**

- [ ] **Step 3: Commit**

```bash
git add phone/index.html assets/css/theme-phone.css
git commit -m "feat(phone): home screen without dock duplicates"
```

---

### Task 6: 微信壳 + 林屿/陈默/朋友圈

**Files:**
- Create/Overwrite: `phone/wechat.html` `phone/chat-lin.html` `phone/chat-chen.html` `phone/moments.html`
- Modify: `assets/css/theme-phone.css`

- [ ] **Step 1: wechat.html**

- 底 Tab：微信（当前）| 通讯录（薄）| 发现→链 `moments.html` | 我（薄）
- 会话列表：林屿未读、陈默

- [ ] **Step 2: chat-lin.html**

- 历史气泡：失眠、提幸福家园评估、渐少回、空窗、客服式「我很好」「课程有帮助」
- 底部：阶段允许时显示输入（`chatNodeUsed < 2`）：预设两按钮「你人在哪」「痣还在吗」而非自由全键盘也行
- 发送后延迟显示空回；`bumpChatNode()`；`grant('social')` on load

- [ ] **Step 3: chat-chen.html**

- 口语：「他妈说他回来了状态好很多」「你别只看朋友圈」「公域」等词 **禁止**

- [ ] **Step 4: moments.html**

- 4～6 条；失联前含 **有痣** 图 `/assets/img/lin-before.png`（可先占位）
- 失联后 0～2 条无痣 `/assets/img/lin-after.png`
- 仅从发现进入

- [ ] **Step 5: Commit**

```bash
git add phone/wechat.html phone/chat-lin.html phone/chat-chen.html phone/moments.html
git commit -m "feat(wechat): tabs, lin/chen threads, moments"
```

---

### Task 7: 邮件 · 小红书 · 浏览器路由 · 电话薄页

**Files:**
- `phone/mail.html` `phone/xhs.html` `phone/browser.html` `phone/phone.html`

- [ ] **Step 1: mail.html**

- 发件：幸福家园课程顾问
- 前因：紧急联系人/回访误发
- 链接经浏览器：`home-serene.example` → `/home/`
- 无「无权限」吓人主路径（可轻微）

- [ ] **Step 2: xhs.html**

- 1～2 帖；提临江试点/睡眠；**不**贴吧主链

- [ ] **Step 3: browser.html 路由表**

```js
const ROUTES = [
  { test: /linjiang\.gov/i, to: '/city/' },
  { test: /home-serene|幸福家园|xinyuan/i, to: '/home/' },
  { test: /hongke|弘科/i, to: '/hongke/' },
  { test: /lj-bar|临江吧/i, to: '/bar/' },
];
```

预填 `?url=`；不自动跳转。

- [ ] **Step 4: phone.html** 未接来电/短信列表薄页

- [ ] **Step 5: Commit**

```bash
git add phone/
git commit -m "feat(phone): mail xhs browser routes phone log"
```

---

## Phase 3 — 政府公开站

### Task 8: 政府首页 + 搜索 + 新闻清单

**Files:**
- Rewrite under `city/`：`index.html` `search.html` `news-*.html` 控制在 ≤10 篇
- `assets/js/city-data.js`：文章与评论数据
- `assets/js/city-search.js`：关键词检索

**必做篇（文件名建议）：**

| 文件 | 职能 |
|------|------|
| `news-pilot.html` | 家园试点 |
| `news-missing.html` | 寻人 |
| `news-retract.html` | 已联系/撤稿 |
| `news-obit.html` | 周启明讣告+遗像 |
| `news-obit-memo.html` | 追记（登录名 zhouqm） |
| `news-hongke-a.html` | 弘科技术支持 |
| `news-hongke-b.html` | 弘科产业落地 |
| `news-filler.html` | 弱相关 |

- [ ] **Step 1: city-data 含评论**

弘科 A/B 评论含有脑尖评 + **「临江吧搜批次」**；寻人稿含家属群质疑；filler 全正常。

- [ ] **Step 2: 讣告页**

- 遗像 img（可先占位色块）
- 出生 1968年3月15日；逝世日期自定 2026年2月
- `grant('obit')` on load

- [ ] **Step 3: 追记**

- 明文不写密码；写「登录名用姓名全拼小写」「他总把生日当备忘」

- [ ] **Step 4: 页脚「办公系统」→ `/city/intranet/login.html`

- [ ] **Step 5: 手工：搜索「弘科」两篇；评论可见吧提示

- [ ] **Step 6: Commit**

```bash
git add city/ assets/js/city-data.js assets/js/city-search.js assets/css/theme-city.css
git commit -m "feat(city): lean portal search news comments"
```

---

## Phase 4 — 临江吧 + 弘科

### Task 9: 临江吧 F2

**Files:**
- Create: `bar/index.html` `bar/p-batch.html`
- Create: `assets/css/theme-bar.css`

- [ ] **Step 1: 列表页假帖若干，仅 `p-batch` 可点**

- [ ] **Step 2: 主帖**

- 爆料社会面/终止/家园执行/弘科方案
- 暗示：`pilot` / `hk2026`（可拆分打码：`pi**t` + 图注 hk2026）
- on load `grant('bar')`

- [ ] **Step 3: Commit**

```bash
git add bar/
git commit -m "feat(bar): tieba-style leak thread"
```

---

### Task 10: 弘科薄站 + F3 看板

**Files:**
- Create: `hongke/*.html`
- CSS: `theme-hongke.css`

- [ ] **Step 1: 五页公开站** + 管线写 `HK-SF-03` + 招聘 JD 过界句 + 伦理反讽

- [ ] **Step 2: `grant('hongke')` on 首页或管线页

- [ ] **Step 3: `login.html` + `board.html` 用 `tryPuzzle('hongke-board')` → 成功去看板

- [ ] **Step 4: 看板一页：批次 HK-SF-03、合作方幸福家园、社会面运行/原对象终止

- [ ] **Step 5: Commit**

```bash
git add hongke/
git commit -m "feat(hongke): thin site and pilot board"
```

---

## Phase 5 — OA + 家园公开站

### Task 11: OA 登录与 F1

**Files:**
- `city/intranet/login.html`
- `city/intranet/index.html`
- `city/intranet/doc-handoff.html`
- `city/intranet/attach-chat.html`

- [ ] **Step 1: login 调 `tryPuzzle('oa-login')`**

- [ ] **Step 2: 壳：待办、对接单入口、附件入口

- [ ] **Step 3: 对接单展示 `HY-0317` / 文号→`260317` 人话说明

- [ ] **Step 4: F1 聊天图/HTML：社会面先上、原来的终止、弘科催批次、可提「临江吧」无 URL

- [ ] **Step 5: Commit**

```bash
git add city/intranet/
git commit -m "feat(oa): login handoff and chat attachment"
```

---

### Task 12: 幸福家园公开站

**Files:**
- Create: `home/` 下 6～7 页
- 页脚：指导单位政府、技术合作弘科、工作人员→`staff-login.html`

- [ ] **Step 1: 视觉干净康养风（新 CSS，勿挂民俗）**

- [ ] **Step 2: 评估 6～8 题 → `grant('assessment')`

- [ ] **Step 3: 案例 1～2 匿名成功叙事

- [ ] **Step 4: Commit**

```bash
git add home/
git commit -m "feat(home): public serene-care site"
```

---

## Phase 6 — 员工端爆点 + 终局

### Task 13: 员工登录与档案层

**Files:**
- Rewrite: `staff/login.html` `staff/dashboard.html` `staff/subject-lin.html`

- [ ] **Step 1: login → tryPuzzle staff → dashboard**

- [ ] **Step 2: 档案 LY-2026-0317，管线 HK-SF-03，状态社会面正常**

- [ ] **Step 3: 处理记录页：短句「原对象已处理。勿告知家属真实情况。」+ 克制图；`grant('truth')`**

- [ ] **Step 4: 同页或脚本：若 social 已读，提示回微信（爆点2 用 chat-lin 检测 truthSeen 插气泡）

- [ ] **Step 5: Commit**

```bash
git add staff/
git commit -m "feat(staff): login archive and termination record"
```

---

### Task 14: 案例墙 · 你在表上 · 摄像头左上角

**Files:**
- `staff/wall.html` `staff/you.html`

- [ ] **Step 1: 墙：多张成功脸；林屿无痣；侧栏社会面运行中**

- [ ] **Step 2: you：玩家名在「建议纳入」；来源=检索对象好友；`grant('flagged')`**

- [ ] **Step 3: 进入 wall 或 you 时左上角权限气泡 HTML/CSS（非 center modal）**

```html
<div id="cam-perm" class="cam-bubble" hidden>
  https://home-staff.example 想使用你的摄像头
  <button data-a="allow">允许</button>
  <button data-a="deny">拒绝</button>
</div>
```

两种结果均 toast「核验/拒绝已记录」——不调用 `getUserMedia`。

- [ ] **Step 4: 顶栏在线人数异常文案**

- [ ] **Step 5: Commit**

```bash
git add staff/
git commit -m "feat(staff): wall you-row and fake cam prompt"
```

---

### Task 15: 微信 X + 警告 + 红字墙 + 三结局

**Files:**
- Modify: `phone/chat-lin.html`（`truthSeen|flagged` 时插入「别查了，对你不好」）
- Create: `ending/warn.html` `ending/redwall.html` `ending/choice.html`
- Create: `ending/reveal.html` `ending/silent.html` `ending/enrolled.html`

- [ ] **Step 1: warn — IP/访问已记录系统风**

- [ ] **Step 2: redwall — 黑底满屏重复 **我们会找到你的！** + 玩家名；链向 choice

- [ ] **Step 3: choice — 拆穿 / 沉默 / 被写下 → setEnding + 对应页

- [ ] **Step 4: 各结局页重置入口 `resetProgress` → `/`**

- [ ] **Step 5: staff you 页主 CTA → `/ending/warn.html`（需 flagged）**

- [ ] **Step 6: Commit**

```bash
git add ending/ phone/chat-lin.html
git commit -m "feat(ending): warn redwall and three endings"
```

---

## Phase 7 — 资源、旧入口、验收

### Task 16: 林屿/周启明图

**Files:**
- `scripts/batch-images.mjs` 增加 job：`lin-before` `lin-after` `zhou-portrait` `term-bed` 等
- 输出 `assets/img/`

- [ ] **Step 1: 写 prompt（路人感、有痣/无痣同一人）**

- [ ] **Step 2: `npm run images lin-before lin-after zhou-portrait`（需 .env）

- [ ] **Step 3: 页内 src 对齐；失败时用 CSS 占位不破版

- [ ] **Step 4: Commit 图片与脚本（大图若超限可 git-lfs 或仅提交压缩版）

```bash
git add scripts/batch-images.mjs assets/img/lin-before.png assets/img/lin-after.png assets/img/zhou-portrait.png
git commit -m "assets: regenerate lin and official portraits"
```

---

### Task 17: 旧主线入口切断

**Files:**
- 根与 phone 不链 `serene/` `system/` `community/` 主路径
- 可选：`serene/index.html` 顶部通知「站点已迁移至幸福家园」链 `/home/`

- [ ] **Step 1: grep 主路径死链**

```bash
# 在 phone/ home/ city/ 内不应再出现 /system/seat 等
rg "/system/|/serene/|/community/" phone home city bar hongke ending staff index.html || true
```

- [ ] **Step 2: 修残留**

- [ ] **Step 3: Commit**

```bash
git commit -am "chore: cut old serene mainline entrypoints"
```

---

### Task 18: 通关手工验收清单

- [ ] **Step 1: 清空 localStorage `linjiangState`**

- [ ] **Step 2: 按清单点完**

1. 说明页命名 → 手机  
2. 微信/朋友圈见痣 → social  
3. 邮件 → 家园评估  
4. 政府搜弘科两文 → 评论进吧 → F3 看板 HK-SF-03  
5. 讣告+追记 → OA zhouqm/19680315 → 对接单 → F1  
6. 员工 HY-0317/260317 → 处理记录 → 墙 → 你在表上+摄像头  
7. 微信 X 句 → warn → 红字墙 → 三结局之一  

- [ ] **Step 3: `npm test` 全绿**

- [ ] **Step 4: 最终 commit（若有修）**

```bash
git commit -am "fix: playtest gaps for linjiang mainline"
```

---

## Spec 覆盖自检

| Spec 区块 | 任务 |
|-----------|------|
| 说明页+姓名 | T4 |
| 手机/微信/邮件/XHS/浏览器 | T5–T7 |
| 政府少文+搜索+评论+讣告遗像 | T8 |
| 临江吧 | T9 |
| 弘科薄站+F3 | T10 |
| OA+F1+对接单 | T11 |
| 家园公开站 | T12 |
| 员工端爆点1–4+监视+摄像头B | T13–T14 |
| X+Y 红字墙三结局 | T15 |
| 删民俗主路径 | T3 flashInkBleed no-op + T17 |
| 人话术语/真身已处理/骗补/弘科 | 文案任务 T8–T15 |
| 林屿重做图 | T16 |
| 状态与谜题 | T1–T2 |

## 占位扫描

- 账密已在文首常量锁定，无 TBD  
- 测试代码完整给出  
- 大页 HTML 未逐行粘贴全文（避免计划膨胀）；结构、文案要点、grant 点、路由已写死——执行时按要点写满句，勿发明第二套密码  

## 类型/命名一致

- grants: `social|assessment|obit|hongke|bar|oa|board|staff|truth|flagged`  
- puzzles: `oa-login|staff-login|hongke-board`  
- storage: `linjiangState`  

---

## 建议工期体感

| Phase | 内容 |
|-------|------|
| 1 | 半日（纯 JS+测试） |
| 2 | 1 日 |
| 3–4 | 1.5 日 |
| 5–6 | 1.5–2 日 |
| 7 | 0.5–1 日（含生图） |

---

*执行前请确认 spec 仍为用户已批准版本。若只先做可玩垂直切片：完成 Phase 1–2 + Task 8 讣告/OA + Task 11–15 最小链，也可先通关再回填弘科/吧美化。*
