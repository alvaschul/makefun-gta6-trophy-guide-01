[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/alvaschul/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/alvaschul/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# PLATINUM ROAD — Leonida Trophy Guide & Tracker

An offline, static web app that guides and tracks all **55 Grand Theft Auto VI PlayStation 5 trophies** (1 platinum, 2 gold, 6 silver, 46 bronze) on the road to the platinum. Vanilla JS and CSS only — no libraries, no network requests, no Rockstar logos, artwork or fonts. The look is an original "Vice Night Highway" design: a glowing neon roadside sign (Anton + Yellowtail lettering, vendored under the SIL OFL) over a retro sunset band with palm silhouettes, progress driven along a neon road, mile-marker trophy cards with chunky grade coins, highway-sign roadmap stages and a chunky dash panel of controls — with neon flicker-in, crawling road dashes and shine-sweep motion throughout (all frozen clean in screenshots, and off under prefers-reduced-motion).

## What it does

- **Tracker & data** — all 55 trophies with their exact official name, description and grade. A checklist whose progress is saved in `localStorage`, a progress bar with counts by grade, per-trophy target counters (250 stunts, 42 range challenges, 100 WAiNK locations, $250,000 laundered, and more), search, filters by kind (story / missable / collectibles / activities / online), by grade and by earned state, plus export of progress to a JSON file and import back. The official list contains no online trophies, and the Online filter says so honestly in its empty state.
- **Spoiler shield** — a toggle that hides the names and descriptions of story trophies (and the descriptions of vague, hidden-style trophies) until each is earned.
- **Roadmap to the platinum** — six ordered stages built from the official descriptions: story chapters and named missions; stranger strands and character finales; collectibles and Leonida-wide counts; activities and mastery; heists, scores and money; then 100% completion and the platinum.
- **Missable watch** — a conservative, honestly labelled set of 15 trophies flagged from their official descriptions (one-time named missions, character *final* missions, and one-off scenes), with the method stated in the app: flags are precautionary, so clear them before the final mission / point of no return. A dedicated Missable filter lists them.
- **Cited guidance** — every trophy carries a guide in our own words (what to do, how, when it can be missed, and its count/target) with a sources line naming its sources. No specific location or step is presented as fact beyond what the official descriptions support.

## Run it

```sh
node serve.ts            # serves app/ on http://localhost:8080
node serve.ts --port 8091
```

Then open the printed URL. Progress is stored in your browser only.

Deterministic screenshot states are available via `?shot=checklist`, `?shot=roadmap`, `?shot=guide` and `?shot=spoiler`.

## Sources

Official names, descriptions, grades and tracked counts are cross-checked against:

- Exophase — <https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/>
- PSNProfiles — <https://psnprofiles.com/trophies/43531-grand-theft-auto-vi>

Links open only when clicked; the app itself fetches nothing.

## Hand-in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json` with the vendored make.fun library.
