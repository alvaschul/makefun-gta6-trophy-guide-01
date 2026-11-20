// main.js — boot and wiring for PLATINUM ROAD.
//
// Loads the trophy data, builds the store, applies any ?shot= scene,
// renders the checklist, the Missable Watch and the roadmap, and wires
// the dash panel: search, kind chips, grade and earned-state selects,
// the spoiler shield, and progress export/import. Re-renders are
// driven by the store's subscription, so every control and counter
// stays in step without manual bookkeeping.

import { createStore, loadTrophies } from "./tracker.js";
import { GRADE_LABEL, displayDescription, displayName, isMasked, openDetail } from "./guides.js";
import { renderRoadmap } from "./roadmap.js";
import { shotPlan } from "./shots.js";
import { revealOnScroll, signOn } from "./motion.js";

const $ = (id) => document.getElementById(id);

const els = {
  roadBar: $("roadBar"),
  progressFill: $("progressFill"),
  progressText: $("progressText"),
  gradeCounts: $("gradeCounts"),
  search: $("searchInput"),
  kindFilters: $("kindFilters"),
  gradeFilter: $("gradeFilter"),
  stateFilter: $("stateFilter"),
  shield: $("spoilerToggle"),
  exportBtn: $("exportBtn"),
  importBtn: $("importBtn"),
  importFile: $("importFile"),
  note: $("dashNote"),
  grid: $("checklistGrid"),
  resultCount: $("resultCount"),
  emptyNote: $("emptyNote"),
  watchList: $("watchList"),
  stages: $("roadmapStages"),
  overlay: $("detailOverlay"),
  detailCard: $("detailCard"),
  sign: $("mastheadSign"),
};

const filters = { text: "", kind: "all", grade: "all", state: "all" };

let trophies = [];
let store = null;

function visibleTrophies() {
  const needle = filters.text.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filters.kind !== "all" && trophy.kind !== filters.kind) return false;
    if (filters.grade !== "all" && trophy.grade !== filters.grade) return false;
    if (filters.state === "earned" && !store.isEarned(trophy.id)) return false;
    if (filters.state === "unearned" && store.isEarned(trophy.id)) return false;
    if (needle) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
}

function cardHtml(trophy) {
  const earned = store.isEarned(trophy.id);
  const masked = isMasked(trophy, store);
  const counter = trophy.target
    ? `<p class="card-counter">${trophy.target.label}: ${store.counter(trophy.id)} / ${trophy.target.total}</p>`
    : "";
  const teaser = masked ? "" : `<p class="card-guide">${trophy.guide.split(/(?<=\.)\s/)[0]}</p>`;
  return `
    <div class="marker-top grade-${trophy.grade}">
      <span class="marker-grade">${GRADE_LABEL[trophy.grade]}</span>
      ${trophy.missable ? '<span class="marker-watch" title="On the Missable Watch">WATCH</span>' : ""}
    </div>
    <h3 class="card-name ${masked ? "masked-name" : ""}">${displayName(trophy, store)}</h3>
    <p class="card-desc ${masked ? "masked-desc" : ""}">${displayDescription(trophy, store)}</p>
    ${teaser}
    ${counter}
    <div class="card-actions">
      <button type="button" class="card-open" data-open="${trophy.id}">Guide</button>
      <button type="button" class="card-stamp ${earned ? "stamped" : ""}" data-toggle="${trophy.id}" aria-pressed="${earned}">${earned ? "EARNED ✓" : "Mark earned"}</button>
    </div>
  `;
}

function renderChecklist() {
  const visible = visibleTrophies();
  els.grid.innerHTML = "";
  for (const trophy of visible) {
    const card = document.createElement("article");
    card.className = `trophy-card${store.isEarned(trophy.id) ? " is-earned" : ""}`;
    card.innerHTML = cardHtml(trophy);
    card.querySelector("[data-open]").addEventListener("click", () => showDetail(trophy));
    card.querySelector("[data-toggle]").addEventListener("click", () => store.toggleEarned(trophy.id));
    els.grid.appendChild(card);
  }
  els.resultCount.textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
  if (visible.length === 0) {
    els.emptyNote.hidden = false;
    els.emptyNote.textContent =
      filters.kind === "online"
        ? "No trophies in the official PS5 list are tagged online — the story of Leonida is a single-player road. Try another kind."
        : "No trophies match that combination. Loosen a filter or clear the search to see the whole road again.";
  } else {
    els.emptyNote.hidden = true;
  }
  revealOnScroll(els.grid.querySelectorAll(".trophy-card"));
}

