// guides.js — the trophy detail view: official description, our guide, the
// sources line, the missable flag and the target counter, all in one panel.
//
// It also owns the spoiler-shield masking rules, so cards and the detail
// view can never disagree about what is hidden.

export const MASKED_NAME = "▓▓▓▓▓▓▓▓▓▓";
export const MASKED_DESC = "Hidden by the spoiler shield — earn it, or lower the shield in the dash panel, to read it.";

export function isMasked(trophy, store) {
  return store.shield && trophy.kind === "story" && !store.isEarned(trophy.id);
}

export function fmt(n) {
  return Number(n).toLocaleString("en-US");
}

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function kindLabel(kind) {
  return { story: "Story", collectibles: "Collectibles", activities: "Activities", online: "Online" }[kind] ?? kind;
}

export function counterHtml(trophy, store) {
  if (!trophy.target) return "";
  const value = store.count(trophy.id);
  return (
    `<div class="counter" data-counter="${trophy.id}">` +
    `<button type="button" data-step="-1" aria-label="Decrease counter">−</button>` +
    `<span class="counter-value">${fmt(value)} / ${fmt(trophy.target)}</span>` +
    `<button type="button" data-step="1" aria-label="Increase counter">+</button>` +
    `<span class="counter-unit">${esc(trophy.unit ?? "")}</span></div>`
  );
}

export function wireCounter(root, store) {
  const box = root.querySelector("[data-counter]");
  if (!box) return;
  const id = Number(box.dataset.counter);
  const trophy = store.byId.get(id);
  box.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const dir = Number(btn.dataset.step);
      store.setCount(id, store.count(id) + dir * (trophy.step || 1));
    });
  });
}

export function createDetail({ overlay, content, closeBtn, store, onOpenRoadmap }) {
  let currentId = null;

  function close() {
    overlay.hidden = true;
    currentId = null;
    document.body.style.overflow = "";
  }

  function open(id) {
    const trophy = store.byId.get(id);
    if (!trophy) return;
    currentId = id;
    const masked = isMasked(trophy, store);
    const earned = store.isEarned(id);

    const tags = [
      `<span class="tag">${esc(kindLabel(trophy.kind))}</span>`,
      `<span class="tag">${esc(gradeLabel(trophy.grade))}</span>`,
    ];
    if (trophy.missable) tags.push(`<span class="tag tag-missable">Missable watch</span>`);
    if (masked) tags.push(`<span class="tag tag-spoiler">Spoiler shielded</span>`);

    content.innerHTML =
      `<span class="mile detail-mile">MILE ${trophy.id}</span>` +
      `<h3 class="detail-name" id="detail-name">${masked ? MASKED_NAME : esc(trophy.name)}</h3>` +
      `<div class="detail-meta">${tags.join("")}</div>` +
      `<p class="detail-official">Official description</p>` +
      `<p class="detail-desc">${masked ? MASKED_DESC : esc(trophy.description)}</p>` +
      `<p class="detail-official">The guide</p>` +
      `<p class="detail-guide">${masked ? "The guide for this one stays under the shield too — no late-game surprises here." : esc(trophy.guide)}</p>` +
      counterHtml(trophy, store) +
      `<div class="detail-actions">` +
      `<button type="button" class="earn-btn${earned ? " is-earned" : ""}" id="detail-earn">${earned ? "Earned ✓ — tap to undo" : "Stamp it earned"}</button>` +
      `</div>` +
      `<p class="detail-sources">Sources: ${esc(trophy.sources)}</p>`;

    wireCounter(content, store);
    content.querySelector("#detail-earn").addEventListener("click", () => {
      store.toggleEarned(id);
      open(id); // re-render in place with the new state
    });

    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlay.hidden) close();
  });

  // When the store changes while a detail is open (counter steppers, the
  // earn button), refresh the panel so it never shows stale numbers.
  store.subscribe(() => {
    if (currentId !== null && !overlay.hidden) {
      const id = currentId;
      const active = document.activeElement;
      open(id);
      if (active && active.id === "detail-close") closeBtn.focus();
    }
  });

  return { open, close, onOpenRoadmap };
}
