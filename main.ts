// PLATINUM ROAD — hand-in builder.
//
// Running this file with Node assembles the entry's dossier: it copies the
// finished web app (app/) and the four screenshots (screenshots/) into one
// output folder, then asks the vendored make.fun frontend library to describe
// that folder as a dossier.json written beside them. The output folder is the
// hand-in — a grader runs this program and reads the dossier it produces.
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Everything is resolved from this file's own folder, never from the caller's
// working directory, so the build behaves the same wherever it is run from.
const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// Guard the one dangerous case: an output folder equal to the source folder
// would copy the app into itself and bury the repo under its own dossier.
if (outDir === here) {
  throw new Error('MAKEFUN_OUTPUT_DIR must not be the repository folder itself.');
}

mkdirSync(outDir, { recursive: true });
for (const name of ['app', 'screenshots']) {
  cpSync(join(here, name), join(outDir, name), { recursive: true });
}

// The caps are the competition's hand-in limits: how much text, how many
// screenshots of what size, and how large the app tree may grow.
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

const dossier = await buildDossier(outDir, caps);
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`PLATINUM ROAD: dossier written to ${join(outDir, 'dossier.json')}`);
