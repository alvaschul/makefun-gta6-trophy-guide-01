// PLATINUM ROAD — hand-in program.
//
// Running this file produces the competition dossier: it copies the
// finished web app (app/) and its four screenshots (screenshots/) into
// the output folder, then asks the vendored make.fun frontend library
// to describe that bundle as dossier.json under the competition caps.
// The app itself is plain static files — this program is the only
// build step, and it uses nothing beyond the Node 22 standard library
// plus the vendored buildDossier helper.

import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

// Copying the app into itself would recurse forever and prove nothing,
// so refuse that one output location outright.
if (outDir === repoDir) {
  console.error('MAKEFUN_OUTPUT_DIR must not be the repository folder itself.');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
cpSync(resolve(repoDir, 'app'), resolve(outDir, 'app'), { recursive: true });
cpSync(resolve(repoDir, 'screenshots'), resolve(outDir, 'screenshots'), { recursive: true });

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

const dossier = buildDossier(outDir, caps);
writeFileSync(resolve(outDir, 'dossier.json'), dossier);
const kib = ((typeof dossier === 'string' ? Buffer.byteLength(dossier) : dossier.byteLength) / 1024).toFixed(1);
console.log(`PLATINUM ROAD: dossier written to ${resolve(outDir, 'dossier.json')} (${kib} KiB)`);
