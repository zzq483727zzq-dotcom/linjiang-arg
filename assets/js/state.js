// state.js - 浏览器/Node 通用状态引擎

const DEFAULTS = {
  unlocked: ['serene-home'],
  corruption: 0,
  ending: null,
  visits: {}
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
