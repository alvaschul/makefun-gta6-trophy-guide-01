// motion.js — the JS-driven half of the VICE NIGHT HIGHWAY motion:
// the roadside sign's letters are split so the neon flicker-in can
// stagger across the title, and roadmap highway signs light up in
// sequence as they scroll into view. Everything degrades cleanly:
// with prefers-reduced-motion, or in a frozen ?shot= capture, the CSS
// leaves every element in its final state and this file adds the
// lit class immediately instead of observing.

export function splitSignLetters(titleElement) {
  if (!titleElement || titleElement.dataset.split === 'done') return;
  const text = titleElement.textContent;
  titleElement.dataset.split = 'done';
  titleElement.replaceChildren();
  [...text].forEach((char, index) => {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = char === ' ' ? ' ' : char;
    span.style.animationDelay = `${index * 55}ms`;
    titleElement.append(span);
  });
}

export function lightRoadmapSigns(container) {
  if (!container) return;
  const cards = [...container.querySelectorAll('.stage-card')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frozen = document.body.classList.contains('shot-mode');
  if (reduced || frozen || !('IntersectionObserver' in window)) {
    for (const card of cards) card.classList.add('lit');
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const index = cards.indexOf(entry.target);
      window.setTimeout(() => entry.target.classList.add('lit'), Math.max(0, index) * 130);
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.25 });
  for (const card of cards) {
    if (!card.classList.contains('lit')) observer.observe(card);
  }
}

export function initMotion({ signTitle, roadmapStages }) {
  splitSignLetters(signTitle);
  lightRoadmapSigns(roadmapStages);
  // The roadmap re-renders whenever progress changes; keep watching
  // its children so fresh signs get observed (or lit) too.
  if (roadmapStages && 'MutationObserver' in window) {
    const watcher = new MutationObserver(() => lightRoadmapSigns(roadmapStages));
    watcher.observe(roadmapStages, { childList: true });
  }
}
