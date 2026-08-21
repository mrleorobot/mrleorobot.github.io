/* =========================================================
   AWWWARDS EVOLUTION — MRLEOROBOT (Optimized)
   Performance-first. Zero lag. Maximum impact.
   ========================================================= */

(function() {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ─── 1. LENIS SMOOTH SCROLL (único RAF) ─── */
  let lenis;
  if (!prefersReduced && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.8,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ─── 2. SECTION REVEAL — único IntersectionObserver ─── */
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

  /* ─── 3. PROJECT CARDS — clip-path reveal + scramble ─── */
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
              scrambleText(title, 600);
            }
          }, delay);
        }
        projectObserver.unobserve(card);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  projectCards.forEach(card => projectObserver.observe(card));

  /* ─── 4. TEXT SCRAMBLE ─── */
  function scrambleText(element, duration) {
    if (prefersReduced) return;
    const originalText = element.textContent.trim();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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

  /* ─── 5. PROJECTS HEADER REVEAL ─── */
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

  /* ─── 6. TIMELINE REVEAL ─── */
  const timelineItems = document.querySelectorAll('.timeline-item');
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, idx * 100);
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  timelineItems.forEach(item => timelineObserver.observe(item));

  /* ─── 7. SKILL TAGS STAGGER ─── */
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

  /* ─── 8. PARALLAX HERO (desktop only, throttled) ─── */
  if (!isTouch && !prefersReduced) {
    const heroLayer = document.getElementById('hero-parallax-layer');
    if (heroLayer) {
      let hx = 0, hy = 0, tx = 0, ty = 0;
      let ticking = false;

      document.addEventListener('mousemove', (e) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 12;
        ty = (e.clientY / window.innerHeight - 0.5) * 12;
        if (!ticking) {
          requestAnimationFrame(() => {
            hx += (tx - hx) * 0.06;
            hy += (ty - hy) * 0.06;
            heroLayer.style.transform = `translate3d(${hx}px, ${hy}px, 0)`;
            ticking = false;
          });
          ticking = true;
        }
      });
    }
  }

  /* ─── 9. MOBILE — dock active + hide/show ─── */
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile && !prefersReduced) {
    const dockItems = document.querySelectorAll('.mobile-bottom-dock .dock-item');
    const sections = ['hero', 'projetos', 'projetos-design', 'cta-final'];
    const dock = document.querySelector('.mobile-bottom-dock');
    let lastScrollY = 0;
    let dockTicking = false;

    function updateDock() {
      const scrollY = window.scrollY + window.innerHeight / 2;
      let activeIdx = 0;

      sections.forEach((id, idx) => {
        const section = document.getElementById(id);
        if (section) {
          const top = section.offsetTop;
          const bottom = top + section.offsetHeight;
          if (scrollY >= top && scrollY < bottom) {
            activeIdx = idx;
          }
        }
      });

      dockItems.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeIdx);
      });

      if (dock) {
        if (window.scrollY > lastScrollY && window.scrollY > 200) {
          dock.classList.add('is-hidden');
        } else {
          dock.classList.remove('is-hidden');
        }
      }
      lastScrollY = window.scrollY;
      dockTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!dockTicking) {
        requestAnimationFrame(updateDock);
        dockTicking = true;
      }
    }, { passive: true });
    updateDock();

    dockItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const href = item.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

})();
