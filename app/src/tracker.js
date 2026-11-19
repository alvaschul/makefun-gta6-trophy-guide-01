// tracker.js — checklist state, localStorage persistence, filtering and
// list rendering for PLATINUM ROAD. Earned trophy ids and per-trophy
// counters live in localStorage; filters cover search, kind (story /
// missable / collectibles / activities / online), grade and earned state.

export const EARNED_KEY = 'platinum-road-earned-v1';
export const COUNTERS_KEY = 'platinum-road-counters-v1';
export const SPOILER_KEY = 'platinum-road-spoiler-v1';

export function loadEarnedIds() {
  try { return new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]')); }
  catch { return new Set(); }
}

export function loadCounters() {
  try { return JSON.parse(localStorage.getItem(COUNTERS_KEY) ?? '{}'); }
  catch { return {}; }
}

export function loadSpoilerSetting() {
  return localStorage.getItem(SPOILER_KEY) === 'on';
}

export function trophyMatchesKindFilter(trophy, kindFilter) {
  if (kindFilter === 'all') return true;
  if (kindFilter === 'missable') return trophy.missable === true;
  // The official list contains no online trophies, so 'online' matches
  // nothing and the list shows its honest empty state.
  return Array.isArray(trophy.kinds) && trophy.kinds.includes(kindFilter);
}

export function isSpoilerMasked(trophy, earnedIds, spoilerOn) {
  if (!spoilerOn || earnedIds.has(trophy.id)) return false;
  const isStory = Array.isArray(trophy.kinds) && trophy.kinds.includes('story');
  return isStory || trophy.vague === true;
}

export function displayNameFor(trophy, earnedIds, spoilerOn) {
  const isStory = Array.isArray(trophy.kinds) && trophy.kinds.includes('story');
  if (isSpoilerMasked(trophy, earnedIds, spoilerOn) && isStory) return 'Hidden story trophy';
  return trophy.name;
}

export function displayDescriptionFor(trophy, earnedIds, spoilerOn) {
  if (isSpoilerMasked(trophy, earnedIds, spoilerOn)) {
    const isStory = Array.isArray(trophy.kinds) && trophy.kinds.includes('story');
    return isStory
      ? 'Hidden story trophy — earn it to reveal.'
      : 'Hidden description — earn this trophy to reveal it.';
  }
  return trophy.description;
}

