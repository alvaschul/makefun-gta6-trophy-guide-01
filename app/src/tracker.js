// tracker.js — trophy data loading and the localStorage progress store.
//
// Progress lives under one versioned key and holds three things: the
// set of earned trophy ids, the per-trophy counter values, and whether
// the spoiler shield is on. Everything the UI shows derives from this
// store plus the static trophy data; nothing ever leaves the browser
// except through the explicit Export button.

export const STORE_KEY = "platinum-road-progress-v1";

export async function loadTrophies(url = "data/trophies.json") {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`trophy data failed to load (${response.status})`);
  const data = await response.json();
  if (!data || !Array.isArray(data.trophies)) throw new Error("trophy data is malformed");
  return data.trophies;
}

function blankProgress() {
  return { earned: [], counters: {}, shield: false };
}

function sanitise(raw, trophies) {
  const known = new Set(trophies.map((t) => t.id));
  const clean = blankProgress();
  if (!raw || typeof raw !== "object") return clean;
  if (Array.isArray(raw.earned)) {
    clean.earned = [...new Set(raw.earned.filter((id) => known.has(id)))];
  }
  if (raw.counters && typeof raw.counters === "object") {
    for (const trophy of trophies) {
      if (!trophy.target) continue;
      const value = Number(raw.counters[trophy.id]);
      if (Number.isFinite(value) && value > 0) {
        clean.counters[trophy.id] = Math.min(Math.floor(value), trophy.target.total);
      }
    }
  }
  clean.shield = raw.shield === true;
  return clean;
}

export function createStore(trophies, storage = window.localStorage) {
  let progress = blankProgress();
  try {
    const saved = storage.getItem(STORE_KEY);
    if (saved) progress = sanitise(JSON.parse(saved), trophies);
  } catch {
    progress = blankProgress();
  }

  const earnedSet = new Set(progress.earned);
  const listeners = new Set();

  function persist() {
    progress.earned = [...earnedSet];
    try {
      storage.setItem(STORE_KEY, JSON.stringify(progress));
    } catch {
      // Private-mode storage can refuse writes; the in-memory state
      // still drives the page for this session.
    }
    for (const listener of listeners) listener();
  }

  return {
    isEarned: (id) => earnedSet.has(id),
    toggleEarned(id) {
      if (earnedSet.has(id)) earnedSet.delete(id);
      else earnedSet.add(id);
      persist();
    },
    setEarned(id, on) {
      if (on) earnedSet.add(id);
      else earnedSet.delete(id);
      persist();
    },
    earnedCount: () => earnedSet.size,
    earnedIds: () => [...earnedSet],
    counter(id) {
      return progress.counters[id] ?? 0;
    },
    bumpCounter(trophy, delta) {
      if (!trophy.target) return;
      const step = trophy.target.step || 1;
      const next = Math.max(0, Math.min(trophy.target.total, (progress.counters[trophy.id] ?? 0) + delta * step));
      if (next > 0) progress.counters[trophy.id] = next;
      else delete progress.counters[trophy.id];
      if (next >= trophy.target.total) earnedSet.add(trophy.id);
      persist();
    },
    shield: () => progress.shield,
    setShield(on) {
      progress.shield = on === true;
      persist();
    },
    snapshot() {
      return JSON.stringify(
        { app: "platinum-road", version: 1, earned: [...earnedSet], counters: progress.counters, shield: progress.shield },
        null,
        2
      );
    },
    restore(text) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return { ok: false, message: "That file is not valid JSON." };
      }
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.earned)) {
        return { ok: false, message: "That file does not look like PLATINUM ROAD progress." };
      }
      progress = sanitise(parsed, trophies);
      earnedSet.clear();
      for (const id of progress.earned) earnedSet.add(id);
      persist();
      return { ok: true, message: `Imported ${earnedSet.size} earned trophies.` };
    },
    // Shot modes seed a fixed scene without touching saved progress:
    // they replace the in-memory state and mute persistence.
    seedForShot({ earned = [], counters = {}, shield = false }) {
      earnedSet.clear();
      for (const id of earned) earnedSet.add(id);
      progress.counters = { ...counters };
      progress.shield = shield;
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
