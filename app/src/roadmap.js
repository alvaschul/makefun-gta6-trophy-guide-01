// roadmap.js — the six-stage route to the platinum.
//
// The stages run the way a sensible playthrough does: the story first
// while it is unmissable-by-design, then the character strands, the
// completion backbone, the skill activities, the long grinds, and a
// final mile of one-off moments plus the platinum itself. Every one of
// the 55 trophies sits in exactly one stage; each stage renders as a
// highway exit sign with its trophies as chips and an earned meter.

export const STAGES = [
  {
    exit: "EXIT 1",
    name: "Story First — The Main Drag",
    blurb: "Play the main storyline end to end before anything else. These are the chapter gates and the named one-time missions, in the order the game deals them.",
    trophyIds: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 7],
  },
  {
    exit: "EXIT 2",
    name: "The Inner Circle",
    blurb: "Finish every character strand: the final missions for Andy, Kenton, Billy, Randy and Tyrone, plus eight full stranger strands across Leonida.",
    trophyIds: [22, 23, 24, 26, 27, 25],
  },
  {
    exit: "EXIT 3",
    name: "Leonida Completionist",
    blurb: "The backbone of the 100% gold: sample every activity type, explore all 52 areas, discover 100 vehicles and meditate at every quiet spot on the map.",
    trophyIds: [14, 16, 42, 35, 28],
  },
  {
    exit: "EXIT 4",
    name: "Thrill Seeker",
    blurb: "Skill and sport: 250 stunts, all 42 shooting-range golds, drone races, 20 race wins, Cal's fishing challenge, an arcade clear, Bret's unique hunt, 50 challenges and a five-man Combat Focus.",
    trophyIds: [15, 17, 18, 19, 20, 21, 29, 32, 36],
  },
  {
    exit: "EXIT 5",
    name: "Vice Grinder",
    blurb: "The long economy of the platinum: card sets, 100 WAiNK spots, every gang robbed, 500 choices, the laundering and shopping totals, all garages and the Scooter Bros registry.",
    trophyIds: [30, 31, 43, 48, 52, 53, 54, 55],
  },
  {
    exit: "EXIT 6",
    name: "The Final Mile",
    blurb: "Partner chaos, heists and one-off scenes — the jewelry sneak, the vault run, the showroom exit — and at the very end of the road, the platinum itself.",
    trophyIds: [33, 34, 37, 38, 39, 40, 41, 44, 45, 46, 47, 49, 50, 51, 1],
  },
];

export function renderRoadmap(container, trophies, store, { onOpen }) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  container.innerHTML = "";
  for (const stage of STAGES) {
    const members = stage.trophyIds.map((id) => byId.get(id)).filter(Boolean);
    const earned = members.filter((t) => store.isEarned(t.id)).length;
    const pct = members.length ? Math.round((earned / members.length) * 100) : 0;

    const sign = document.createElement("article");
    sign.className = "stage-sign";
    const chips = members
      .map(
        (t) =>
          `<button type="button" class="stage-chip ${store.isEarned(t.id) ? "chip-earned" : ""}" data-open="${t.id}">${t.name}</button>`
      )
      .join("");
    sign.innerHTML = `
      <header class="stage-head">
        <span class="exit-tab">${stage.exit}</span>
        <h3>${stage.name}</h3>
        <span class="stage-count">${earned} / ${members.length}</span>
      </header>
      <p class="stage-blurb">${stage.blurb}</p>
      <div class="stage-meter"><div class="stage-meter-fill" style="width:${pct}%"></div></div>
      <div class="stage-chips">${chips}</div>
    `;
    for (const chip of sign.querySelectorAll("[data-open]")) {
      chip.addEventListener("click", () => onOpen(byId.get(Number(chip.dataset.open))));
    }
    container.appendChild(sign);
  }
}
