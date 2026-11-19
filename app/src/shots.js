// shots.js — deterministic ?shot= modes used for the entry screenshots.
// Each mode seeds an earned set and counters, sets filters / the spoiler
// shield, and opens a panel, so a screenshot always shows the same state:
//   ?shot=checklist  cover: top of page — masthead, progress, controls,
//                    earned trophies and a guide open beside the list
//   ?shot=roadmap    the roadmap section scrolled into view
//   ?shot=guide      a rich guide detail open (The Shootist, target 42)
//   ?shot=spoiler    top of page with the spoiler shield ON (toggle
//                    visible) and masked story trophies

export function applyShotMode({ tracker, elements, selectTrophy }) {
  const mode = new URLSearchParams(window.location.search).get('shot');
  if (!mode) return null;
  // Freeze all motion at its clean end state for the capture: the CSS
  // kills animations/transitions under this class and forces animated
  // elements (roadmap signs included) into their final state.
  document.body.classList.add('shot-mode');
  const { state } = tracker;

  const seed = (earnedIds, counters) => {
    state.earnedIds = new Set(earnedIds);
    Object.assign(state.counters, counters);
  };

  const scrollToLayout = () => window.setTimeout(() => {
    document.querySelector('.layout')?.scrollIntoView({ block: 'start' });
  }, 350);

  // Cover + spoiler shots are framed at the TOP of the page so the
  // masthead, progress bar, control row (search / filters / spoiler
  // toggle / export / import) are visible in the capture. The compact
  // class tightens the masthead and control spacing for shot modes
  // only, so the first checklist rows still fit in the frame.
  const frameAtTop = () => {
    document.body.classList.add('shot-compact');
    window.setTimeout(() => window.scrollTo(0, 0), 350);
  };

  if (mode === 'checklist') {
    seed([2, 3, 4, 8, 15, 25], { 15: 140, 25: 5 });
    selectTrophy(15);
    frameAtTop();
  } else if (mode === 'roadmap') {
    seed([2, 3, 8, 22], {});
    window.setTimeout(() => {
      document.getElementById('roadmap')?.scrollIntoView({ block: 'start' });
    }, 350);
  } else if (mode === 'guide') {
    seed([2, 3, 8], { 17: 30 });
    selectTrophy(17);
    scrollToLayout();
  } else if (mode === 'spoiler') {
    state.spoilerOn = true;
    elements.spoilerToggle.checked = true;
    state.filters.kind = 'collectibles';
    elements.kindFilter.value = 'collectibles';
    // Open an unearned story trophy in the detail pane: with the shield
    // on it shows fully masked, beside the filtered collectibles list.
    // Framed at the top so the spoiler toggle reads ON in the capture.
    selectTrophy(3);
    frameAtTop();
  }
  tracker.renderAll();
  return mode;
}
