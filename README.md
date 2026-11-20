[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/alvaschul/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/alvaschul/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# PLATINUM ROAD · Vice Night Highway

A neon roadside-sign trophy guide and tracker for the official
**Grand Theft Auto VI** PlayStation 5 trophy list — all **55 trophies**
(1 platinum, 2 gold, 6 silver, 46 bronze), styled as a night drive down
a Leonida highway: a glowing motel masthead, mile-marker trophy cards,
highway exit signs for the roadmap, and a car dash panel for controls.

It is a fully offline static web app. No build step, no network calls,
no accounts — your progress lives in your browser's localStorage.

## What it does

- **Checklist for all 55 trophies** with the exact official names,
  descriptions and grades. Click a mile marker to stamp it EARNED;
  progress shows overall and per grade on a neon-road progress bar.
- **A guide for every trophy**, written for this app, plus a sources
  line crediting the official PS5 list.
- **Target counters** for the grind trophies (250 stunts, 42 range
  golds, $250,000 laundered and more) with steppers that persist.
- **Search and filters** by kind (story / collectibles / activities /
  online), by grade, and by earned state.
- **Spoiler Shield** — when on, unearned story trophies are masked so
  you can track without being spoiled.
- **Roadmap to Platinum** — six highway-sign stages that order the
  whole list from the opening mission to the final mile.
- **Missable Watch** — a precautionary flagged subset (about 15
  trophies) derived only from the wording of the official descriptions:
  one-time story missions, characters' final missions, one-off scenes.
  When in doubt, keep a save before story missions.
- **Export / Import** your progress as JSON, with validation on import.

## Run it locally

```sh
node serve.ts
```

Then open <http://localhost:8080>. The server is a small static file
server; the app itself is the plain files under `app/`.

## Hand it in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into `out/` and writes
`out/dossier.json` describing the bundle under the competition caps.

## Data sources

Trophy names, descriptions and grades are the official PS5 trophy list
for Grand Theft Auto VI, as published by **Exophase** and
**PSNProfiles**. Guides, kinds, counters, roadmap stages and the
missable flags are this project's own work, derived from the official
descriptions.
