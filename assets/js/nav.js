import { createState, createLocalStorageAdapter } from './state.js';
import { checkPuzzle } from './puzzle.js';

let _state;

export function getState() {
  if (typeof window !== 'undefined') {
    if (!window.__linjiang_state) {
      window.__linjiang_state = createState({ adapter: createLocalStorageAdapter() });
    }
    return window.__linjiang_state;
  }
  if (!_state) _state = createState();
  return _state;
}

export function boot(pageId) {
  const s = getState();
  if (s && pageId) s.flagVisit(pageId);
}

// alias used by some old pages
export function bootPage(pageId) {
  return boot(pageId);
}

export function resetProgress() {
  getState()?.reset();
}

export function tryPuzzle(id, input, attemptCount = 1) {
  const result = checkPuzzle(id, input, attemptCount);
  if (result.ok) {
    const s = getState();
    if (id === 'oa-login') s?.grant('oa');
    if (id === 'staff-login') s?.grant('staff');
    if (id === 'hongke-board') s?.grant('board');
  }
  return result;
}

// Compat shims for pages that may still import old names — no-ops or mapped grants
export function recordStoryRead() { getState()?.grant('social'); }
export function recordChatRead() { getState()?.grant('social'); }
export function recordAssessment() { getState()?.grant('assessment'); }
export function flashInkBleed() { /* folk ink effect removed */ }

// optional: if something still imports these, don't throw
export function unlock() {}
export function tryVisit(siteId) { boot(siteId); }
export function corruption() { return 0; }
export function bumpCorruption() {}
export function tryAdminPassword() {
  return { ok: false, hint: '已废弃' };
}
