[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/alvaschul/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/alvaschul/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# PLATINUM ROAD · Vice Night Highway

A GTA 6 trophy guide and progress tracker styled as a neon-lit night
drive down a Leonida highway. It covers all 55 official PlayStation 5
trophies — 1 platinum, 2 gold, 6 silver, 46 bronze — and runs entirely
offline: open the app and everything (data, fonts, logic) is already
on board. No build step, no network calls, no accounts.

## What it does

- **Checklist** — every trophy as a mile-marker sign; click to stamp
  it EARNED. Progress persists in localStorage, shown as a neon road
  with mile markers plus per-grade counts.
- **Guides** — click any card for a detail view with the official
  description and an original, practical guide for that trophy.
- **Target counters** — grind trophies (250 stunts, 42 shooting-range
  golds, $250,000 of laundered bills…) carry steppers that persist
  alongside the checklist.
- **Search & filters** — by text, by kind (story / collectibles /
  activities / online), by grade, and by earned state.
- **Spoiler shield** — when on, unearned story trophies are masked so
  you can plan the route without reading the plot.
- **Roadmap to Platinum** — the 55 trophies grouped into six ordered
  stages, rendered as highway exit signs with per-stage progress.
- **Missable Watch** — a precautionary list flagged from the wording
  of the official descriptions (one-time missions, final missions for
  individual characters, one-off scenes), with the method stated in
  the app: when in doubt, keep a save before story missions.
- **Export / Import** — download your progress as JSON and restore it
  on another browser or device.

## Run it locally

```
node serve.ts
```

then open http://localhost:8080. Any static file server pointed at
`app/` works just as well.

## Hand it in

```
MAKEFUN_OUTPUT_DIR=out node main.ts
```

copies `app/` and `screenshots/` into `out/` and writes the make.fun
dossier to `out/dossier.json`.

## Data sources

Trophy names, descriptions and grades are the official PS5 list for
Grand Theft Auto VI as published by Exophase and PSNProfiles. All
guide text in the app is original to this project.
