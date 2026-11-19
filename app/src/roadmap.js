// roadmap.js — the six-stage route to the platinum, drawn as highway signs.
//
// The stages are an editorial order, not the game's: story first so nothing
// one-time is left behind, character strands before the endgame, then the
// collectible miles, the long activity grind, and the final mile.

export const STAGES = [
  {
    exit: "EXIT 1",
    name: "Opening Miles",
    blurb:
      "Start where the game starts: the opening mission and the four story chapters. Nothing here needs side content — just drive the story and let the map open up around you.",
    ids: [2, 3, 4, 5, 6],
  },
  {
    exit: "EXIT 2",
    name: "Named Jobs & Heists",
    blurb:
      "The named set-pieces — Breakfast Run, The Cartel Heist, Child's Play, Headliners, VCIA Takedown and Operation Savage Glory. Each happens once, so keep a save before you roll into them.",
    ids: [8, 9, 10, 11, 12, 13],
  },
  {
    exit: "EXIT 3",
    name: "Strangers & Final Favours",
    blurb:
      "The strands of Andy, Kenton, Billy, Randy and Tyrone, plus eight stranger strands in total. These finales are the classic missables — clear them before the endgame closes the road.",
    ids: [22, 23, 24, 25, 26, 27],
  },
  {
    exit: "EXIT 4",
    name: "Collect the Coast",
    blurb:
      "Meditation spots, card sets, WAiNK spots, a hundred discovered vehicles and every corner of Leonida. Slow miles, best driven while the story breathes between chapters.",
    ids: [28, 30, 31, 35, 42],
  },
  {
    exit: "EXIT 5",
    name: "The Long Grind",
    blurb:
      "Stunts, ranges, races, robberies, challenges and the money trophies — plus every one-off feat. The longest exit on the highway; pace it with the counters on each card.",
    ids: [15, 16, 17, 18, 19, 20, 21, 29, 32, 33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
  },
  {
    exit: "EXIT 6",
    name: "The Final Mile",
    blurb:
      "The final mission, 100% completion, and the platinum itself. Make a backup save, take the last exit, and the big sign lights up.",
    ids: [7, 14, 1],
  },
];

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderRoadmap(container, store, onOpen, animate = false) {
  container.innerHTML = STAGES.map((stage) => {
    const trophies = stage.ids.map((id) => store.byId.get(id)).filter(Boolean);
    const done = trophies.filter((t) => store.isEarned(t.id)).length;
    const pct = trophies.length ? Math.round((done / trophies.length) * 100) : 0;
    const chips = trophies
      .map(
        (t) =>
          `<button type="button" class="chip${store.isEarned(t.id) ? " done" : ""}" data-open="${t.id}">` +
          `<span class="grade-dot" style="background:var(--${t.grade});box-shadow:0 0 6px var(--${t.grade})"></span>${esc(t.name)}</button>`,
      )
      .join("");
    return (
      `<article class="stage${animate ? " reveal" : ""}">` +
      `<div class="stage-head"><span class="stage-exit">${stage.exit}</span>` +
      `<h3 class="stage-name">${esc(stage.name)}</h3></div>` +
      `<p class="stage-blurb">${esc(stage.blurb)}</p>` +
      `<div class="stage-progress"><div class="stage-bar"><div class="stage-bar-fill" style="width:${pct}%"></div></div>` +
      `<span>${done}/${trophies.length} earned</span></div>` +
      `<div class="stage-chips">${chips}</div></article>`
    );
  }).join("");

  container.querySelectorAll("[data-open]").forEach((chip) => {
    chip.addEventListener("click", () => onOpen(Number(chip.dataset.open)));
  });
}
