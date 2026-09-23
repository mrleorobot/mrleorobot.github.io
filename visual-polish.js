/* One input loop for the existing artwork. No scroll interception or idle RAF. */
const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const slowUpdates = window.matchMedia('(update: slow)');
const connection = navigator.connection;

function initVisualPolish() {
  if (root.classList.contains('visual-polish-ready')) return;

  const surfaces = new Map();
  const visibleSurfaces = new Set();
  const animatedSections = [...document.querySelectorAll('main section[id]')];
  let active = null;
  let pointer = null;
  let frame = null;
  let suspended = document.hidden;
  let userPaused = false;
  const motionToggles = [...document.querySelectorAll('[data-motion-toggle]')];

  const motionAllowed = () => !userPaused && !reducedMotion.matches && !slowUpdates.matches && !connection?.saveData;
  const pointerAllowed = () => motionAllowed() && finePointer.matches && !suspended;

  const register = (selector, kind, imageSelector) => {
    document.querySelectorAll(selector).forEach((element) => {
      const image = imageSelector ? element.querySelector(imageSelector) : null;
      element.dataset.visualSurface = kind;
      surfaces.set(element, { element, kind, image, x: 0, y: 0, tx: 0, ty: 0 });

      if (image) {
        image.classList.add('visual-image');
        image.addEventListener('animationend', (event) => {
          if (event.animationName === 'visual-image-arrive') image.classList.add('visual-image-entered');
        });
        const media = image.closest('.project-thumbnail-wrapper, .ux-card__media, .gamedev-hud-bg');
        if (media) {
          media.classList.add('visual-image-frame');
          const reflection = document.createElement('span');
          reflection.className = 'visual-reflection';
          reflection.setAttribute('aria-hidden', 'true');
          media.append(reflection);
        }
      }
    });
  };

  register('.project-card', 'project', '.project-thumbnail-image');
  register('.ux-card', 'design', '.ux-card__media img');
  register('.gamedev-hud-container', 'game', '.gamedev-hud-bg img');
  register('.skills-capability-card, .testimonial-card, .status-card, .alumni-hero-card', 'surface');
  register('#hero, #cta-final', 'atmosphere');
  // Buttons stay where the visitor expects them; only artwork follows input.

  const restore = (state) => {
    state.x = state.y = state.tx = state.ty = 0;
    state.element.classList.remove('is-pointer-active');
    ['--visual-x', '--visual-y', '--visual-rx', '--visual-ry'].forEach((property) => {
      state.element.style.removeProperty(property);
    });
  };

  const cancelInput = () => {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    pointer = null;
    surfaces.forEach(restore);
    active = null;
  };

  const schedule = () => {
    if (frame === null && pointerAllowed()) frame = requestAnimationFrame(render);
  };

  const resetActive = () => {
    pointer = null;
    if (!active) return;
    active.tx = active.ty = 0;
    active.element.classList.remove('is-pointer-active');
    schedule();
  };

  function render() {
    frame = null;
    if (!active || !pointerAllowed()) return;

    const state = active;
    // One layout read per frame, before any style writes. Scrolling cancels input.
    if (pointer) {
      const rect = state.element.getBoundingClientRect();
      if (!rect.width || !rect.height) { resetActive(); return; }
      state.tx = Math.max(-1, Math.min(1, (pointer.x - rect.left) / rect.width * 2 - 1));
      state.ty = Math.max(-1, Math.min(1, (pointer.y - rect.top) / rect.height * 2 - 1));
      pointer = null;
    }

    state.x += (state.tx - state.x) * 0.16;
    state.y += (state.ty - state.y) * 0.16;
    const amplitude = state.kind === 'atmosphere' ? 16 : state.kind === 'button' ? 3 : 7;
    state.element.style.setProperty('--visual-x', `${(state.x * amplitude).toFixed(2)}px`);
    state.element.style.setProperty('--visual-y', `${(state.y * amplitude * 0.65).toFixed(2)}px`);
    state.element.style.setProperty('--visual-rx', `${(-state.y * 1.8).toFixed(2)}deg`);
    state.element.style.setProperty('--visual-ry', `${(state.x * 2.4).toFixed(2)}deg`);

    if (Math.abs(state.tx - state.x) + Math.abs(state.ty - state.y) > 0.005) {
      schedule();
    } else if (!state.element.classList.contains('is-pointer-active')) {
      restore(state);
      active = null;
    }
  }

  const setPointer = (event) => {
    if (event.pointerType !== 'mouse' || !pointerAllowed()) return;
    const target = event.target instanceof Element ? event.target.closest('[data-visual-surface]') : null;
    const next = surfaces.get(target);
    if (!next || !visibleSurfaces.has(target) || target.closest('dialog')) {
      resetActive();
      return;
    }
    if (active && active !== next) restore(active);
    active = next;
    active.image?.classList.add('visual-image-entered');
    active.element.classList.add('is-pointer-active');
    pointer = { x: event.clientX, y: event.clientY };
    schedule();
  };

  document.addEventListener('pointermove', setPointer, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetActive);
  // Capture also covers horizontal galleries; no preventDefault or touch listeners.
  document.addEventListener('scroll', resetActive, { passive: true, capture: true });
  window.addEventListener('blur', cancelInput);
  window.addEventListener('resize', resetActive, { passive: true });
  document.addEventListener('focusin', resetActive);
  document.addEventListener('pointerdown', resetActive, { passive: true });

  // A whole section sleeps when off screen. Images keep their entrance state;
  // the archive can be opened repeatedly without hiding content or replaying it.
  if ('IntersectionObserver' in window) {
    const sectionsObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (surfaces.has(target)) return; // The surface observer owns these sections.
        target.classList.toggle('visual-in-view', isIntersecting);
      });
    }, { threshold: 0, rootMargin: '0px' });
    animatedSections.forEach((section) => sectionsObserver.observe(section));

    const surfaceObserver = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          visibleSurfaces.add(target);
          target.classList.add('visual-has-entered');
        } else {
          visibleSurfaces.delete(target);
          if (active?.element === target) resetActive();
        }
        target.classList.toggle('visual-in-view', isIntersecting);
      });
    }, { threshold: 0.12 });
    surfaces.forEach(({ element }) => surfaceObserver.observe(element));
  } else {
    animatedSections.forEach((section) => section.classList.add('visual-in-view'));
    surfaces.forEach(({ element }) => {
      visibleSurfaces.add(element);
      element.classList.add('visual-in-view', 'visual-has-entered');
    });
  }

  const syncPreferences = () => {
    cancelInput();
    root.classList.toggle('visual-motion-static', !motionAllowed());
    root.classList.toggle('visual-pointer-enabled', pointerAllowed());
    motionToggles.forEach((button) => {
      button.setAttribute('aria-pressed', String(!motionAllowed()));
      button.textContent = !motionAllowed() ? 'Animações pausadas' : 'Pausar animações';
      button.disabled = reducedMotion.matches || slowUpdates.matches || Boolean(connection?.saveData);
    });
    document.dispatchEvent(new CustomEvent('portfolio:motion', { detail: { paused: !motionAllowed() } }));
  };

  motionToggles.forEach((button) => button.addEventListener('click', () => {
    userPaused = !userPaused;
    syncPreferences();
  }));

  reducedMotion.addEventListener('change', syncPreferences);
  finePointer.addEventListener('change', syncPreferences);
  slowUpdates.addEventListener('change', syncPreferences);
  connection?.addEventListener?.('change', syncPreferences);
  document.addEventListener('visibilitychange', () => {
    suspended = document.hidden;
    root.classList.toggle('visual-page-hidden', suspended);
    syncPreferences();
  });
  window.addEventListener('pagehide', () => {
    suspended = true;
    root.classList.add('visual-page-hidden');
    syncPreferences();
  });
  window.addEventListener('pageshow', () => {
    suspended = document.hidden;
    root.classList.toggle('visual-page-hidden', suspended);
    syncPreferences();
  });

  root.classList.toggle('visual-page-hidden', suspended);
  syncPreferences();
  root.classList.add('visual-polish-ready');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVisualPolish, { once: true });
} else {
  initVisualPolish();
}
