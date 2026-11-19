// PLATINUM ROAD — gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// What this program is: the hand-in for "PLATINUM ROAD — Leonida Trophy
// Guide & Tracker", an offline static web app under app/ covering all 55
// Grand Theft Auto VI PS5 trophies — a localStorage checklist with search,
// kind / grade / earned filters, export and import, a spoiler shield, a
// six-stage roadmap to the platinum, precautionary MISSABLE WATCH flags
// built from the official descriptions, and a cited guide in our own words
// for every trophy (data in app/data/trophies.json).
//
// What it does: copies app/ and screenshots/ from beside this file into
// the output directory and writes dossier.json there with the vendored
// make.fun library (vendor/makefun-frontend.ts, left byte-identical), so
// the judge reads exactly the app, screenshots and source that were built.
//
// Run it locally first with `node serve.ts`, then hand in with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648, app_path_max_bytes: 1000 }),
);
