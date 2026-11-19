// motion.js — the small moving parts: the sign's flicker-in when the page
// lights up, and scroll-reveal for the sections. Everything here steps
// aside when the visitor prefers reduced motion (the stylesheet also
// hard-disables animation under that preference).

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Add the class that plays the masthead's neon flicker exactly once.
export function lightTheSign(signEl) {
  if (!signEl) return;
  if (prefersReducedMotion()) {
    signEl.classList.add("lit");
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => signEl.classList.add("lit"));
  });
}

// Fade-and-rise elements carrying .reveal as they enter the viewport.
// Without IntersectionObserver (or with reduced motion) everything is
// simply shown.
export function revealOnScroll(elements) {
  const els = [...elements];
  if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.08 },
  );
  els.forEach((el) => observer.observe(el));
}
