// tracker.js — trophy data loading plus the progress store.
//
// The store keeps three things: which trophies are earned, the per-trophy
// target counters (stunts done, vaults robbed, dollars laundered…), and
// whether the spoiler shield is up. For real visitors it persists to
// localStorage; screenshot scenarios can swap in a transient state that is
// never written to disk.

const SAVE_KEY = "platinum-road-save-v1";

export async function loadTrophies(url = "data/trophies.json") {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load the trophy list (HTTP ${res.status}).`);
  const data = await res.json();
  if (!data || !Array.isArray(data.trophies)) throw new Error("The trophy list file is malformed.");
  return data.trophies;
}

// Clean an untrusted save object (from localStorage or an imported file)
// against the real trophy list. Returns a usable state, or null when the
// shape is not a save at all.
export function validateSave(raw, trophies) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  if (typeof raw.earned !== "object" || raw.earned === null) return null;
  if (typeof raw.counts !== "object" || raw.counts === null) return null;

  const byId = new Map(trophies.map((t) => [t.id, t]));
  const earned = {};
  for (const key of Object.keys(raw.earned)) {
    const id = Number(key);
    if (byId.has(id) && raw.earned[key]) earned[id] = true;
  }
  const counts = {};
  for (const key of Object.keys(raw.counts)) {
    const id = Number(key);
    const trophy = byId.get(id);
    const value = Math.floor(Number(raw.counts[key]));
    if (!trophy || !Number.isFinite(value) || value < 0) continue;
    counts[id] = trophy.target ? Math.min(value, trophy.target) : value;
  }
  return { earned, counts, shield: raw.shield === true };
}

export function createStore(trophies) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const listeners = new Set();
  let transient = false;
  let state = { earned: {}, counts: {}, shield: false };

  try {
    const saved = window.localStorage.getItem(SAVE_KEY);
    if (saved) {
      const cleaned = validateSave(JSON.parse(saved), trophies);
      if (cleaned) state = cleaned;
    }
  } catch {
    // Storage unavailable or corrupt: start fresh, stay silent.
  }

  function persist() {
    if (transient) return;
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      // Private modes and full quotas should never break the tracker.
    }
  }

  function notify() {
    persist();
    for (const fn of listeners) fn();
  }

  return {
    trophies,
    byId,

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    get shield() {
      return state.shield;
    },

    setShield(on) {
      state.shield = on === true;
      notify();
    },

    isEarned(id) {
      return state.earned[id] === true;
    },

    toggleEarned(id) {
      if (state.earned[id]) delete state.earned[id];
      else state.earned[id] = true;
      notify();
      return state.earned[id] === true;
    },

    setEarned(id, on) {
      if (on) state.earned[id] = true;
      else delete state.earned[id];
      notify();
    },

    count(id) {
      return state.counts[id] ?? 0;
    },

    setCount(id, value) {
      const trophy = byId.get(id);
      if (!trophy) return;
      let next = Math.max(0, Math.floor(Number(value) || 0));
      if (trophy.target) next = Math.min(next, trophy.target);
      if (next === 0) delete state.counts[id];
      else state.counts[id] = next;
      notify();
    },

    earnedCount() {
      return Object.keys(state.earned).length;
    },

    earnedOf(trophyList) {
      return trophyList.filter((t) => state.earned[t.id]).length;
    },

    // Replace the whole state for a screenshot scenario. Transient: nothing
    // is persisted, so a ?shot= link can never touch a visitor's real save.
    applyScenario({ earned = [], counts = {}, shield = false }) {
      transient = true;
      state = {
        earned: Object.fromEntries(earned.filter((id) => byId.has(id)).map((id) => [id, true])),
        counts: { ...counts },
        shield: shield === true,
      };
      notify();
    },

    exportJson() {
      return JSON.stringify(
        { app: "platinum-road", version: 1, earned: state.earned, counts: state.counts, shield: state.shield },
        null,
        2,
      );
    },

    importJson(text) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return { ok: false, message: "That file is not valid JSON — import cancelled, your progress is untouched." };
      }
      const cleaned = validateSave(parsed, trophies);
      if (!cleaned) {
        return { ok: false, message: "That file does not look like a PLATINUM ROAD save — import cancelled, your progress is untouched." };
      }
      state = cleaned;
      notify();
      return { ok: true, message: `Progress imported: ${Object.keys(cleaned.earned).length} trophies earned.` };
    },
  };
}
