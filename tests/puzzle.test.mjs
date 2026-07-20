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
