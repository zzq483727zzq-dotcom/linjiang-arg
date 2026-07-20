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
