// guides.js — the trophy detail view.
//
// Clicking a mile-marker card opens this overlay: the official
// description in full, the trophy's kind and grade, its missable flag
// when it carries one, the target counter when it has one, the guide
// written for PLATINUM ROAD, and the sources line. The spoiler shield
// applies here too — an unearned story trophy stays masked until it
// is earned, even in its own detail view.

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

export const SOURCES_LINE = "Official PS5 trophy list via Exophase and PSNProfiles.";

export function isMasked(trophy, store) {
  return store.shield() && trophy.kind === "story" && !store.isEarned(trophy.id);
}

export function displayName(trophy, store) {
  return isMasked(trophy, store) ? "SPOILER SEALED" : trophy.name;
}

export function displayDescription(trophy, store) {
  return isMasked(trophy, store)
    ? "This story trophy is sealed by the spoiler shield. Earn it — or switch the shield off — to read what it asks for."
    : trophy.description;
}

export function formatTargetValue(trophy, value) {
  const target = trophy.target;
  const shown = (target.prefix ?? "") + value.toLocaleString("en-US") + (target.unit ?? "");
  const total = (target.prefix ?? "") + target.total.toLocaleString("en-US") + (target.unit ?? "");
  return `${shown} / ${total}`;
}

function counterHtml(trophy, store) {
  if (!trophy.target) return "";
  const value = store.counter(trophy.id);
  return `
    <div class="detail-counter">
      <p class="counter-label">${trophy.target.label}: <strong>${formatTargetValue(trophy, value)}</strong></p>
      <div class="counter-btns">
        <button type="button" class="stepper" data-step="-1" aria-label="Decrease ${trophy.target.label}">−</button>
        <button type="button" class="stepper" data-step="1" aria-label="Increase ${trophy.target.label}">+</button>
      </div>
    </div>`;
}

export function openDetail({ overlay, card }, trophy, store, { onToggleEarned }) {
  const masked = isMasked(trophy, store);
  const earned = store.isEarned(trophy.id);
  card.innerHTML = `
    <button type="button" class="detail-close" data-close aria-label="Close detail view">×</button>
    <p class="detail-grade grade-${trophy.grade}">${GRADE_LABEL[trophy.grade]} · ${KIND_LABEL[trophy.kind]}${trophy.missable ? ' · <span class="watch-flag">MISSABLE WATCH</span>' : ""}</p>
    <h3 id="detailName" class="${masked ? "masked-name" : ""}">${displayName(trophy, store)}</h3>
    <p class="detail-desc ${masked ? "masked-desc" : ""}">${displayDescription(trophy, store)}</p>
    ${masked ? "" : `<div class="detail-guide"><h4>The Guide</h4><p>${trophy.guide}</p></div>`}
    ${counterHtml(trophy, store)}
    <p class="detail-sources">${SOURCES_LINE}</p>
    <button type="button" class="dash-btn detail-toggle" data-toggle>${earned ? "Mark as unearned" : "Stamp it EARNED"}</button>
  `;
  overlay.hidden = false;

  const close = () => {
    overlay.hidden = true;
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (event) => {
    if (event.key === "Escape") close();
  };
  document.addEventListener("keydown", onKey);
  overlay.onclick = (event) => {
    if (event.target === overlay) close();
  };
  card.querySelector("[data-close]").addEventListener("click", close);
  card.querySelector("[data-toggle]").addEventListener("click", () => {
    onToggleEarned(trophy.id);
    close();
  });
  for (const button of card.querySelectorAll(".stepper")) {
    button.addEventListener("click", () => {
      store.bumpCounter(trophy, Number(button.dataset.step));
      const label = card.querySelector(".counter-label strong");
      if (label) label.textContent = formatTargetValue(trophy, store.counter(trophy.id));
    });
  }
  card.querySelector("[data-close]").focus();
}
