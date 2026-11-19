// main.js — ignition. Boots the tracker: loads the data, paints the
// road, the watch, the roadmap and the checklist, then keeps every
// panel honest whenever the save changes.

import {
  loadTrophies,
  loadSave,
  allTrophies,
  isEarned,
  getCount,
  toggleEarned,
  spoilerOn,
  setSpoiler,
  progress,
  subscribe,
  exportSave,
  importSave,
} from "./tracker.js";
import {
  GRADE_LABEL,
  KIND_LABEL,
  displayName,
  displayDesc,
  firstSentence,
  isMasked,
  openDetail,
  wireDetail,
  refreshDetail,
} from "./guides.js";
import { renderRoadmap } from "./roadmap.js";
import { applyShotMode } from "./shots.js";
import { armReveal } from "./motion.js";

const filters = { search: "", kind: "all", grade: "all", state: "all" };
const $ = (id) => document.getElementById(id);

function matchesFilters(trophy) {
  if (filters.kind !== "all" && trophy.kind !== filters.kind) return false;
  if (filters.grade !== "all" && trophy.grade !== filters.grade) return false;
  if (filters.state === "earned" && !isEarned(trophy.id)) return false;
  if (filters.state === "unearned" && isEarned(trophy.id)) return false;
  if (filters.search) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(filters.search)) return false;
  }
  return true;
}

function paintProgress() {
  const p = progress();
  $("progressText").textContent = `${p.earned} of ${p.total} trophies · ${p.pct}%`;
  $("roadFill").style.width = `${p.pct}%`;
  $("roadBar").setAttribute("aria-valuenow", String(p.earned));
  $("countPlatinum").textContent = `${p.perGrade.platinum.earned}/${p.perGrade.platinum.total}`;
  $("countGold").textContent = `${p.perGrade.gold.earned}/${p.perGrade.gold.total}`;
  $("countSilver").textContent = `${p.perGrade.silver.earned}/${p.perGrade.silver.total}`;
  $("countBronze").textContent = `${p.perGrade.bronze.earned}/${p.perGrade.bronze.total}`;
}

function buildCard(trophy) {
  const earned = isEarned(trophy.id);
  const masked = isMasked(trophy);
  const card = document.createElement("article");
  card.className = "card" + (earned ? " is-earned" : "");
  card.dataset.grade = trophy.grade;

  const top = document.createElement("div");
  top.className = "card-top";
  const disc = document.createElement("button");
  disc.type = "button";
  disc.className = "marker-disc";
  disc.textContent = "✓";
  disc.title = earned ? "Mark as not earned" : "Mark as earned";
  disc.setAttribute("aria-label", `${earned ? "Unmark" : "Mark"} ${trophy.name} as earned`);
  disc.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleEarned(trophy.id);
  });
  const grade = document.createElement("span");
  grade.className = `card-grade card-grade-${trophy.grade}`;
  grade.textContent = GRADE_LABEL[trophy.grade];
  const kind = document.createElement("span");
  kind.className = "card-kind";
  kind.textContent = KIND_LABEL[trophy.kind];
  top.append(disc, grade, kind);

  const name = document.createElement("h3");
  name.className = "card-name" + (masked ? " masked" : "");
  name.textContent = displayName(trophy);

  const desc = document.createElement("p");
  desc.className = "card-desc" + (masked ? " masked" : "");
  desc.textContent = displayDesc(trophy);

  const guide = document.createElement("p");
  guide.className = "card-guide";
  guide.textContent = masked
    ? "Guide hidden by the spoiler shield."
    : firstSentence(trophy.guide);

  const foot = document.createElement("div");
  foot.className = "card-foot";
  if (trophy.missable) {
    const badge = document.createElement("span");
    badge.className = "badge-missable";
    badge.textContent = "⚠ Missable watch";
    foot.appendChild(badge);
  }
  if (trophy.target) {
    const counter = document.createElement("span");
    counter.className = "card-counter";
    counter.textContent = `${getCount(trophy.id).toLocaleString("en-US")} / ${trophy.target.goal.toLocaleString("en-US")}`;
    foot.appendChild(counter);
  }

  const stamp = document.createElement("span");
  stamp.className = "stamp";
  stamp.textContent = "EARNED";

  card.append(top, name, desc, guide, foot, stamp);
  card.addEventListener("click", () => openDetail(trophy.id));
  return card;
}

function paintGrid() {
  const grid = $("trophyGrid");
  grid.innerHTML = "";
  const visible = allTrophies().filter(matchesFilters);
  for (const trophy of visible) grid.appendChild(buildCard(trophy));
  $("listCount").textContent = `— showing ${visible.length} of ${allTrophies().length}`;
  const empty = $("emptyState");
  empty.hidden = visible.length > 0;
  if (visible.length === 0) {
    $("emptyBody").textContent =
      filters.kind === "online"
        ? "Honest answer: the official list has no online trophies — all 55 are earned in the single-player game, so this filter has nothing to show."
        : "No trophies match the current dash settings. Loosen a filter and the road fills up again.";
  }
}

function paintWatch() {
  const list = $("watchList");
  list.innerHTML = "";
  for (const trophy of allTrophies().filter((t) => t.missable)) {
    const li = document.createElement("li");
    li.className = "watch-item" + (isEarned(trophy.id) ? " is-earned" : "");
    const btn = document.createElement("button");
    btn.type = "button";
    const dot = document.createElement("span");
    dot.className = "watch-dot";
    btn.append(dot, document.createTextNode(displayName(trophy)));
    btn.addEventListener("click", () => openDetail(trophy.id));
    li.appendChild(btn);
    list.appendChild(li);
  }
}

function paintAll() {
  paintProgress();
  paintWatch();
  renderRoadmap($("roadmap"), openDetail);
  paintGrid();
  refreshDetail();
  const toggle = $("spoilerToggle");
  toggle.checked = spoilerOn();
  $("spoilerState").textContent = spoilerOn() ? "ON" : "OFF";
}

let msgTimer = null;
function dashMessage(text) {
  const el = $("dashMsg");
  el.textContent = text;
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => (el.textContent = ""), 4200);
}

function wireDash() {
  $("searchInput").addEventListener("input", (e) => {
    filters.search = e.target.value.trim().toLowerCase();
    paintGrid();
  });
  $("kindFilter").addEventListener("change", (e) => {
    filters.kind = e.target.value;
    paintGrid();
  });
  $("gradeFilter").addEventListener("change", (e) => {
    filters.grade = e.target.value;
    paintGrid();
  });
  $("stateFilter").addEventListener("change", (e) => {
    filters.state = e.target.value;
    paintGrid();
  });
  $("spoilerToggle").addEventListener("change", (e) => setSpoiler(e.target.checked));
  $("exportBtn").addEventListener("click", () => {
    const blob = new Blob([exportSave()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platinum-road-progress.json";
    a.click();
    URL.revokeObjectURL(url);
    dashMessage("Progress exported — keep the file somewhere safe.");
  });
  $("importBtn").addEventListener("click", () => $("importFile").click());
  $("importFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      importSave(await file.text());
      dashMessage("Progress imported. Welcome back to the road.");
    } catch (err) {
      dashMessage(err.message);
    }
  });
}

async function boot() {
  await loadTrophies();
  loadSave();
  wireDash();
  wireDetail();
  paintAll();
  subscribe(paintAll);
  for (const panel of document.querySelectorAll("main .panel")) panel.classList.add("reveal");
  armReveal(document);
  applyShotMode();
}

boot().catch((err) => {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<p style="padding:16px;text-align:center">The tracker could not load its trophy data: ${err.message}</p>`,
  );
});
