/* =========================================================
   AWWWARDS EVOLUTION — MRLEOROBOT
   Creative Developer + Senior Front-End + Motion Design
   ========================================================= */

(function() {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ─── 1. LENIS SMOOTH SCROLL ─── */
  let lenis;
  if (!prefersReduced && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', () => {
      if (window.ScrollTrigger) ScrollTrigger.update();
    });
  }

  /* ─── 2. CUSTOM CURSOR ─── */
  if (!isTouch && !prefersReduced) {
    const root = document.createElement('div');
    root.className = 'cursor-root';
    root.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
    document.body.appendChild(root);

    const dot = root.querySelector('.cursor-dot');
    const ring = root.querySelector('.cursor-ring');

    let mx = 0, my = 0, rx = 0, ry = 0;
    let isActive = false, inactivityTimer;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!isActive) {
        isActive = true;
        animateCursor();
      }
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => { isActive = false; }, 100);
    });

    document.addEventListener('mousedown', () => root.classList.add('is-press'));
    document.addEventListener('mouseup', () => root.classList.remove('is-press'));

    function animateCursor() {
      if (!isActive) return;
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animateCursor);
    }

    const hoverTargets = 'a, button, [role="button"], .project-card, .magnetic-btn, input, textarea, select, .hamburger, .theme-toggle-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) root.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) root.classList.remove('is-hover');
    });
  }

  /* ─── 3. MAGNETIC BUTTONS ─── */
  if (!isTouch && !prefersReduced) {
    // Só aplica em botões FORA do header/nav para não quebrar a barra fixa
    const magneticSelectors = '.btn-primary:not(header .btn-primary):not(nav .btn-primary), .projects-cta-all, .project-card__title, .btn-flutuante';
    document.querySelectorAll(magneticSelectors).forEach(btn => {
      // Ignora elementos dentro de header ou nav
      if (btn.closest('header') || btn.closest('nav')) return;
      btn.classList.add('magnetic-btn');
      const text = btn.querySelector('span') || btn.firstChild;
      if (text && text.nodeType === 1) text.classList.add('btn-text');

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        const txt = btn.querySelector('.btn-text');
        if (txt) txt.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        const txt = btn.querySelector('.btn-text');
        if (txt) txt.style.transform = '';
      });
    });
  }

  /* ─── 4. PROJECT CARDS — 3D TILT + SPOTLIGHT ─── */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.project-card').forEach(card => {
      const media = card.querySelector('.project-card__media');
      if (!media) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const cx = (x - 0.5) * 2;
        const cy = (y - 0.5) * 2;

        media.style.transform = `perspective(1000px) rotateX(${cy * -6}deg) rotateY(${cx * 6}deg) scale3d(1.02,1.02,1.02)`;
        media.style.setProperty('--mx', `${x * 100}%`);
        media.style.setProperty('--my', `${y * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        media.style.transform = '';
      });
    });
  }

  /* ─── 5. SECTION REVEAL ON SCROLL ─── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });

  document.querySelectorAll('.section-reveal, #sobre, #tech-stack, #projetos, #projetos-design, #game-dev, #faq, #cta-final, #soft-skills, #suporte-gestao').forEach(el => {
    if (!el.classList.contains('section-reveal')) el.classList.add('section-reveal');
    revealObserver.observe(el);
  });

  /* ─── 6. NAV LINKS — EDITORIAL UNDERLINE ─── */
  // Só aplica em links do footer; nav-links do header já têm estilo próprio
  document.querySelectorAll('.footer-links a').forEach(link => {
    link.classList.add('editorial-link');
  });

  /* ─── 7. PARALLAX HERO LAYER ─── */
  if (!isTouch && !prefersReduced) {
    const heroLayer = document.getElementById('hero-parallax-layer');
    if (heroLayer) {
      let hx = 0, hy = 0, tx = 0, ty = 0;
      document.addEventListener('mousemove', (e) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 15;
        ty = (e.clientY / window.innerHeight - 0.5) * 15;
      });
      function parallaxLoop() {
        hx += (tx - hx) * 0.06;
        hy += (ty - hy) * 0.06;
        heroLayer.style.transform = `translate3d(${hx}px, ${hy}px, 0)`;
        requestAnimationFrame(parallaxLoop);
      }
      parallaxLoop();
    }
  }

  /* ─── 8. WORD STAGGER REVEAL (Hero Subtitle) ─── */
  const subtitle = document.querySelector('.hero-editorial__subtitle');
  if (subtitle && !prefersReduced) {
    const words = subtitle.querySelectorAll('.ink-reveal--word');
    words.forEach((w, i) => {
      w.style.animationDelay = `${1.2 + i * 0.12}s`;
    });
  }

  /* ─── 9. SCROLL VELOCITY TILT ─── */
  if (!prefersReduced && lenis) {
    lenis.on('scroll', ({ velocity: v }) => {
      document.querySelectorAll('.project-card__media img').forEach(img => {
        const tilt = Math.max(-2, Math.min(2, v * 0.015));
        const currentTransform = img.style.transform || '';
        if (!currentTransform.includes('scale')) {
          img.style.transform = `skewY(${tilt}deg)`;
        } else {
          img.style.transform = currentTransform.replace(/skewY\([^)]+\)/, '').trim() + ` skewY(${tilt}deg)`;
        }
      });
    });
  }

  /* ─── 10. TIMELINE STAGGER REVEAL ─── */
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, idx * 120);
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.timeline-item').forEach(item => {
    timelineObserver.observe(item);
  });

  /* ─── 11. SKILL TAGS STAGGER ─── */
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const tags = entry.target.querySelectorAll('.skill-tag');
        tags.forEach((tag, i) => {
          setTimeout(() => tag.classList.add('is-visible'), i * 60);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.skills-grid, .skills-category').forEach(grid => {
    skillObserver.observe(grid);
  });

  /* ─── 12. TESTIMONIAL CARDS STAGGER ─── */
  const testimonialObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 150);
        testimonialObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.testimonial-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)';
    testimonialObserver.observe(card);
  });

  /* ─── 13. HERO CTA SHINE EFFECT ─── */
  const heroCta = document.querySelector('.hero-editorial__cta .btn-primary');
  if (heroCta && !prefersReduced) {
    heroCta.addEventListener('mouseenter', () => {
      heroCta.style.setProperty('--shine', '1');
    });
    heroCta.addEventListener('mouseleave', () => {
      heroCta.style.setProperty('--shine', '0');
    });
  }



  /* =========================================================
     AWWWARDS — SEÇÃO PROJETOS (Upgrade Individual)
     Apenas classes existentes. Zero alteração no HTML.
     ========================================================= */

  /* ─── 1. REVEAL DOS CARDS COM CLIP-PATH ─── */
  const projectCards = document.querySelectorAll('.project-card');
  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const media = card.querySelector('.project-card__media');
        if (media) {
          let delay = 0;
          if (card.classList.contains('stagger-2')) delay = 150;
          else if (card.classList.contains('stagger-3')) delay = 300;

          setTimeout(() => {
            media.classList.add('is-revealed');
            card.classList.add('is-revealed');

            const title = card.querySelector('.project-card__title');
            if (title && !title.dataset.scrambled) {
              title.dataset.scrambled = 'true';
              scrambleText(title, 800);
            }
          }, delay);
        }
        projectObserver.unobserve(card);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  projectCards.forEach(card => projectObserver.observe(card));

  /* ─── 2. TEXT SCRAMBLE NOS TÍTULOS ─── */
  function scrambleText(element, duration) {
    if (prefersReduced) return;
    const originalText = element.textContent.trim();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const length = originalText.length;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      let result = '';

      for (let i = 0; i < length; i++) {
        if (originalText[i] === ' ') {
          result += ' ';
        } else if (progress > i / length) {
          result += originalText[i];
        } else {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      element.textContent = result;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = originalText;
      }
    }
    requestAnimationFrame(step);
  }

  /* ─── 3. PARALLAX DE IMAGEM NO SCROLL ─── */
  if (!prefersReduced) {
    const parallaxImages = document.querySelectorAll('.project-thumbnail-image');
    let ticking = false;

    function updateParallax() {
      parallaxImages.forEach(img => {
        const rect = img.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const centerOffset = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
        const moveY = centerOffset * -20;
        img.style.transform = `translateY(${moveY}px) scale(1.05)`;
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─── 4. HEADER DOS PROJETOS — REVEAL COM STAGGER ─── */
  const projectsHeaderTitle = document.querySelector('.projects-header__title');
  if (projectsHeaderTitle) {
    if (!projectsHeaderTitle.querySelector('span')) {
      const text = projectsHeaderTitle.textContent.trim();
      projectsHeaderTitle.innerHTML = '';
      text.split('').forEach((char) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        projectsHeaderTitle.appendChild(span);
      });
    }

    const headerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          headerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    headerObserver.observe(projectsHeaderTitle);
  }

  /* ─── 5. SUBTÍTULO DO HEADER — FADE IN ─── */
  const projectsHeaderSubtitle = document.querySelector('.projects-header__subtitle');
  if (projectsHeaderSubtitle) {
    const subObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          subObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    subObserver.observe(projectsHeaderSubtitle);
  }

})();
