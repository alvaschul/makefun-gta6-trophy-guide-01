// shots.js — the ?shot= scenes used for the entry's screenshots.
// Each scene stages a believable mid-drive moment on a TRANSIENT copy
// of the save (nothing here is written to localStorage), so a visitor
// who lands on a shot URL never inherits a stranger's progress.

import { stageTransient } from "./tracker.js";
import { openDetail } from "./guides.js";
import { scrollToId } from "./motion.js";

const SCENES = {
  // The cover: masthead, the road at 15%, the whole dash, and the
  // first checklist cards with stamps and guide lines showing.
  checklist() {
    stageTransient((save) => {
      for (const id of [2, 3, 4, 8, 9, 16, 21, 44]) save.earned[id] = true;
    });
    document.body.classList.add("in-shot", "shot-checklist");
    window.scrollTo(0, 0);
  },

  // The roadmap signs with a believable spread of stage progress.
  roadmap() {
    stageTransient((save) => {
      for (const id of [2, 3, 4, 5, 8, 22, 23]) save.earned[id] = true;
      save.counts[28] = 6;
    });
    document.body.classList.add("in-shot");
    scrollToId("roadmapPanel");
  },

  // A silver trophy's guide, open mid-grind: The Shootist at 27/42.
  guide() {
    stageTransient((save) => {
      save.counts[17] = 27;
      for (const id of [2, 3, 16, 21]) save.earned[id] = true;
    });
    document.body.classList.add("in-shot");
    openDetail(17);
  },

  // The spoiler shield doing its job: story cards masked, toggle on.
  spoiler() {
    stageTransient((save) => {
      save.spoiler = true;
      for (const id of [15, 16, 30]) save.earned[id] = true;
    });
    document.body.classList.add("in-shot", "shot-spoiler");
    scrollToId("dashPanel");
  },
};

export function applyShotMode() {
  const mode = new URLSearchParams(window.location.search).get("shot");
  if (mode && SCENES[mode]) {
    SCENES[mode]();
    return mode;
  }
  return null;
}
