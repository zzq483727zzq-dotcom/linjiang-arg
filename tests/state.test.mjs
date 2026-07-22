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
