// guides.js — the trophy detail view and the spoiler shield's rules.
// One place decides what a masked trophy looks like and what the
// detail panel shows, so the checklist, roadmap and watch list can
// never disagree about it.

import {
  trophyById,
  isEarned,
  getCount,
  setCount,
  toggleEarned,
  spoilerOn,
} from "./tracker.js";

export const GRADE_LABEL = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

export const KIND_LABEL = {
  story: "Story",
  collectibles: "Collectibles",
  activities: "Activities",
  online: "Online",
};

const MASKED_NAME = "— — — — — —";
const MASKED_DESC = "Hidden by the spoiler shield. Earn it, or drop the shield, to read on.";

// Story trophies hide behind the shield until they are earned; the
// rest of the list is fair game because its descriptions give away
// activities, not plot.
export function isMasked(trophy) {
  return spoilerOn() && trophy.kind === "story" && !isEarned(trophy.id);
}

export function displayName(trophy) {
  return isMasked(trophy) ? MASKED_NAME : trophy.name;
}

export function displayDesc(trophy) {
  return isMasked(trophy) ? MASKED_DESC : trophy.description;
}

export function firstSentence(text) {
  const match = /^(.*?[.!?])(\s|$)/.exec(text || "");
  return match ? match[1] : text || "";
}

let overlayEl = null;
let currentId = null;

function els() {
  return {
    overlay: document.getElementById("detailOverlay"),
    grade: document.getElementById("detailGrade"),
    name: document.getElementById("detailName"),
    official: document.getElementById("detailOfficial"),
    meta: document.getElementById("detailMeta"),
    counter: document.getElementById("detailCounter"),
    counterLabel: document.getElementById("counterLabel"),
    counterValue: document.getElementById("counterValue"),
    counterGoal: document.getElementById("counterGoal"),
    counterFill: document.getElementById("counterFill"),
    guide: document.getElementById("detailGuide"),
    sources: document.getElementById("detailSources"),
    earn: document.getElementById("detailEarn"),
  };
}

export function openDetail(id) {
  const trophy = trophyById(id);
  if (!trophy) return;
  currentId = id;
  const e = els();
  overlayEl = e.overlay;
  const masked = isMasked(trophy);

  e.grade.textContent = `${GRADE_LABEL[trophy.grade]} trophy`;
  e.grade.style.color = `var(--${trophy.grade})`;
  e.name.textContent = displayName(trophy);
  e.official.textContent = displayDesc(trophy);

  e.meta.innerHTML = "";
  const metaItems = [KIND_LABEL[trophy.kind], `Trophy #${trophy.id} of 55`];
  if (trophy.missable) metaItems.push("⚠ Missable watch");
  if (isEarned(trophy.id)) metaItems.push("Earned");
  for (const item of metaItems) {
    const li = document.createElement("li");
    li.textContent = item;
    if (item.includes("Missable")) li.className = "meta-missable";
    e.meta.appendChild(li);
  }

  if (trophy.target) {
    e.counter.hidden = false;
    e.counterLabel.textContent = trophy.target.label;
    paintCounter(trophy);
  } else {
    e.counter.hidden = true;
  }

  e.guide.textContent = masked
    ? "The guide for this one would spoil the story beat it belongs to. Earn the trophy or drop the spoiler shield to read it."
    : trophy.guide;
  e.sources.textContent = `Sources: ${trophy.sources || "Official PS5 trophy list — Exophase · PSNProfiles"}`;
  paintEarnButton(trophy);

  e.overlay.hidden = false;
  document.getElementById("detailClose").focus();
}

function paintCounter(trophy) {
  const e = els();
  const value = getCount(trophy.id);
  e.counterValue.textContent = value.toLocaleString("en-US");
  e.counterGoal.textContent = `/ ${trophy.target.goal.toLocaleString("en-US")}`;
  e.counterFill.style.width = `${Math.min(100, (value / trophy.target.goal) * 100)}%`;
}

function paintEarnButton(trophy) {
  const e = els();
  e.earn.textContent = isEarned(trophy.id) ? "Earned ✓ — tap to unmark" : "Mark earned";
}

export function closeDetail() {
  if (overlayEl) overlayEl.hidden = true;
  currentId = null;
}

export function wireDetail() {
  const e = els();
  document.getElementById("detailClose").addEventListener("click", closeDetail);
  e.overlay.addEventListener("click", (event) => {
    if (event.target === e.overlay) closeDetail();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && currentId !== null) closeDetail();
  });
  e.earn.addEventListener("click", () => {
    if (currentId === null) return;
    toggleEarned(currentId);
    const trophy = trophyById(currentId);
    if (trophy) paintEarnButton(trophy);
  });
  document.getElementById("counterMinus").addEventListener("click", () => stepCounter(-1));
  document.getElementById("counterPlus").addEventListener("click", () => stepCounter(1));
}

function stepCounter(direction) {
  if (currentId === null) return;
  const trophy = trophyById(currentId);
  if (!trophy || !trophy.target) return;
  setCount(currentId, getCount(currentId) + direction * trophy.target.step);
  paintCounter(trophy);
  paintEarnButton(trophy);
}

// If the save changes while a detail is open (a counter finishing a
// trophy, an import landing), repaint so the panel never lies.
export function refreshDetail() {
  if (currentId === null) return;
  const trophy = trophyById(currentId);
  if (!trophy) return;
  if (!document.getElementById("detailOverlay").hidden) openDetail(currentId);
}
