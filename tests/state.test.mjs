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
  s.unlock('blog');
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
  s.setEnding('logout');
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
