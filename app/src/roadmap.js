// roadmap.js — the six exits between you and the platinum.
// Stages follow the order the game hands the list to a player:
// the story opens the road, people fill it, the state sprawls,
// the hustles grind, and the last mile is pure mop-up.

import { trophyById, isEarned } from "./tracker.js";
import { displayName } from "./guides.js";

export const STAGES = [
  {
    exit: "EXIT 1",
    title: "First Tank of Gas",
    desc: "The opening hours: the prologue and the first four chapters. Nothing here asks anything of you but to play the story and enjoy the ride.",
    ids: [2, 3, 4, 5, 6],
  },
  {
    exit: "EXIT 2",
    title: "The Named Jobs",
    desc: "The campaign's set-piece missions — a breakfast run, a cartel heist, an airport takedown. All one-time story beats, all collected simply by finishing the plot.",
    ids: [8, 9, 10, 11, 12, 13],
  },
  {
    exit: "EXIT 3",
    title: "Friends & Strangers",
    desc: "Leonida's people: the stranger strands for Andy, Kenton, Billy, Randy, Tyrone and Bret. Clear each character's markers as they appear so no strand dries up.",
    ids: [22, 23, 24, 25, 26, 27, 29],
  },
  {
    exit: "EXIT 4",
    title: "See All of Leonida",
    desc: "The collection sweep: cards, meditation spots, WAiNK stops, vehicles and every one of the 52 areas. Slow down and tour the state like it owes you money.",
    ids: [28, 30, 31, 35, 42],
  },
  {
    exit: "EXIT 5",
    title: "Side Hustles",
    desc: "Everything the open world pays out: stunts, races, ranges, robberies, bowling, laundering and the long money counters. This is the grind exit — bring patience and a fast car.",
    ids: [15, 16, 17, 18, 19, 20, 21, 32, 33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 50, 51, 52, 53, 54, 55],
  },
  {
    exit: "EXIT 6",
    title: "The Last Mile",
    desc: "The finale and the bookkeeping: the last mission, the choices you logged along the way, the 100% completion line — and the platinum waiting at the end of the road.",
    ids: [7, 48, 49, 14, 1],
  },
];

export function stageProgress(stage) {
  const earned = stage.ids.filter((id) => isEarned(id)).length;
  return { earned, total: stage.ids.length };
}

export function renderRoadmap(container, onOpen) {
  container.innerHTML = "";
  for (const stage of STAGES) {
    const { earned, total } = stageProgress(stage);
    const article = document.createElement("article");
    article.className = "stage";

    const sign = document.createElement("div");
    sign.className = "stage-sign";
    const num = document.createElement("span");
    num.className = "stage-num";
    num.textContent = stage.exit;
    const title = document.createElement("h3");
    title.className = "stage-title";
    title.textContent = stage.title;
    const prog = document.createElement("span");
    prog.className = "stage-progress";
    prog.textContent = `${earned}/${total}`;
    sign.append(num, title, prog);

    const desc = document.createElement("p");
    desc.className = "stage-desc";
    desc.textContent = stage.desc;

    const chips = document.createElement("ul");
    chips.className = "stage-chips";
    for (const id of stage.ids) {
      const trophy = trophyById(id);
      if (!trophy) continue;
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "stage-chip" + (isEarned(id) ? " stage-chip-earned" : "");
      btn.textContent = (isEarned(id) ? "✓ " : "") + displayName(trophy);
      btn.addEventListener("click", () => onOpen(id));
      li.appendChild(btn);
      chips.appendChild(li);
    }

    article.append(sign, desc, chips);
    container.appendChild(article);
  }
}
