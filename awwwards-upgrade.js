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



  /* =========================================================
     AWWWARDS — PROJECT CASE STUDY OVERLAY (Cinematográfico)
     Zero alteração no HTML. Classes dinâmicas via JS.
     ========================================================= */

  (function initCaseStudyOverlay() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    let currentOverlay = null;
    let isAnimating = false;

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Se clicou no lightbox trigger ou na imagem, deixa o lightbox original funcionar
        if (e.target.closest('.project-lightbox-trigger') || e.target.closest('.project-thumbnail-wrapper')) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (isAnimating) return;
        isAnimating = true;

        // Extrair dados do card
        const img = card.querySelector('.project-thumbnail-image');
        const title = card.querySelector('.project-card__title');
        const desc = card.querySelector('.project-card__desc');
        const techTags = card.querySelectorAll('.project-card__tech-tag');
        const link = card.querySelector('a[href^="http"]');

        const data = {
          imageSrc: img ? img.src : '',
          imageAlt: img ? img.alt : '',
          title: title ? title.textContent.trim() : '',
          desc: desc ? desc.textContent.trim() : '',
          tags: Array.from(techTags).map(t => t.textContent.trim()),
          link: link ? link.href : ''
        };

        openOverlay(data);
      });
    });

    function openOverlay(data) {
      // Criar overlay
      const overlay = document.createElement('div');
      overlay.className = 'project-case-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');

      // Montar HTML do overlay
      const tagsHtml = data.tags.map(tag =>
        `<span class="project-case-overlay__tech-tag">${escapeHtml(tag)}</span>`
      ).join('');

      overlay.innerHTML = `
        <div class="project-case-overlay__bg"></div>
        <div class="project-case-overlay__image">
          <img src="${escapeHtml(data.imageSrc)}" alt="${escapeHtml(data.imageAlt)}" loading="eager">
        </div>
        <div class="project-case-overlay__content">
          <h2 class="project-case-overlay__title">${escapeHtml(data.title)}</h2>
          <p class="project-case-overlay__desc">${escapeHtml(data.desc)}</p>
          <div class="project-case-overlay__tech">${tagsHtml}</div>
          ${data.link ? `<a href="${escapeHtml(data.link)}" target="_blank" rel="noopener" class="project-case-overlay__cta">
            <span>Ver Projeto</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12L12 4M12 4H6M12 4V10"/></svg>
          </a>` : ''}
        </div>
        <button class="project-case-overlay__close" aria-label="Fechar">
          <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div class="project-case-overlay__scroll-hint">Role para explorar</div>
      `;

      document.body.appendChild(overlay);
      currentOverlay = overlay;

      // Bloquear scroll do body
      document.body.style.overflow = 'hidden';

      // Forçar reflow para animação
      overlay.offsetHeight;

      // Ativar animação
      requestAnimationFrame(() => {
        overlay.classList.add('is-active');
        isAnimating = false;
      });

      // Event listeners de fechamento
      const closeBtn = overlay.querySelector('.project-case-overlay__close');
      closeBtn.addEventListener('click', closeOverlay);

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('project-case-overlay__bg')) {
          closeOverlay();
        }
      });

      // ESC para fechar
      document.addEventListener('keydown', onKeyDown);
    }

    function closeOverlay() {
      if (!currentOverlay || isAnimating) return;
      isAnimating = true;

      currentOverlay.classList.remove('is-active');

      // Esperar animação de saída
      setTimeout(() => {
        if (currentOverlay && currentOverlay.parentNode) {
          currentOverlay.parentNode.removeChild(currentOverlay);
        }
        currentOverlay = null;
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKeyDown);
        isAnimating = false;
      }, 700);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        closeOverlay();
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

  

  /* =========================================================
     AWWWARDS — SCROLL PROGRESS ORGÂNICO (SVG Draw)
     Zero alteração no HTML.
     ========================================================= */

  (function initOrganicScrollProgress() {
    const container = document.querySelector('.scroll-progress-container');
    if (!container) return;

    // Criar SVG
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('scroll-progress-svg');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('viewBox', '0 0 1200 6');
    svg.setAttribute('aria-hidden', 'true');

    // Definir gradiente
    const defs = document.createElementNS(svgNS, 'defs');
    const gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', 'scrollGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');

    const stop1 = document.createElementNS(svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'rgba(255,255,255,0.2)');

    const stop2 = document.createElementNS(svgNS, 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', 'rgba(255,255,255,0.8)');

    const stop3 = document.createElementNS(svgNS, 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', 'rgba(255,255,255,0.2)');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Path orgânico com ondas suaves
    const path = document.createElementNS(svgNS, 'path');
    // Linha com curvas de Bezier suaves — ondulação sutil
    const d = 'M0,3 C100,1 200,5 300,3 C400,1 500,5 600,3 C700,1 800,5 900,3 C1000,1 1100,5 1200,3';
    path.setAttribute('d', d);
    svg.appendChild(path);

    // Glow trail (mesmo path, mas com stroke-dasharray dinâmico)
    const glowPath = document.createElementNS(svgNS, 'path');
    glowPath.setAttribute('d', d);
    glowPath.classList.add('scroll-progress-glow');
    svg.appendChild(glowPath);

    // Ponto de luz na ponta
    const tip = document.createElementNS(svgNS, 'circle');
    tip.setAttribute('r', '3');
    tip.classList.add('scroll-progress-tip');
    svg.appendChild(tip);

    container.appendChild(svg);

    // Calcular comprimento do path
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
    glowPath.style.strokeDasharray = pathLength;
    glowPath.style.strokeDashoffset = pathLength;

    // Atualizar no scroll
    let ticking = false;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      const clamped = Math.max(0, Math.min(1, progress));

      const offset = pathLength * (1 - clamped);
      path.style.strokeDashoffset = offset;
      glowPath.style.strokeDashoffset = offset;

      // Posicionar o ponto de luz na ponta do progresso
      const point = path.getPointAtLength(pathLength * clamped);
      tip.setAttribute('cx', point.x);
      tip.setAttribute('cy', point.y);

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });

    // Inicializar
    updateProgress();

  })();

})();



  /* =========================================================
     AWWWARDS — SCROLL PROGRESS ORGÂNICO (SVG Draw)
     Zero alteração no HTML.
     ========================================================= */

  (function initOrganicScrollProgress() {
    const container = document.querySelector('.scroll-progress-container');
    if (!container) return;

    // Criar SVG
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('scroll-progress-svg');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('viewBox', '0 0 1200 6');
    svg.setAttribute('aria-hidden', 'true');

    // Definir gradiente
    const defs = document.createElementNS(svgNS, 'defs');
    const gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', 'scrollGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');

    const stop1 = document.createElementNS(svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'rgba(255,255,255,0.2)');

    const stop2 = document.createElementNS(svgNS, 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', 'rgba(255,255,255,0.8)');

    const stop3 = document.createElementNS(svgNS, 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', 'rgba(255,255,255,0.2)');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Path orgânico com ondas suaves
    const path = document.createElementNS(svgNS, 'path');
    // Linha com curvas de Bezier suaves — ondulação sutil
    const d = 'M0,3 C100,1 200,5 300,3 C400,1 500,5 600,3 C700,1 800,5 900,3 C1000,1 1100,5 1200,3';
    path.setAttribute('d', d);
    svg.appendChild(path);

    // Glow trail (mesmo path, mas com stroke-dasharray dinâmico)
    const glowPath = document.createElementNS(svgNS, 'path');
    glowPath.setAttribute('d', d);
    glowPath.classList.add('scroll-progress-glow');
    svg.appendChild(glowPath);

    // Ponto de luz na ponta
    const tip = document.createElementNS(svgNS, 'circle');
    tip.setAttribute('r', '3');
    tip.classList.add('scroll-progress-tip');
    svg.appendChild(tip);

    container.appendChild(svg);

    // Calcular comprimento do path
    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;
    glowPath.style.strokeDasharray = pathLength;
    glowPath.style.strokeDashoffset = pathLength;

    // Atualizar no scroll
    let ticking = false;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      const clamped = Math.max(0, Math.min(1, progress));

      const offset = pathLength * (1 - clamped);
      path.style.strokeDashoffset = offset;
      glowPath.style.strokeDashoffset = offset;

      // Posicionar o ponto de luz na ponta do progresso
      const point = path.getPointAtLength(pathLength * clamped);
      tip.setAttribute('cx', point.x);
      tip.setAttribute('cy', point.y);

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });

    // Inicializar
    updateProgress();

  })();

})();
