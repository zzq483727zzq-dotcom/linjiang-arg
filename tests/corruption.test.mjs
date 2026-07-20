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
