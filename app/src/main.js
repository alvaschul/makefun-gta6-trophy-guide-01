// main.js — boots PLATINUM ROAD: loads the trophy data, builds the
// store, paints the masthead stats, the checklist, the roadmap and
// the missable watch, and wires the dash panel (search, filters,
// spoiler shield, export / import) to all of it.

import { createStore, validateSave, blankState, formatCount } from './tracker.js';
import { initDetail, openDetail } from './guides.js';
import { renderRoadmap } from './roadmap.js';
import { applyShotMode, finishShotMode } from './shots.js';
import { initMotion } from './motion.js';

const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

async function boot() {
  const els = {
    roadFill: document.getElementById('roadFill'),
    pctText: document.getElementById('pctText'),
    gradeCounts: document.getElementById('gradeCounts'),
    earnedLine: document.getElementById('earnedLine'),
    q: document.getElementById('q'),
    kind: document.getElementById('kindFilter'),
    grade: document.getElementById('gradeFilter'),
    state: document.getElementById('stateFilter'),
    spoiler: document.getElementById('spoilerToggle'),
    missableOnly: document.getElementById('missableToggle'),
    exportBtn: document.getElementById('exportBtn'),
    importFile: document.getElementById('importFile'),
    resetBtn: document.getElementById('resetBtn'),
    note: document.getElementById('dashNote'),
    grid: document.getElementById('grid'),
    empty: document.getElementById('emptyState'),
    stages: document.getElementById('stageList'),
    watch: document.getElementById('watchList'),
    overlay: document.getElementById('detailOverlay'),
    dBody: document.getElementById('dBody'),
    dClose: document.getElementById('dClose'),
  };

  const response = await fetch('./data/trophies.json');
  const data = await response.json();
  const trophies = data.trophies;
  const byId = new Map(trophies.map((t) => [t.id, t]));
  const store = createStore(new Set(byId.keys()));

  const shot = applyShotMode(store);
  els.spoiler.checked = store.state.spoiler === true;

  const isMasked = (trophy) =>
    store.state.spoiler === true && trophy.kind === 'story' && !store.isEarned(trophy.id);

  let noteTimer = null;
  function showNote(text) {
    els.note.textContent = text;
    if (noteTimer) clearTimeout(noteTimer);
    noteTimer = setTimeout(() => {
      els.note.textContent = '';
    }, 5000);
  }

  function renderProgress() {
    const earnedCount = trophies.filter((t) => store.isEarned(t.id)).length;
    const pct = Math.round((earnedCount / trophies.length) * 100);
    els.roadFill.style.width = pct + '%';
    els.pctText.textContent = pct + '%';
    els.gradeCounts.innerHTML = GRADES.map((grade) => {
      const inGrade = trophies.filter((t) => t.grade === grade);
      const got = inGrade.filter((t) => store.isEarned(t.id)).length;
      return `<li class="gc-${grade}">${gradeLabel(grade)} <b>${got}/${inGrade.length}</b></li>`;
    }).join('');
    els.earnedLine.textContent =
      earnedCount === trophies.length
        ? 'Every mile driven — Leonida Legend status achieved.'
        : `${earnedCount} of ${trophies.length} trophies earned · ${trophies.length - earnedCount} still down the road.`;
  }

  function currentFilters() {
    return {
      q: els.q.value.trim().toLowerCase(),
      kind: els.kind.value,
      grade: els.grade.value,
      state: els.state.value,
      missableOnly: els.missableOnly.checked,
    };
  }

  function matches(trophy, f) {
    if (f.kind !== 'all' && trophy.kind !== f.kind) return false;
    if (f.grade !== 'all' && trophy.grade !== f.grade) return false;
    if (f.state === 'earned' && !store.isEarned(trophy.id)) return false;
    if (f.state === 'unearned' && store.isEarned(trophy.id)) return false;
    if (f.missableOnly && !trophy.missable) return false;
    if (f.q) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
      if (!haystack.includes(f.q)) return false;
    }
    return true;
  }

  function counterHtml(trophy) {
    if (!trophy.target) return '';
    const value = store.getCount(trophy.id);
    return `
      <div class="counter-row">
        <button type="button" class="counter-btn" data-count="-1" data-id="${trophy.id}" aria-label="Decrease counter for ${esc(trophy.name)}">−</button>
        <span class="counter-val"><b>${esc(formatCount(trophy, value))}</b> / ${esc(formatCount(trophy, trophy.target.goal))} ${esc(trophy.target.unit)}</span>
        <button type="button" class="counter-btn" data-count="1" data-id="${trophy.id}" aria-label="Increase counter for ${esc(trophy.name)}">+</button>
      </div>`;
  }

  function renderGrid() {
    const f = currentFilters();
    const visible = trophies.filter((t) => matches(t, f));
    els.grid.innerHTML = '';
    for (const trophy of visible) {
      const earned = store.isEarned(trophy.id);
      const masked = isMasked(trophy);
      const card = document.createElement('div');
      card.className = `marker grade-${trophy.grade} reveal${earned ? ' is-earned' : ''}`;
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      card.setAttribute('aria-label', `${trophy.name} — open detail view`);
      card.innerHTML = `
        <span class="marker-tab">
          <span class="marker-mile">${trophy.id}</span>
          <span class="marker-grade">${esc(trophy.grade)}</span>
        </span>
        <span class="marker-body">
          <span class="marker-name${masked ? ' masked-text' : ''}">${masked ? '████████' : esc(trophy.name)}</span>
          <span class="marker-desc${masked ? ' masked-text' : ''}">${masked ? 'Hidden by the Spoiler Shield — earn it or switch the shield off.' : esc(trophy.description)}</span>
          <span class="marker-meta">
            <span class="chip chip-kind">${esc(trophy.kind)}</span>
            ${trophy.missable ? '<span class="chip chip-miss">Missable watch</span>' : ''}
          </span>
          <span class="marker-guide">${esc(trophy.guide)}</span>
          ${counterHtml(trophy)}
        </span>
        ${earned ? '<span class="stamp">Earned</span>' : ''}`;
      card.addEventListener('click', () => openDetail(trophy.id));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetail(trophy.id);
        }
      });
      card.querySelectorAll('[data-count]').forEach((btn) => {
        btn.addEventListener('click', (event) => {
          event.stopPropagation();
          const delta = Number(btn.dataset.count) * trophy.target.step;
          store.setCount(trophy.id, store.getCount(trophy.id) + delta, trophy);
          renderAll();
        });
      });
      els.grid.appendChild(card);
    }
    if (visible.length === 0) {
      const f2 = currentFilters();
      els.empty.hidden = false;
      els.empty.textContent =
        f2.kind === 'online'
          ? 'No trophies on the official PS5 list are online trophies — this road is driven solo, so the online filter honestly has nothing to show.'
          : 'No mile markers match those dash settings. Loosen a filter or clear the search to see the road again.';
    } else {
      els.empty.hidden = true;
    }
  }

  function renderWatch() {
    els.watch.innerHTML = '';
    for (const trophy of trophies.filter((t) => t.missable)) {
      const earned = store.isEarned(trophy.id);
      const row = document.createElement('button');
      row.type = 'button';
      row.className = `watch-row reveal${earned ? ' is-earned' : ''}`;
      row.innerHTML = `
        <span>
          <span class="watch-name">${esc(trophy.name)}</span><br>
          <span class="watch-desc">${esc(trophy.description)}</span>
        </span>
        <span class="watch-state">${earned ? 'Earned' : 'Open'}</span>`;
      row.addEventListener('click', () => openDetail(trophy.id));
      els.watch.appendChild(row);
    }
  }

  function renderAll() {
    renderProgress();
    renderGrid();
    renderRoadmap(els.stages, byId, store, openDetail);
    renderWatch();
  }

  initDetail(els.overlay, els.dBody, els.dClose, {
    getTrophy: (id) => byId.get(id),
    isEarned: (id) => store.isEarned(id),
    isMasked,
    getCount: (id) => store.getCount(id),
    onToggleEarned: (id) => {
      store.toggleEarned(id);
      renderAll();
    },
    onSetCount: (id, value) => {
      store.setCount(id, value, byId.get(id));
      renderAll();
    },
  });

  [els.q, els.kind, els.grade, els.state, els.missableOnly].forEach((control) => {
    control.addEventListener('input', renderGrid);
    control.addEventListener('change', renderGrid);
  });
  els.spoiler.addEventListener('change', () => {
    store.setSpoiler(els.spoiler.checked);
    renderAll();
    showNote(els.spoiler.checked ? 'Spoiler Shield on — unearned story trophies are masked.' : 'Spoiler Shield off — everything is visible.');
  });
  els.exportBtn.addEventListener('click', () => {
    const blob = new Blob([store.exportText()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'platinum-road-save.json';
    link.click();
    URL.revokeObjectURL(url);
    showNote('Save exported as platinum-road-save.json.');
  });
  els.importFile.addEventListener('change', async () => {
    const file = els.importFile.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const cleaned = validateSave(parsed, new Set(byId.keys()));
      if (!cleaned) throw new Error('not a PLATINUM ROAD save');
      store.replace(cleaned);
      els.spoiler.checked = cleaned.spoiler;
      renderAll();
      showNote('Save imported — welcome back to the road.');
    } catch {
      showNote('That file is not a valid PLATINUM ROAD save; nothing was changed.');
    }
    els.importFile.value = '';
  });
  els.resetBtn.addEventListener('click', () => {
    if (!window.confirm('Reset all progress, counters and settings?')) return;
    store.replace(blankState());
    els.spoiler.checked = false;
    renderAll();
    showNote('Progress reset — a fresh tank and an open road.');
  });

  renderAll();
  finishShotMode(shot, openDetail);
  initMotion();
}

boot().catch((error) => {
  console.error('PLATINUM ROAD failed to start:', error);
  const note = document.getElementById('dashNote');
  if (note) note.textContent = 'The guide failed to load its trophy data. Try a hard refresh.';
});
