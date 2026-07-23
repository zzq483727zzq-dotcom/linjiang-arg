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
