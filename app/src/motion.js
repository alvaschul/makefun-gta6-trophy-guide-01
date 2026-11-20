// motion.js — small motion helpers.
//
// Cards and stage signs fade-and-rise as they scroll into view, the
// masthead sign flickers on like a real neon tube at load, and the
// road's dashes drift while progress changes. All of it is decoration:
// when the user prefers reduced motion, or IntersectionObserver is
// unavailable, everything is simply visible and static.

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export function prefersReducedMotion() {
  return reducedMotion.matches;
}

export function revealOnScroll(elements, root = null) {
  const list = [...elements];
  if (prefersReducedMotion() || typeof IntersectionObserver !== "function") {
    for (const el of list) el.classList.add("revealed");
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      }
    },
    { root, threshold: 0.08 }
  );
  for (const el of list) {
    el.classList.add("reveal");
    observer.observe(el);
  }
}

export function signOn(element) {
  if (!element || prefersReducedMotion()) return;
  element.classList.add("sign-on");
}
