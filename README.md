[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/alvaschul/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/alvaschul/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# PLATINUM ROAD · Vice Night Highway

A trophy guide and tracker for **Grand Theft Auto VI** on PlayStation 5, styled as a neon roadside sign on a night drive through Leonida. It covers the complete official 55-trophy list — 1 platinum, 2 gold, 6 silver, 46 bronze — and runs entirely offline as a static web app: no build step, no accounts, no network calls. Your progress is stored only in your own browser.

## What's inside

- **The checklist** — every trophy as a mile-marker card with its official name, description and grade. Tap the marker disc to stamp a trophy EARNED; tap the card for the full guide.
- **Guides for all 55** — a practical, own-words guide for every trophy, plus target counters with steppers for the grind trophies (250 stunts, 42 range golds, $250,000 of laundered bills and more). Finish a counter and the trophy stamps itself.
- **Six-stage roadmap** — the list sequenced as highway exits: story chapters, the named jobs, friends & strangers, the collectible sweep, the side hustles, and the last mile to 100% and the platinum.
- **Missable watch** — a precautionary flagged subset (one-time story missions, characters' final missions, a unique quarry, one-off scenes) derived only from the wording of the official descriptions, with the method stated honestly in the app.
- **Spoiler shield** — a dash toggle that masks unearned story trophies so you can browse the list without reading plot beats.
- **Search & filters** — by text, kind (story / collectibles / activities / online), grade and earned state. The online filter exists for completeness: the official list has no online trophies, and the app says so rather than faking results.
- **Export / import** — download your progress as JSON and bring it back on another browser or device, with validation on the way in.

## Run it locally

```sh
node serve.ts
```

Then open <http://localhost:8080>. The app is plain HTML, CSS and ES modules under `app/`; the trophy data lives in `app/data/trophies.json`.

## Hand it in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json` using the kit's dossier builder (`vendor/makefun-frontend.ts`) — the bundle the grader runs.

## Data & sources

Trophy names, descriptions and grades are the official GTA VI PS5 list as published by **Exophase** and **PSNProfiles**. Guides, roadmap groupings, counters and missable flags are this project's own work, written from those official descriptions. The Anton and Yellowtail typefaces are vendored under the SIL Open Font License 1.1 (see `app/fonts/`). Grand Theft Auto VI is a Rockstar Games title; this is an unofficial fan tracker.
