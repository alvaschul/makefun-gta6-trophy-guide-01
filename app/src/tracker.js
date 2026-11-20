// tracker.js — the save-game store for PLATINUM ROAD.
//
// Progress lives in localStorage under one key as plain JSON:
//   { earned: { "17": true, ... }, counts: { "17": 27, ... }, spoiler: false }
// Everything read back from storage (or from an imported file) goes
// through validateSave, so a corrupted or hand-edited save can never
// smuggle in unknown trophy ids or nonsense counter values.

const STORAGE_KEY = 'platinum-road-save-v1';

export function blankState() {
  return { earned: {}, counts: {}, spoiler: false };
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateSave(raw, validIds) {
  if (!isPlainObject(raw)) return null;
  const state = blankState();
  if (isPlainObject(raw.earned)) {
    for (const [key, value] of Object.entries(raw.earned)) {
      const id = Number(key);
      if (validIds.has(id) && value === true) state.earned[id] = true;
    }
  }
  if (isPlainObject(raw.counts)) {
    for (const [key, value] of Object.entries(raw.counts)) {
      const id = Number(key);
      if (validIds.has(id) && Number.isFinite(value) && value >= 0) {
        state.counts[id] = Math.floor(value);
      }
    }
  }
  state.spoiler = raw.spoiler === true;
  return state;
}

export function formatCount(trophy, value) {
  if (trophy.target && trophy.target.unit.startsWith('dollars')) {
    return '$' + value.toLocaleString('en-US');
  }
  return String(value);
}

export function createStore(validIds) {
  let state = blankState();
  let locked = false;

  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (text) {
      const parsed = validateSave(JSON.parse(text), validIds);
      if (parsed) state = parsed;
    }
  } catch {
    // Corrupted storage is not worth crashing the guide over.
    state = blankState();
  }

  function persist() {
    if (locked) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private browsing and friends: the guide still works in memory.
    }
  }

  return {
    get state() {
      return state;
    },
    // Shot modes flip the lock so staged progress never overwrites
    // the visitor's real save.
    lock() {
      locked = true;
    },
    replace(next) {
      state = next;
      persist();
    },
    isEarned(id) {
      return state.earned[id] === true;
    },
    toggleEarned(id) {
      if (state.earned[id]) delete state.earned[id];
      else state.earned[id] = true;
      persist();
      return state.earned[id] === true;
    },
    getCount(id) {
      return state.counts[id] ?? 0;
    },
    setCount(id, value, trophy) {
      const goal = trophy && trophy.target ? trophy.target.goal : Infinity;
      const next = Math.max(0, Math.min(goal, Math.floor(value) || 0));
      if (next === 0) delete state.counts[id];
      else state.counts[id] = next;
      persist();
      return next;
    },
    setSpoiler(on) {
      state.spoiler = on === true;
      persist();
    },
    exportText() {
      return JSON.stringify({ app: 'platinum-road', version: 1, ...state }, null, 2);
    },
  };
}