export function createTracker({ data, elements, onSelectTrophy, onChange }) {
  const state = {
    earnedIds: loadEarnedIds(),
    counters: loadCounters(),
    spoilerOn: loadSpoilerSetting(),
    filters: { search: '', kind: 'all', grade: 'all', earnedState: 'all' },
    selectedId: null,
    persistSeeds: true,
  };

  function saveProgress() {
    if (!state.persistSeeds) return;
    localStorage.setItem(EARNED_KEY, JSON.stringify([...state.earnedIds]));
    localStorage.setItem(COUNTERS_KEY, JSON.stringify(state.counters));
    localStorage.setItem(SPOILER_KEY, state.spoilerOn ? 'on' : 'off');
  }

  function setEarned(id, isEarned) {
    if (isEarned) state.earnedIds.add(id); else state.earnedIds.delete(id);
    saveProgress();
    renderAll();
  }

  function setCounter(id, value) {
    const trophy = data.trophies.find((t) => t.id === id);
    const max = trophy && trophy.target ? trophy.target : Number.MAX_SAFE_INTEGER;
    state.counters[id] = Math.max(0, Math.min(max, Math.floor(Number(value) || 0)));
    saveProgress();
  }

  function visibleTrophies() {
    const { search, kind, grade, earnedState } = state.filters;
    const needle = search.trim().toLowerCase();
    return data.trophies.filter((trophy) => {
      if (!trophyMatchesKindFilter(trophy, kind)) return false;
      if (grade !== 'all' && trophy.grade !== grade) return false;
      if (earnedState === 'earned' && !state.earnedIds.has(trophy.id)) return false;
      if (earnedState === 'unearned' && state.earnedIds.has(trophy.id)) return false;
      if (needle) {
        const haystack = `${trophy.name} ${trophy.description} ${trophy.kind}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }

  function renderProgressSummary() {
    const total = data.trophies.length;
    const earned = state.earnedIds.size;
    const pct = total ? Math.round((earned / total) * 100) : 0;
    elements.progressFill.style.width = `${pct}%`;
    if (elements.roadMarker) elements.roadMarker.style.left = `${pct}%`;
    elements.progressText.textContent = `${earned} of ${total} earned · ${pct}% of the road driven`;
    elements.gradeCounts.replaceChildren();
    for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
      const inGrade = data.trophies.filter((t) => t.grade === grade);
      const got = inGrade.filter((t) => state.earnedIds.has(t.id)).length;
      const span = document.createElement('span');
      span.className = 'grade-count';
      span.textContent = `${grade.toUpperCase()} ${got}/${inGrade.length}`;
      elements.gradeCounts.append(span);
    }
  }

  function buildTrophyCard(trophy, index = 0) {
    const card = document.createElement('article');
    card.className = 'trophy-card'
      + ` grade-${trophy.grade}`
      + (state.earnedIds.has(trophy.id) ? ' is-earned' : '')
      + (state.selectedId === trophy.id ? ' selected' : '');
    // Stagger position for the checklist card entrance animation.
    card.style.setProperty('--i', Math.min(index, 14));

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'trophy-check';
    checkbox.checked = state.earnedIds.has(trophy.id);
    checkbox.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    checkbox.addEventListener('click', (event) => event.stopPropagation());
    checkbox.addEventListener('change', () => setEarned(trophy.id, checkbox.checked));

    const medallion = document.createElement('span');
    medallion.className = `medallion ${trophy.grade}`;
    medallion.textContent = '★';
    medallion.title = trophy.grade;

    const body = document.createElement('div');
    body.className = 'trophy-body';
    const masked = isSpoilerMasked(trophy, state.earnedIds, state.spoilerOn);
    const name = document.createElement('p');
    name.className = 'trophy-name';
    name.textContent = displayNameFor(trophy, state.earnedIds, state.spoilerOn);
    const desc = document.createElement('p');
    desc.className = 'trophy-desc' + (masked ? ' masked-note' : '');
    desc.textContent = displayDescriptionFor(trophy, state.earnedIds, state.spoilerOn);

    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    const addChip = (text, cls) => {
      const chip = document.createElement('span');
      chip.className = `chip ${cls}`;
      chip.textContent = text;
      meta.append(chip);
    };
    addChip(trophy.grade, `grade-${trophy.grade}`);
    for (const kind of trophy.kinds ?? []) addChip(kind, 'kind');
    if (trophy.missable) addChip('⚠ Missable watch', 'missable');
    addChip(`Stage ${trophy.stage}`, 'stage');
    if (trophy.target) addChip(`Target ${trophy.target.toLocaleString('en-US')}`, 'target');
    if (state.earnedIds.has(trophy.id)) addChip('Earned', 'earned-chip');

    body.append(name, desc, meta);
    card.append(checkbox, medallion, body);
    card.addEventListener('click', () => {
      state.selectedId = trophy.id;
      renderList();
      onSelectTrophy(trophy.id);
    });
    return card;
  }

  function renderList() {
    const visible = visibleTrophies();
    elements.trophyList.replaceChildren(...visible.map((trophy, index) => buildTrophyCard(trophy, index)));
    elements.showingCount.textContent = `— showing ${visible.length} of ${data.trophies.length}`;
    if (visible.length === 0) {
      elements.emptyState.hidden = false;
      elements.emptyState.textContent = state.filters.kind === 'online'
        ? 'No online trophies: the official Grand Theft Auto VI PS5 list contains no online trophies, so this filter is honestly empty. Every one of the 55 trophies is earned offline in the list above.'
        : 'No trophies match the current search and filters. Loosen a filter to see more of the road.';
    } else {
      elements.emptyState.hidden = true;
    }
  }

  function renderAll() {
    renderProgressSummary();
    renderList();
    if (state.selectedId != null) onSelectTrophy(state.selectedId, { rerenderOnly: true });
    if (onChange) onChange();
  }

  return { state, saveProgress, setEarned, setCounter, renderAll, renderList, renderProgressSummary, visibleTrophies };
}
