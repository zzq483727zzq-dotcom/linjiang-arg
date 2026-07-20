// nav.js - 站点门禁与解锁
import { createState, createLocalStorageAdapter } from './state.js';
import { checkPuzzle } from './puzzle.js';

export function getState() {
  if (typeof window !== 'undefined' && !window.__serene_state) {
    window.__serene_state = createState({ adapter: createLocalStorageAdapter() });
  }
  return window.__serene_state;
}

export function unlock(siteId) { getState().unlock(siteId); }
export function corruption() { return getState().corruption(); }
export function bumpCorruption(d = 1) { getState().bumpCorruption(d); }
export function tryAdminPassword(input) { return checkPuzzle('admin-password', input); }

export function tryVisit(siteId) {
  const s = getState();
  s.recordVisit(siteId);
  if (siteId === 'blog')   { s.unlock('forum'); bumpCorruption(1); }
  if (siteId === 'forum')  { s.unlock('wechat'); }
  if (siteId === 'wechat') { s.unlock('social'); }
  if (siteId === 'admin')  { s.unlock('endings'); bumpCorruption(1); }
  if (siteId === 'endings') { /* no-op */ }
}

export function bootPage(siteId) {
  const s = getState();
  tryVisit(siteId);
  import('./corruption.js').then(mod => {
    mod.applyCorruption(s.corruption());
  });
}
