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
