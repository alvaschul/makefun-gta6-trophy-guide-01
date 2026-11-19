// roadmap.js — the six-stage Roadmap to the Platinum, ordered from the
// official descriptions: chapters and named missions first, stranger
// strands and character finales second, the Leonida-wide collectible
// counts third, activities and mastery fourth, heists, scores and money
// fifth, and 100% completion plus the platinum last.

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Story — Chapters 1–4 & First Missions',
    description: 'Drive the main story through Chapters 1–4 and the named early missions (Gone Fishing, Breakfast Run, Child’s Play, Headliners). Take the one-off Ocean Beach scene while the story puts you there.',
  },
  {
    stage: 2,
    title: 'Stranger Strands & Character Finales',
    description: 'Complete 8 stranger strands across Leonida and finish each character’s final mission — Andy, Kenton, Billy, Randy and Tyrone — plus Bret’s unique-animal hunt. These finales conclude, so finish them before the endgame.',
  },
  {
    stage: 3,
    title: 'Collectibles & Leonida-Wide Counts',
    description: 'The state-wide sweeps: 3 card sets, WAiNK at 100 locations, 18 meditation spots, 100 vehicles discovered, all 52 areas of Leonida explored and 10 vehicles registered to the Scooter Bros app.',
  },
  {
    stage: 4,
    title: 'Activities & Mastery',
    description: 'Ranges, races and stunts: gold in all 42 Shooting Range challenges, 250 stunts, drone-race wins at 14 locations, 20 different races won, 50 challenges, every activity type tried once, plus fishing, arcade and bowling detours.',
  },
  {
    stage: 5,
    title: 'Heists, Scores & Money',
    description: 'The paying work: The Cartel Heist, VCIA Takedown and Operation Savage Glory, 5 bank vaults, an armored truck, one illegal operation per gang, partner robberies and escapes — and the money totals, $250,000 laundered and $100,000 spent, with all 8 garages bought.',
  },
  {
    stage: 6,
    title: '100% Completion & The Platinum',
    description: 'Close the run out: the choice count and the vague late-game trophies resolve across a full playthrough, then attain 100% completion, complete the final mission — only with the MISSABLE WATCH list clear — and collect the platinum, Vice Got a Price!',
  },
];

export function renderRoadmap({ container, data, tracker, onSelectTrophy }) {
  container.replaceChildren();
  for (const stageInfo of ROADMAP_STAGES) {
    const card = document.createElement('article');
    card.className = 'stage-card';
    const heading = document.createElement('h3');
    const badge = document.createElement('span');
    badge.className = 'stage-no';
    badge.textContent = String(stageInfo.stage);
    heading.append(badge, document.createTextNode(stageInfo.title));
    const desc = document.createElement('p');
    desc.className = 'stage-desc';
    desc.textContent = stageInfo.description;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const trophy of data.trophies.filter((t) => t.stage === stageInfo.stage)) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'stage-trophy' + (tracker.state.earnedIds.has(trophy.id) ? ' done' : '');
      chip.textContent = trophy.name;
      if (trophy.missable) {
        const flag = document.createElement('span');
        flag.className = 'flag';
        flag.textContent = ' ⚠ MISSABLE';
        chip.append(flag);
      }
      chip.addEventListener('click', () => onSelectTrophy(trophy.id, { scrollToList: true }));
      chips.append(chip);
    }
    card.append(heading, desc, chips);
    container.append(card);
  }
}
