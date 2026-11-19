// PLATINUM ROAD — hand-in program.
//
// What this does, in plain terms: it packs the finished entry the way
// make.fun wants to receive it. It copies the web app (app/) and the
// screenshot set (screenshots/) out of this folder into the output
// directory, then asks the kit's own dossier builder to describe the
// whole bundle and writes that description down as dossier.json.
//
// The output directory comes from MAKEFUN_OUTPUT_DIR when set and
// falls back to /output, which is where the grader mounts it. As a
// seatbelt, the program refuses to run if the output directory
// resolves to this folder itself — copying the app into its own home
// would make a mess of the entry.

import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || "/output");

if (outDir === resolve(here)) {
  throw new Error(
    "Refusing to hand in: the output directory is the entry folder itself.",
  );
}

mkdirSync(outDir, { recursive: true });

for (const part of ["app", "screenshots"]) {
  cpSync(join(here, part), join(outDir, part), { recursive: true });
}

const dossier = buildDossier(here, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

writeFileSync(join(outDir, "dossier.json"), dossier);
const kib = (dossier.byteLength / 1024).toFixed(1);
console.log(`PLATINUM ROAD: dossier written to ${join(outDir, "dossier.json")} (${kib} KiB)`);
