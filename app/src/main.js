// main.js — boot and wiring for PLATINUM ROAD.
//
// Loads the trophy list, builds the store, renders the progress road, the
// checklist, the roadmap and the missable watch, and wires the dash panel:
// search, the kind / grade / earned filters, the missable and spoiler
// switches, and progress export / import.

import { loadTrophies, createStore } from "./tracker.js";
import { renderRoadmap } from "./roadmap.js";
import { createDetail, isMasked, counterHtml, wireCounter, gradeLabel, kindLabel, fmt, MASKED_NAME, MASKED_DESC } from "./guides.js";
import { lightTheSign, revealOnScroll } from "./motion.js";
import { readShotMode, applyShotMode } from "./shots.js";

const els = {
  sign: document.getElementById("sign"),
  progressLabel: document.getElementById("progress-label"),
  progressPct: document.getElementById("progress-pct"),
  roadBar: document.getElementById("road-bar"),
  roadFill: document.getElementById("road-fill"),
  grid: document.getElementById("grid"),
  resultCount: document.getElementById("result-count"),
  emptyState: document.getElementById("empty-state"),
  roadmap: document.getElementById("roadmap"),
  missableList: document.getElementById("missable-list"),
  missableCount: document.getElementById("missable-count"),
  search: document.getElementById("search"),
  kind: document.getElementById("filter-kind"),
  grade: document.getElementById("filter-grade"),
  state: document.getElementById("filter-state"),
  missableOnly: document.getElementById("filter-missable"),
  shield: document.getElementById("shield"),
  exportBtn: document.getElementById("export-btn"),
  importFile: document.getElementById("import-file"),
  hint: document.querySelector(".dash-hint"),
  overlay: document.getElementById("detail-overlay"),
  detailContent: document.getElementById("detail-content"),
  detailClose: document.getElementById("detail-close"),
};

const GRADE_TOTALS = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
const filters = { q: "", kind: "all", grade: "all", state: "all", missableOnly: false };
let store = null;
let detail = null;
let firstRender = true;

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function firstSentence(text) {
  const cut = text.indexOf(". ");
  return cut === -1 ? text : text.slice(0, cut + 1);
}

