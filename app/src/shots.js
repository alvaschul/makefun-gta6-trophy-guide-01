// shots.js — the ?shot= screenshot scenarios.
//
// Each mode swaps a prepared, transient state into the store (never saved,
// so a shared ?shot= link cannot touch a real visitor's progress) and then
// frames the view the hand-in screenshot needs: the checklist from the top,
// the roadmap signs, one open guide, or the spoiler shield doing its job.

export function readShotMode() {
  return new URLSearchParams(window.location.search).get("shot");
}

function settle(fn, delay = 90) {
  window.setTimeout(fn, delay);
}

export function applyShotMode(mode, { store, openDetail }) {
  // Compact framing so the top of the page and the checklist share the
  // 1280x720 screenshot (see the .in-shot rules in style.css).
  document.documentElement.classList.add("in-shot");
  switch (mode) {
    case "checklist": {
      store.applyScenario({
        earned: [2, 3, 4, 5, 8, 9, 16, 21],
        counts: { 15: 86, 31: 23, 35: 41 },
        shield: false,
      });
      settle(() => window.scrollTo(0, 0));
      break;
    }
    case "roadmap": {
      store.applyScenario({
        earned: [2, 3, 4, 5, 6, 8, 22],
        counts: { 28: 6 },
        shield: false,
      });
      settle(() => {
        document.getElementById("roadmap-sec")?.scrollIntoView({ block: "start" });
      });
      break;
    }
    case "guide": {
      // The Shootist: silver, with its 42-gold counter part-filled at 27.
      store.applyScenario({
        earned: [2, 3],
        counts: { 17: 27 },
        shield: false,
      });
      settle(() => openDetail(17), 140);
      break;
    }
    case "spoiler": {
      store.applyScenario({ earned: [], counts: {}, shield: true });
      settle(() => window.scrollTo(0, 0));
      break;
    }
    default:
      break;
  }
}
