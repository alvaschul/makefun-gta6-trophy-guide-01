// tracker.js — PLATINUM ROAD's save game.
// Loads the trophy data, owns the player's progress (earned stamps,
// target counters, spoiler shield) in localStorage, and validates
// anything that comes back in through Import.

const STORAGE_KEY = "platinum-road-save-v1";
const DATA_URL = "data/trophies.json";

let trophies = [];
let byId = new Map();
let save = freshSave();
const listeners = new Set();

function freshSave() {
  return { earned: {}, counts: {}, spoiler: false };
}

export async function loadTrophies() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`trophy data failed to load (${res.status})`);
  const data = await res.json();
  trophies = Array.isArray(data.trophies) ? data.trophies : [];
  byId = new Map(trophies.map((t) => [t.id, t]));
  return trophies;
}

export function allTrophies() {
  return trophies;
}

export function trophyById(id) {
  return byId.get(id) || null;
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) save = sanitizeSave(JSON.parse(raw));
  } catch {
    save = freshSave();
  }
  return save;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch {
    /* private mode etc. — the tracker still works for the session */
  }
}

function emit() {
  persist();
  for (const fn of listeners) fn(save);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getSave() {
  return save;
}

export function isEarned(id) {
  return Boolean(save.earned[id]);
}

export function toggleEarned(id) {
  if (save.earned[id]) delete save.earned[id];
  else save.earned[id] = true;
  emit();
}

export function setEarned(id, on) {
  if (on) save.earned[id] = true;
  else delete save.earned[id];
  emit();
}

export function getCount(id) {
  return Number(save.counts[id] || 0);
}

export function setCount(id, value) {
  const trophy = trophyById(id);
  const goal = trophy && trophy.target ? trophy.target.goal : 0;
  const clamped = Math.max(0, Math.min(goal, Math.floor(Number(value) || 0)));
  if (clamped > 0) save.counts[id] = clamped;
  else delete save.counts[id];
  if (goal > 0 && clamped >= goal && !save.earned[id]) save.earned[id] = true;
  emit();
}

export function spoilerOn() {
  return Boolean(save.spoiler);
}

export function setSpoiler(on) {
  save.spoiler = Boolean(on);
  emit();
}

export function progress() {
  const total = trophies.length;
  const earnedCount = trophies.filter((t) => save.earned[t.id]).length;
  const perGrade = {};
  for (const grade of ["platinum", "gold", "silver", "bronze"]) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    perGrade[grade] = {
      earned: inGrade.filter((t) => save.earned[t.id]).length,
      total: inGrade.length,
    };
  }
  return {
    earned: earnedCount,
    total,
    pct: total ? Math.round((earnedCount / total) * 100) : 0,
    perGrade,
  };
}

// Keep only ids the data actually knows about, coerce counts to sane
// numbers, and never let a malformed file poison the save.
export function sanitizeSave(candidate) {
  const clean = freshSave();
  if (!candidate || typeof candidate !== "object") return clean;
  if (candidate.earned && typeof candidate.earned === "object") {
    for (const key of Object.keys(candidate.earned)) {
      const id = Number(key);
      if (byId.has(id) && candidate.earned[key]) clean.earned[id] = true;
    }
  }
  if (candidate.counts && typeof candidate.counts === "object") {
    for (const key of Object.keys(candidate.counts)) {
      const id = Number(key);
      const trophy = byId.get(id);
      const n = Math.floor(Number(candidate.counts[key]));
      if (trophy && trophy.target && Number.isFinite(n) && n > 0) {
        clean.counts[id] = Math.min(n, trophy.target.goal);
      }
    }
  }
  clean.spoiler = Boolean(candidate.spoiler);
  return clean;
}

export function exportSave() {
  return JSON.stringify(
    { app: "platinum-road", version: 1, exportedAt: new Date().toISOString(), save },
    null,
    2,
  );
}

export function importSave(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  const candidate = parsed && parsed.save ? parsed.save : parsed;
  if (!candidate || typeof candidate !== "object" || !("earned" in candidate || "counts" in candidate)) {
    throw new Error("That file does not look like a PLATINUM ROAD progress export.");
  }
  save = sanitizeSave(candidate);
  emit();
  return save;
}

// Shot modes may stage a scene without touching the real save file.
export function stageTransient(mutator) {
  mutator(save);
  for (const fn of listeners) fn(save);
}