function visibleTrophies() {
  const q = filters.q.trim().toLowerCase();
  return store.trophies.filter((t) => {
    if (filters.kind !== "all" && t.kind !== filters.kind) return false;
    if (filters.grade !== "all" && t.grade !== filters.grade) return false;
    if (filters.state === "earned" && !store.isEarned(t.id)) return false;
    if (filters.state === "unearned" && store.isEarned(t.id)) return false;
    if (filters.missableOnly && !t.missable) return false;
    if (q) {
      const haystack = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

function cardHtml(t) {
  const earned = store.isEarned(t.id);
  const masked = isMasked(t, store);
  const tags = [`<span class="tag">${esc(kindLabel(t.kind))}</span>`];
  if (t.missable) tags.push(`<span class="tag tag-missable">Missable watch</span>`);
  if (masked) tags.push(`<span class="tag tag-spoiler">Spoiler shielded</span>`);

  return (
    `<article class="card${earned ? " earned" : ""}" data-id="${t.id}" tabindex="0" role="button" aria-label="${esc(masked ? "Spoiler-shielded story trophy" : t.name)} — open guide">` +
    `<div class="card-top">` +
    `<button type="button" class="mile" data-mile="${t.id}" title="Stamp earned / undo">${earned ? "★ " : ""}MILE ${t.id}</button>` +
    `<span class="grade-chip"><span class="grade-dot" style="background:var(--${t.grade});box-shadow:0 0 6px var(--${t.grade})"></span>${esc(gradeLabel(t.grade))}</span>` +
    `</div>` +
    `<span class="stamp" aria-hidden="true">EARNED</span>` +
    `<h3 class="card-name${masked ? " spoiler-masked" : ""}">${masked ? MASKED_NAME : esc(t.name)}</h3>` +
    `<p class="card-desc${masked ? " spoiler-masked" : ""}">${masked ? MASKED_DESC : esc(t.description)}</p>` +
    (masked ? "" : `<p class="card-guide">${esc(firstSentence(t.guide))}</p>`) +
    counterHtml(t, store) +
    `<div class="card-tags">${tags.join("")}</div>` +
    `</article>`
  );
}

function renderProgress() {
  const total = store.trophies.length;
  const earned = store.earnedCount();
  const pct = total ? Math.round((earned / total) * 100) : 0;
  els.progressLabel.textContent = `${earned} of ${total} trophies earned`;
  els.progressPct.textContent = `${pct}%`;
  els.roadFill.style.width = `${pct}%`;
  els.roadBar.setAttribute("aria-valuenow", String(earned));
  for (const grade of Object.keys(GRADE_TOTALS)) {
    const el = document.getElementById(`count-${grade}`);
    if (!el) continue;
    const ofGrade = store.trophies.filter((t) => t.grade === grade);
    el.textContent = `${store.earnedOf(ofGrade)}/${GRADE_TOTALS[grade]}`;
  }
}

function renderGrid() {
  const list = visibleTrophies();
  els.grid.innerHTML = list.map(cardHtml).join("");
  els.resultCount.textContent = `Showing ${list.length} of ${store.trophies.length} trophies`;

  if (list.length === 0) {
    els.emptyState.hidden = false;
    els.emptyState.textContent =
      filters.kind === "online"
        ? "No trophies in the official list are online-only — every one of the 55 can be earned in single player. The online shelf is honestly empty."
        : "No trophies match that combination. Loosen a filter or clear the search and the road opens up again.";
  } else {
    els.emptyState.hidden = true;
  }

  els.grid.querySelectorAll("[data-counter]").forEach((box) => {
    const card = box.closest("[data-id]");
    wireCounter(card ?? els.grid, store);
  });
}

function missableWhy(t) {
  if (t.description.includes("final mission for")) {
    return "A character's final mission — finish the strand before the endgame.";
  }
  if (t.id === 7) return "The final mission — the point of no return. Save before you take it on.";
  if (t.id === 48) return "Choices only exist inside their moments — some can never be revisited.";
  if (t.kind === "story") return "A one-time story mission — it happens once, so keep a save before it.";
  return "A one-off scene flagged from its description — do it the first time you can.";
}

function renderMissable() {
  const flagged = store.trophies.filter((t) => t.missable);
  const done = store.earnedOf(flagged);
  els.missableCount.textContent = `${flagged.length} flagged · ${done} earned`;
  els.missableList.innerHTML = flagged
    .map((t) => {
      const earned = store.isEarned(t.id);
      const masked = isMasked(t, store);
      return (
        `<li class="missable-item${earned ? " done" : ""}" data-open="${t.id}">` +
        `<span><span class="mi-name">${masked ? MASKED_NAME : esc(t.name)}</span>` +
        `<span class="mi-why">${esc(missableWhy(t))}</span></span>` +
        `<span class="mi-state">${earned ? "Earned ✓" : esc(gradeLabel(t.grade))}</span></li>`
      );
    })
    .join("");
  els.missableList.querySelectorAll("[data-open]").forEach((item) => {
    item.addEventListener("click", () => detail.open(Number(item.dataset.open)));
  });
}

function renderAll() {
  els.shield.checked = store.shield;
  renderProgress();
  renderGrid();
  renderRoadmap(els.roadmap, store, (id) => detail.open(id), firstRender);
  renderMissable();
  firstRender = false;
}

function wireControls() {
  els.search.addEventListener("input", () => {
    filters.q = els.search.value;
    renderGrid();
  });
  els.kind.addEventListener("change", () => {
    filters.kind = els.kind.value;
    renderGrid();
  });
  els.grade.addEventListener("change", () => {
    filters.grade = els.grade.value;
    renderGrid();
  });
  els.state.addEventListener("change", () => {
    filters.state = els.state.value;
    renderGrid();
  });
  els.missableOnly.addEventListener("change", () => {
    filters.missableOnly = els.missableOnly.checked;
    renderGrid();
  });
  els.shield.addEventListener("change", () => {
    store.setShield(els.shield.checked);
  });

  els.grid.addEventListener("click", (event) => {
    const mile = event.target.closest("[data-mile]");
    const card = event.target.closest("[data-id]");
    if (mile) {
      event.stopPropagation();
      store.toggleEarned(Number(mile.dataset.mile));
      return;
    }
    if (event.target.closest("[data-counter]")) return; // steppers wire themselves
    if (card) detail.open(Number(card.dataset.id));
  });
  els.grid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-id]");
    if (card && event.target === card) {
      event.preventDefault();
      detail.open(Number(card.dataset.id));
    }
  });

  els.exportBtn.addEventListener("click", () => {
    const blob = new Blob([store.exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platinum-road-progress.json";
    a.click();
    URL.revokeObjectURL(url);
    els.hint.textContent = "Progress exported — keep the file somewhere safe.";
  });

  els.importFile.addEventListener("change", async () => {
    const file = els.importFile.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = store.importJson(text);
    els.hint.textContent = result.message;
    els.importFile.value = "";
  });
}

async function init() {
  const trophies = await loadTrophies();
  store = createStore(trophies);
  detail = createDetail({
    overlay: els.overlay,
    content: els.detailContent,
    closeBtn: els.detailClose,
    store,
  });
  wireControls();
  store.subscribe(renderAll);
  renderAll();
  lightTheSign(els.sign);
  revealOnScroll(document.querySelectorAll(".stage, section, .dash, .progress-block"));

  const mode = readShotMode();
  if (mode) applyShotMode(mode, { store, openDetail: (id) => detail.open(id) });
}

init().catch((err) => {
  els.grid.innerHTML = "";
  els.emptyState.hidden = false;
  els.emptyState.textContent = `The guide could not start: ${err.message} If you opened this file directly from disk, serve the folder instead (node serve.ts) — browsers will not load the trophy data from a file:// page.`;
});
