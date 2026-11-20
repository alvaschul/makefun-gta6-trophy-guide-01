// PLATINUM ROAD — hand-in entrypoint.
//
// Running this file assembles the competition dossier: it copies the
// offline web app (app/) and its four screenshots (screenshots/) into
// the output directory and asks the vendored make.fun frontend module
// to describe that bundle in a dossier.json written beside the copies.
// Only Node's standard library is used here; the dossier format itself
// belongs to the vendored module.
//
// The output directory comes from MAKEFUN_OUTPUT_DIR when set and
// falls back to /output, matching how the grader invokes this file.
// Writing into the repository folder itself is refused outright: the
// dossier must land somewhere separate from the source it describes.

import { cpSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoDir = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

if (outputDir === repoDir) {
  console.error("refusing to write the dossier into the repository itself");
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

for (const part of ["app", "screenshots"]) {
  cpSync(resolve(repoDir, part), resolve(outputDir, part), { recursive: true });
}

const dossierBytes = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

const dossierPath = resolve(outputDir, "dossier.json");
writeFileSync(dossierPath, dossierBytes);
const dossierKib = (statSync(dossierPath).size / 1024).toFixed(1);
console.log(`PLATINUM ROAD: dossier written to ${dossierPath} (${dossierKib} KiB)`);