function renderProgress() {
  const total = trophies.length;
  const earned = store.earnedCount();
  const pct = total ? Math.round((earned / total) * 100) : 0;
  els.progressFill.style.width = `${pct}%`;
  els.roadBar.setAttribute("aria-valuenow", String(earned));
  els.progressText.textContent = `${earned} of ${total} trophies earned · ${pct}%`;
  const grades = ["platinum", "gold", "silver", "bronze"];
  els.gradeCounts.innerHTML = grades
    .map((grade) => {
      const inGrade = trophies.filter((t) => t.grade === grade);
      const got = inGrade.filter((t) => store.isEarned(t.id)).length;
      return `<li class="grade-pill grade-${grade}">${GRADE_LABEL[grade]} ${got}/${inGrade.length}</li>`;
    })
    .join("");
}

function renderWatch() {
  const flagged = trophies.filter((t) => t.missable);
  els.watchList.innerHTML = flagged
    .map((trophy) => {
      const earned = store.isEarned(trophy.id);
      return `<li class="watch-row ${earned ? "watch-done" : ""}">
        <span class="watch-name">${trophy.name}</span>
        <span class="watch-why">${trophy.description}</span>
        <span class="watch-state">${earned ? "EARNED ✓" : "not yet"}</span>
      </li>`;
    })
    .join("");
}

function renderAll() {
  renderProgress();
  renderChecklist();
  renderWatch();
  renderRoadmap(els.stages, trophies, store, { onOpen: showDetail });
  els.shield.checked = store.shield();
}

function showDetail(trophy) {
  openDetail({ overlay: els.overlay, card: els.detailCard }, trophy, store, {
    onToggleEarned: (id) => store.toggleEarned(id),
  });
}

function wireControls() {
  els.search.addEventListener("input", () => {
    filters.text = els.search.value;
    renderChecklist();
  });
  els.kindFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-kind]");
    if (!button) return;
    filters.kind = button.dataset.kind;
    for (const chip of els.kindFilters.querySelectorAll(".chip")) {
      chip.classList.toggle("chip-on", chip === button);
    }
    renderChecklist();
  });
  els.gradeFilter.addEventListener("change", () => {
    filters.grade = els.gradeFilter.value;
    renderChecklist();
  });
  els.stateFilter.addEventListener("change", () => {
    filters.state = els.stateFilter.value;
    renderChecklist();
  });
  els.shield.addEventListener("change", () => store.setShield(els.shield.checked));
  els.exportBtn.addEventListener("click", () => {
    const blob = new Blob([store.snapshot()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "platinum-road-progress.json";
    link.click();
    URL.revokeObjectURL(url);
    els.note.textContent = "Progress exported — keep the file somewhere safe.";
  });
  els.importBtn.addEventListener("click", () => els.importFile.click());
  els.importFile.addEventListener("change", async () => {
    const file = els.importFile.files?.[0];
    if (!file) return;
    const result = store.restore(await file.text());
    els.note.textContent = result.message;
    els.importFile.value = "";
  });
}

async function boot() {
  trophies = await loadTrophies();
  store = createStore(trophies);

  const plan = shotPlan();
  if (plan) {
    document.body.className = plan.bodyClass;
    store.seedForShot(plan.seed);
  }

  wireControls();
  store.subscribe(renderAll);
  renderAll();
  signOn(els.sign);

  if (plan?.scrollTo) {
    requestAnimationFrame(() => {
      document.getElementById(plan.scrollTo)?.scrollIntoView({ block: "start" });
    });
  }
  if (plan?.openDetailId) {
    const trophy = trophies.find((t) => t.id === plan.openDetailId);
    if (trophy) showDetail(trophy);
  }
}

boot().catch((error) => {
  els.note.textContent = `The guide could not start: ${error.message}`;
  console.error(error);
});
