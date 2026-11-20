// guides.js — the trophy detail view: one mile marker, up close.
//
// The overlay shows the official description, the kind and grade,
// the missable flag when there is one, the strategy guide in this
// project's own words, the sources line, a working target counter
// for grind trophies, and the same earned toggle as the card —
// all driven through hooks supplied by main.js so this module
// never touches storage directly.

import { formatCount } from './tracker.js';

let overlayEl = null;
let bodyEl = null;
let hooks = null;
let currentId = null;

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function renderDetail() {
  if (currentId === null || !hooks) return;
  const trophy = hooks.getTrophy(currentId);
  if (!trophy) return;
  const earned = hooks.isEarned(trophy.id);
  const masked = hooks.isMasked(trophy);
  const name = masked ? '— masked by the Spoiler Shield —' : trophy.name;
  const desc = masked
    ? 'This story trophy is still unearned, so the Spoiler Shield is hiding what it is. Earn it in game, or switch the shield off in the dash panel.'
    : trophy.description;

  let counterHtml = '';
  if (trophy.target) {
    const value = hooks.getCount(trophy.id);
    counterHtml = `
      <div class="counter-row">
        <button type="button" class="counter-btn" id="dCountDown" aria-label="Decrease counter">−</button>
        <span class="counter-val"><b>${esc(formatCount(trophy, value))}</b> / ${esc(formatCount(trophy, trophy.target.goal))} ${esc(trophy.target.unit)}</span>
        <button type="button" class="counter-btn" id="dCountUp" aria-label="Increase counter">+</button>
      </div>`;
  }

  bodyEl.innerHTML = `
    <p class="d-grade">Mile ${trophy.id} · ${esc(gradeLabel(trophy.grade))} · ${esc(trophy.kind)}</p>
    <h3 class="d-name" id="dName">${esc(name)}</h3>
    <p class="d-desc">${esc(desc)}</p>
    <div class="d-meta">
      <span class="chip chip-kind">${esc(trophy.kind)}</span>
      <span class="chip">${esc(gradeLabel(trophy.grade))}</span>
      ${trophy.missable ? '<span class="chip chip-miss">Missable watch</span>' : ''}
      ${earned ? '<span class="chip">Earned</span>' : ''}
    </div>
    <h4 class="d-guide-title">The Guide</h4>
    <p class="d-guide">${esc(trophy.guide)}</p>
    <p class="d-source">Source: official PS5 trophy list — via Exophase and PSNProfiles.</p>
    <div class="d-actions">
      <button type="button" class="d-earn-btn${earned ? ' is-earned' : ''}" id="dEarnBtn">${earned ? 'Earned — tap to unmark' : 'Mark as earned'}</button>
      ${counterHtml}
    </div>`;

  document.getElementById('dEarnBtn').addEventListener('click', () => {
    hooks.onToggleEarned(trophy.id);
    renderDetail();
  });
  if (trophy.target) {
    document.getElementById('dCountDown').addEventListener('click', () => {
      hooks.onSetCount(trophy.id, hooks.getCount(trophy.id) - trophy.target.step);
      renderDetail();
    });
    document.getElementById('dCountUp').addEventListener('click', () => {
      hooks.onSetCount(trophy.id, hooks.getCount(trophy.id) + trophy.target.step);
      renderDetail();
    });
  }
}

export function initDetail(overlay, body, closeButton, detailHooks) {
  overlayEl = overlay;
  bodyEl = body;
  hooks = detailHooks;
  closeButton.addEventListener('click', closeDetail);
  overlayEl.addEventListener('click', (event) => {
    if (event.target === overlayEl) closeDetail();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlayEl.hidden) closeDetail();
  });
}

export function openDetail(id) {
  currentId = id;
  renderDetail();
  overlayEl.hidden = false;
}

export function closeDetail() {
  overlayEl.hidden = true;
  currentId = null;
}
