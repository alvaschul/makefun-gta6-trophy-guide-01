// shots.js — the ?shot= scenarios used for the screenshots.
//
// Each mode stages a believable mid-journey save directly in the
// store's memory: the store is locked first, so staged progress is
// never written over the visitor's real localStorage save. Real
// visitors without a ?shot= parameter never see any of this.

const CHECKLIST_EARNED = [2, 3, 8, 16, 21, 29, 44, 46]; // 8 of 55 ≈ 15%
const SPOILER_EARNED = [2, 16, 21];
const GUIDE_TROPHY_ID = 17; // The Shootist, silver, counter 27 / 42
const GUIDE_COUNT = 27;

export function applyShotMode(store) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return null;

  document.body.classList.add('in-shot', `shot-${shot}`);
  store.lock();
  const state = store.state;

  if (shot === 'checklist' || shot === 'roadmap' || shot === 'guide') {
    for (const id of CHECKLIST_EARNED) state.earned[id] = true;
  }
  if (shot === 'guide') {
    state.counts[GUIDE_TROPHY_ID] = GUIDE_COUNT;
  }
  if (shot === 'spoiler') {
    state.spoiler = true;
    for (const id of SPOILER_EARNED) state.earned[id] = true;
  }
  return shot;
}

export function finishShotMode(shot, openDetail) {
  if (!shot) return;
  if (shot === 'roadmap') {
    const section = document.getElementById('roadmapSection');
    if (section) section.scrollIntoView();
  }
  if (shot === 'guide') {
    openDetail(GUIDE_TROPHY_ID);
  }
}
