/* ==========================================================================
   POLISH LAYER JS — custom cursor, magnetic buttons, subtle card tilt.
   Desktop-only, additive, and disabled for touch / reduced-motion.
   No dependency on existing scripts; purely enhances interaction feel.
   ========================================================================== */
(() => {
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const wideEnough = window.innerWidth >= 1024;
  const desktop = finePointer && wideEnough && !prefersReduced;

  const lerp = (a, b, n) => a + (b - a) * n;

  /* ---------- Custom cursor ---------- */
  function initCursor() {
    const dot = document.createElement("div");
    dot.className = "pl-cursor";
    dot.setAttribute("aria-hidden", "true");
    const ring = document.createElement("div");
    ring.className = "pl-cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add("pl-has-cursor");

    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2;
    let rx = mx,
      ry = my;
    let active = false;

    window.addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        if (!active) {
          active = true;
          document.body.classList.add("pl-cursor-active");
        }
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", () => {
      document.body.classList.remove("pl-cursor-active");
      active = false;
    });

    const interactive =
      "a, button, [role='button'], input, textarea, select, .project-card, .design-tile, .kurz-skill-card, .tech-node, .status-card, .support-card, summary, .faq-question";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(interactive))
        document.body.classList.add("pl-cursor-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(interactive))
        document.body.classList.remove("pl-cursor-hover");
    });

    (function raf() {
      rx = lerp(rx, mx, 0.18);
      ry = lerp(ry, my, 0.18);
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(raf);
    })();
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    const targets = document.querySelectorAll(
      ".btn-arcane, .hero-editorial__cta, .contact-form__submit, .projects-cta-all, .tech-aside__cta, .footer-end__top, #btn-topo, #btn-share"
    );
    targets.forEach((el) => {
      el.classList.add("pl-magnetic");
      const strength = 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.setProperty("--mx", `${x * strength}px`);
        el.style.setProperty("--my", `${y * strength}px`);
      });
      el.addEventListener("mouseleave", () => {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---------- Subtle 3D tilt on media cards ---------- */
  function initTilt() {
    const cards = document.querySelectorAll(
      "#projetos .project-card, #projetos-design .design-tile"
    );
    cards.forEach((card) => {
      const media =
        card.querySelector(".project-card__media") ||
        card.querySelector(".design-tile__media") ||
        card;
      card.style.transformStyle = "preserve-3d";
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        media.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${
          -py * 5
        }deg)`;
      });
      card.addEventListener("mouseleave", () => {
        media.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
      });
    });
  }

  function start() {
    if (!desktop) return;
    initCursor();
    initMagnetic();
    initTilt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
