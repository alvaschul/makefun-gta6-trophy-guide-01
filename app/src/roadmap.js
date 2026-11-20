// roadmap.js — the six-stage route to the platinum, drawn as
// highway exit signs. The stages order the whole list the way a
// first playthrough actually unfolds: story first, then the
// character strands, the collectors' loop, the activity grind,
// and the final mile where the golds and the platinum wait.

export const STAGES = [
  {
    exit: 'EXIT 1',
    name: 'First Nights in Vice City',
    blurb: 'The opening hours: Gone Fishing, Chapter 1, and a cocktail with a view before the city swallows you whole.',
    trophyIds: [2, 3, 8, 44],
  },
  {
    exit: 'EXIT 2',
    name: 'The Story Freeway',
    blurb: 'Chapters 2–4 and the big named missions — heists, takedowns and operations. Bank a save before each one.',
    trophyIds: [4, 5, 6, 9, 10, 11, 12, 13, 37, 48],
  },
  {
    exit: 'EXIT 3',
    name: 'Friends & Final Favors',
    blurb: 'Character strands and their final missions. Clear these as they appear — strand finals are the heart of the missable watch.',
    trophyIds: [22, 23, 24, 25, 26, 27, 29],
  },
  {
    exit: 'EXIT 4',
    name: "Collectors' Causeway",
    blurb: 'Cards, quiet spots, new vehicles and new views: the gatherer’s loop across all 52 areas of Leonida.',
    trophyIds: [28, 30, 31, 35, 42, 54, 55],
  },
  {
    exit: 'EXIT 5',
    name: 'Leonida Playground',
    blurb: 'Ranges, races, robberies and ridiculous feats — the activity grind, best driven with the counters running.',
    trophyIds: [15, 16, 17, 18, 19, 20, 21, 32, 33, 34, 36, 38, 39, 40, 41, 43, 45, 46, 47, 49, 50, 51, 52, 53],
  },
  {
    exit: 'EXIT 6',
    name: 'The Final Mile',
    blurb: 'The final mission, the 100% counter, and the legend stamp waiting at the end of the road.',
    trophyIds: [7, 14, 1],
  },
];

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderRoadmap(container, byId, store, onOpen) {
  container.innerHTML = '';
  for (const stage of STAGES) {
    const earnedHere = stage.trophyIds.filter((id) => store.isEarned(id)).length;
    const pct = Math.round((earnedHere / stage.trophyIds.length) * 100);
    const sign = document.createElement('article');
    sign.className = 'exit-sign reveal';
    const chips = stage.trophyIds
      .map((id) => {
        const trophy = byId.get(id);
        if (!trophy) return '';
        const cls = store.isEarned(id) ? 'exit-chip is-earned' : 'exit-chip';
        return `<button type="button" class="${cls}" data-open="${id}">${esc(trophy.name)}</button>`;
      })
      .join('');
    sign.innerHTML = `
      <p class="exit-kicker">${esc(stage.exit)} · ${stage.trophyIds.length} trophies</p>
      <h3 class="exit-name">${esc(stage.name)}</h3>
      <p class="exit-blurb">${esc(stage.blurb)}</p>
      <div class="exit-meter"><div class="exit-meter-fill" style="width:${pct}%"></div></div>
      <p class="exit-count">${earnedHere} of ${stage.trophyIds.length} earned</p>
      <div class="exit-chips">${chips}</div>`;
    sign.querySelectorAll('[data-open]').forEach((chip) => {
      chip.addEventListener('click', () => onOpen(Number(chip.dataset.open)));
    });
    container.appendChild(sign);
  }
}
