// motion.js — the small hours of the neon: reveal-on-scroll for the
// panels and a careful respect for players who prefer it calm.
// The sign's flicker-in lives in CSS; this file only decides when
// sections light up as the drive brings them into view.

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)");

export function prefersReducedMotion() {
  return REDUCED.matches;
}

export function armReveal(scope = document) {
  const targets = scope.querySelectorAll(".reveal");
  if (REDUCED.matches || !("IntersectionObserver" in window)) {
    for (const el of targets) el.classList.add("lit");
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("lit");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.08 },
  );
  for (const el of targets) io.observe(el);
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  requestAnimationFrame(() => {
    setTimeout(() => el.scrollIntoView({ block: "start", behavior: "auto" }), 60);
  });
}
