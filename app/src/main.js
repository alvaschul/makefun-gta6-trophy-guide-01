// main.js — PLATINUM ROAD entry point. Loads the official trophy data,
// wires the tracker (checklist, filters, spoiler shield, export/import),
// the guide detail panel, the roadmap, and the deterministic ?shot=
// screenshot modes. Everything runs offline from static files.

import { createTracker } from './tracker.js';
import { renderTrophyDetail, renderDetailPlaceholder } from './guides.js';
import { renderRoadmap } from './roadmap.js';
import { applyShotMode } from './shots.js';
import { initMotion } from './motion.js';

const elements = {
  progressFill: document.getElementById('progressFill'),
  roadMarker: document.getElementById('roadMarker'),
  progressText: document.getElementById('progressText'),
  gradeCounts: document.getElementById('gradeCounts'),
  trophyList: document.getElementById('trophyList'),
  showingCount: document.getElementById('showingCount'),
  emptyState: document.getElementById('emptyState'),
  detailPanel: document.getElementById('detailPanel'),
  roadmapStages: document.getElementById('roadmapStages'),
  searchInput: document.getElementById('searchInput'),
  kindFilter: document.getElementById('kindFilter'),
  gradeFilter: document.getElementById('gradeFilter'),
  stateFilter: document.getElementById('stateFilter'),
  spoilerToggle: document.getElementById('spoilerToggle'),
  exportButton: document.getElementById('exportButton'),
  importInput: document.getElementById('importInput'),
};

const data = await (await fetch('data/trophies.json')).json();

function selectTrophy(id, options = {}) {
  const trophy = data.trophies.find((t) => t.id === id);
  if (!trophy) return;
  tracker.state.selectedId = id;
  renderTrophyDetail({ panel: elements.detailPanel, trophy, tracker });
  if (options.scrollToList) {
    elements.detailPanel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  if (!options.rerenderOnly) tracker.renderList();
}

const tracker = createTracker({
  data,
  elements,
  onSelectTrophy: (id, options) => selectTrophy(id, options),
  onChange: () => refreshRoadmap(),
});

function refreshRoadmap() {
  renderRoadmap({
    container: elements.roadmapStages,
    data,
    tracker,
    onSelectTrophy: (id, options) => selectTrophy(id, options),
  });
}

// ---- Controls ------------------------------------------------------------
elements.searchInput.addEventListener('input', () => {
  tracker.state.filters.search = elements.searchInput.value;
  tracker.renderList();
});
elements.kindFilter.addEventListener('change', () => {
  tracker.state.filters.kind = elements.kindFilter.value;
  tracker.renderList();
});
elements.gradeFilter.addEventListener('change', () => {
  tracker.state.filters.grade = elements.gradeFilter.value;
  tracker.renderList();
});
elements.stateFilter.addEventListener('change', () => {
  tracker.state.filters.earnedState = elements.stateFilter.value;
  tracker.renderList();
});
elements.spoilerToggle.checked = tracker.state.spoilerOn;
elements.spoilerToggle.addEventListener('change', () => {
  tracker.state.spoilerOn = elements.spoilerToggle.checked;
  tracker.saveProgress();
  tracker.renderAll();
});

// ---- Export / import ------------------------------------------------------
elements.exportButton.addEventListener('click', () => {
  const payload = {
    game: data.game,
    platform: data.platform,
    exportedFrom: 'PLATINUM ROAD — Leonida Trophy Guide & Tracker',
    earned: [...tracker.state.earnedIds],
    counters: tracker.state.counters,
    spoilerShield: tracker.state.spoilerOn,
  };
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  link.download = 'platinum-road-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
});

elements.importInput.addEventListener('change', async () => {
  const file = elements.importInput.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const rawEarned = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(rawEarned)) throw new Error('no earned list');
    const ids = new Set();
    for (const entry of rawEarned) {
      if (typeof entry === 'number' && data.trophies.some((t) => t.id === entry)) ids.add(entry);
      if (typeof entry === 'string') {
        const byName = data.trophies.find((t) => t.name === entry);
        if (byName) ids.add(byName.id);
      }
    }
    tracker.state.earnedIds = ids;
    if (!Array.isArray(parsed) && parsed.counters && typeof parsed.counters === 'object') {
      tracker.state.counters = parsed.counters;
    }
    tracker.saveProgress();
    tracker.renderAll();
  } catch {
    window.alert('That file is not a PLATINUM ROAD progress export. Nothing was changed.');
  }
  elements.importInput.value = '';
});

// ---- First paint -----------------------------------------------------------
renderDetailPlaceholder(elements.detailPanel);
tracker.renderAll();
applyShotMode({ tracker, elements, selectTrophy });
refreshRoadmap();
initMotion({
  signTitle: document.getElementById('signTitle'),
  roadmapStages: elements.roadmapStages,
});
