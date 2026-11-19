// guides.js — the trophy detail panel: official description, grade
// medallion, kind chips, missable flag, target counter, the guide in our
// own words, and the sources line that every guide must carry.

import { displayNameFor, displayDescriptionFor, isSpoilerMasked } from './tracker.js';

export function renderTrophyDetail({ panel, trophy, tracker }) {
  const { state } = tracker;
  const earned = state.earnedIds.has(trophy.id);
  const masked = isSpoilerMasked(trophy, state.earnedIds, state.spoilerOn);
  const isStory = Array.isArray(trophy.kinds) && trophy.kinds.includes('story');
  panel.replaceChildren();

  const head = document.createElement('div');
  head.className = 'detail-head';
  const medallion = document.createElement('span');
  medallion.className = `medallion big ${trophy.grade}`;
  medallion.textContent = '★';
  const title = document.createElement('h3');
  title.textContent = displayNameFor(trophy, state.earnedIds, state.spoilerOn);
  head.append(medallion, title);
  panel.append(head);

  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const addChip = (text, cls) => {
    const chip = document.createElement('span');
    chip.className = `chip ${cls}`;
    chip.textContent = text;
    meta.append(chip);
  };
  addChip(trophy.grade, `grade-${trophy.grade}`);
  addChip(trophy.kind, 'kind');
  for (const kind of trophy.kinds ?? []) if (kind !== trophy.kind) addChip(kind, 'kind');
  if (trophy.missable) addChip('⚠ Missable watch', 'missable');
  addChip(`Roadmap stage ${trophy.stage}`, 'stage');
  panel.append(meta);

  const officialTitle = document.createElement('h4');
  officialTitle.textContent = 'Official description';
  const official = document.createElement('p');
  official.className = 'detail-official' + (masked ? ' masked-note' : '');
  official.textContent = displayDescriptionFor(trophy, state.earnedIds, state.spoilerOn);
  panel.append(officialTitle, official);

  if (trophy.missable) {
    const warning = document.createElement('p');
    warning.className = 'detail-official';
    warning.textContent = 'MISSABLE WATCH: flagged from the official description as a one-time mission, a concluding character strand or a one-off scene. Clear it before the final mission / point of no return.';
    panel.append(warning);
  }

  if (trophy.target) {
    const counterTitle = document.createElement('h4');
    counterTitle.textContent = `Progress — ${trophy.targetLabel ?? 'target'}`;
    const box = document.createElement('div');
    box.className = 'counter-box';
    const minus = document.createElement('button');
    minus.type = 'button'; minus.textContent = '−'; minus.setAttribute('aria-label', 'Decrease count');
    const plus = document.createElement('button');
    plus.type = 'button'; plus.textContent = '+'; plus.setAttribute('aria-label', 'Increase count');
    const step = trophy.target >= 1000 ? 1000 : 1;
    const value = document.createElement('span');
    value.className = 'counter-value';
    const paint = () => {
      const current = state.counters[trophy.id] ?? 0;
      value.textContent = `${current.toLocaleString('en-US')} / ${trophy.target.toLocaleString('en-US')}`;
    };
    minus.addEventListener('click', () => { tracker.setCounter(trophy.id, (state.counters[trophy.id] ?? 0) - step); paint(); });
    plus.addEventListener('click', () => { tracker.setCounter(trophy.id, (state.counters[trophy.id] ?? 0) + step); paint(); });
    const input = document.createElement('input');
    input.type = 'number'; input.className = 'counter-input'; input.min = '0'; input.max = String(trophy.target);
    input.value = String(state.counters[trophy.id] ?? 0);
    input.setAttribute('aria-label', 'Set count directly');
    input.addEventListener('change', () => { tracker.setCounter(trophy.id, input.value); input.value = String(state.counters[trophy.id] ?? 0); paint(); });
    paint();
    box.append(minus, value, plus, input);
    panel.append(counterTitle, box);
  }

  const guideTitle = document.createElement('h4');
  guideTitle.textContent = 'Guide — in our own words';
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = masked
    ? (isStory
      ? 'Guide hidden by the spoiler shield until this story trophy is earned. Tick it off when you earn it and the full guide reveals itself.'
      : 'Guide hidden by the spoiler shield until this trophy is earned.')
    : trophy.guide;
  const sources = document.createElement('p');
  sources.className = 'detail-sources';
  sources.textContent = trophy.sources;
  panel.append(guideTitle, guide, sources);

  const earnLabel = document.createElement('label');
  earnLabel.className = 'detail-earn';
  const earnBox = document.createElement('input');
  earnBox.type = 'checkbox';
  earnBox.checked = earned;
  earnBox.addEventListener('change', () => tracker.setEarned(trophy.id, earnBox.checked));
  earnLabel.append(earnBox, document.createTextNode(earned ? 'Earned — nice driving.' : 'Mark as earned'));
  panel.append(earnLabel);
}

export function renderDetailPlaceholder(panel) {
  panel.replaceChildren();
  const note = document.createElement('p');
  note.className = 'placeholder';
  note.textContent = 'Pick any trophy on the road to open its guide: the official description, its target counter, the missable check and the cited guide in our own words.';
  panel.append(note);
}
