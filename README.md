[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/alvaschul/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/alvaschul/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# PLATINUM ROAD · Vice Night Highway

A trophy guide and progress tracker for **Grand Theft Auto VI on PlayStation 5**, styled as a neon roadside sign on a night drive through Leonida. It covers the full official list — all **55 trophies (1 platinum · 2 gold · 6 silver · 46 bronze)** — and works completely offline as a plain static web app: no build step, no accounts, no network calls. Your progress lives in your own browser's local storage.

This is an entry to the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

## What is inside

- **The checklist** — every trophy as a mile-marker card. Stamp a card earned with its marker button, watch the neon road progress bar fill, and see counts overall and per grade.
- **Guides in plain words** — each trophy carries a short, practical guide written for this app, plus the official description and a sources line.
- **Filters and search** — narrow the list by kind (story / collectibles / activities / online), by grade, by earned state, by missable flags, or by free-text search.
- **Target counters** — grind trophies (250 stunts, 42 range golds, 100 WAiNK spots, $250,000 laundered…) get steppers so you can track the long miles between sessions.
- **Spoiler shield** — flip one switch and every unearned story trophy is masked, so you can browse the list without reading a single late-game surprise.
- **The roadmap** — a six-stage route to the platinum drawn as highway exit signs: story first, then character strands, collectibles, the activity grind, and the final mile.
- **Missable watch** — a precautionary list of trophies whose official descriptions sound one-time (named story missions, characters' final missions, one-off scenes), flagged from the wording of the descriptions themselves. When in doubt, keep a save before story missions.
- **Export / import** — take your progress with you as a small JSON file and restore it on another browser or device.
- **Sources** — the trophy list is the official PS5 list, cross-checked on Exophase and PSNProfiles; the app names its sources on every trophy and in its Sources section.

## Run it locally

You need Node.js 22 or newer. From this folder:

```sh
node serve.ts
```

Then open the address it prints (http://127.0.0.1:8080) in a browser. Everything runs on your machine; nothing is uploaded anywhere.

## Build the hand-in

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json` describing them, using the vendored make.fun frontend library in `vendor/`. Without `MAKEFUN_OUTPUT_DIR` the output goes to `/output`.

## Layout

- `app/` — the web app: `index.html`, `style.css`, `data/trophies.json` (the 55 trophies, their kinds, guides, counters and flags) and `src/` (plain ES modules: tracker store, detail guides, roadmap, shot modes, motion).
- `app/fonts/` — Anton and Yellowtail, vendored as woff2 with their SIL Open Font License texts, so the signs render identically offline.
- `screenshots/` — the four hand-in screenshots described in `shots.json`.
- `main.ts` — the hand-in builder described above. `serve.ts` — a tiny local server for previewing the app.

## Data honesty

The game is not out yet, so the guides are written from the official trophy descriptions: what each description states, and what it plainly implies. Anything the descriptions leave vague is flagged as vague in the guide rather than filled in with invented specifics. The missable flags are a precaution derived from description wording, not inside knowledge.
