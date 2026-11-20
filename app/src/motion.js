// motion.js — small touches of life for the night highway.
//
// Sections and signs fade up as they roll into view, and that is
// deliberately all: the neon flicker lives in CSS, and everything
// here steps aside entirely for visitors who prefer reduced motion.

export function initMotion() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.06 }
  );
  targets.forEach((el) => observer.observe(el));
}
