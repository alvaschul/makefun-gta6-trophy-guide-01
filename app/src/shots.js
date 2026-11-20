// shots.js — the ?shot= scenes used for the entry's screenshots.
//
// Each scene seeds a fixed, honest slice of state (a handful of earned
// trophies, a part-filled counter, the shield on) through the store's
// shot seeding, which never writes to the visitor's real saved
// progress. Scenes only arrange state and framing; the page itself is
// the same app a visitor gets.

const SCENES = {
  checklist: {
    bodyClass: "shot shot-checklist",
    seed: { earned: [2, 3, 8, 15, 16, 21, 33, 44], counters: { 15: 132, 17: 27 }, shield: false },
    scrollTo: null,
    openDetailId: null,
  },
  roadmap: {
    bodyClass: "shot shot-roadmap",
    seed: { earned: [2, 3, 4, 8, 9, 22, 15, 16], counters: {}, shield: false },
    scrollTo: "roadmapPanel",
    openDetailId: null,
  },
  guide: {
    bodyClass: "shot shot-guide",
    seed: { earned: [2, 16], counters: { 17: 27 }, shield: false },
    scrollTo: null,
    openDetailId: 17, // The Shootist — silver, counter at 27 of 42
  },
  spoiler: {
    bodyClass: "shot shot-spoiler",
    seed: { earned: [2], counters: {}, shield: true },
    scrollTo: null,
    openDetailId: null,
  },
};

export function shotPlan() {
  const mode = new URLSearchParams(window.location.search).get("shot");
  if (!mode || !SCENES[mode]) return null;
  return SCENES[mode];
}
