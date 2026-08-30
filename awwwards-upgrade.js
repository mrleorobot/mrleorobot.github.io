/* =========================================================
   AWWWARDS EVOLUTION — MRLEOROBOT (Ultra-Optimized)
   Zero lag. GPU-only. Loader always visible.
   ========================================================= */

(function() {
  'use strict';

  /* ─── 0. LOADER SEMPRE VISÍVEL — limpa sessionStorage ─── */
  sessionStorage.removeItem('loaderShown');
  sessionStorage.removeItem('loaderComplete');

  // Parar canvas do loader antigo se existir
  const oldCanvas = document.getElementById('loader-stars-canvas');
  if (oldCanvas) {
    oldCanvas.style.display = 'none';
    const ctx = oldCanvas.getContext('2d');
    if (ctx) {
      // Limpar canvas para parar renderização
      ctx.clearRect(0, 0, oldCanvas.width, oldCanvas.height);
    }
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ─── 1. NATIVE SCROLL ───
     A rolagem do navegador evita um RAF permanente e responde melhor
     em notebooks, celulares e dispositivos com GPU integrada. */

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

  /* ─── 3. PROJECT CARDS — opacity + scale (GPU) ─── */
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
          }, delay);
        }
        projectObserver.unobserve(card);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  projectCards.forEach(card => projectObserver.observe(card));

  /* ─── 4. PROJECTS HEADER REVEAL ─── */
  const projectsHeaderTitle = document.querySelector('.projects-header__title');
  if (projectsHeaderTitle && !projectsHeaderTitle.querySelector('span')) {
    const text = projectsHeaderTitle.textContent.trim();
    projectsHeaderTitle.innerHTML = '';
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      projectsHeaderTitle.appendChild(span);
    });

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

  /* ─── 5. TIMELINE REVEAL ─── */
  const timelineItems = document.querySelectorAll('.timeline-item');
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        timelineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  timelineItems.forEach(item => timelineObserver.observe(item));

  /* ─── 6. SKILL TAGS STAGGER ─── */
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

  /* ─── 7. MOBILE DOCK + BOTÕES FLUTUANTES — throttled scroll ─── */
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile && !prefersReduced) {
    const dock = document.querySelector('.mobile-bottom-dock');
    const floatingBtnIds = ['soundToggleBtn', 'langToggleBtn', 'btn-share', 'btn-topo'];
    const floatingBtns = floatingBtnIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    let lastScrollY = 0;
    let dockTicking = false;

    function updateDock() {
      const hide = window.scrollY > lastScrollY && window.scrollY > 200;
      if (dock) {
        dock.classList.toggle('is-hidden', hide);
      }
      // Os botões flutuantes (som/idioma/compartilhar/topo) ficam bem
      // acima do dock, numa faixa que às vezes cruza com texto real da
      // página (títulos, anos da timeline). Escondendo junto com o dock
      // ao rolar pra baixo, eles só aparecem quando o usuário para ou
      // volta a rolar pra cima — reduz bastante a chance de tampar algo.
      floatingBtns.forEach((btn) => btn.classList.toggle('floating-hidden', hide));
      lastScrollY = window.scrollY;
      dockTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!dockTicking) {
        requestAnimationFrame(updateDock);
        dockTicking = true;
      }
    }, { passive: true });
  }


  /* ─── 8. CASE STUDY OVERLAY (lightweight) ─── */
  (function initCaseStudyOverlay() {
    // On touch devices, keep project interaction native. A click generated
    // after a swipe must never open an overlay that locks body scrolling.
    if (isTouch) return;

    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    let currentOverlay = null;
    let isAnimating = false;

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.project-lightbox-trigger') || e.target.closest('.project-thumbnail-wrapper')) {
          return;
        }
        e.preventDefault();
        if (isAnimating) return;
        isAnimating = true;

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
      const overlay = document.createElement('div');
      overlay.className = 'project-case-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');

      const tagsHtml = data.tags.map(tag =>
        '<span class="project-case-overlay__tech-tag">' + escapeHtml(tag) + '</span>'
      ).join('');

      overlay.innerHTML =
        '<div class="project-case-overlay__bg"></div>' +
        '<div class="project-case-overlay__image">' +
          '<img src="' + escapeHtml(data.imageSrc) + '" alt="' + escapeHtml(data.imageAlt) + '" loading="eager">' +
        '</div>' +
        '<div class="project-case-overlay__content">' +
          '<h2 class="project-case-overlay__title">' + escapeHtml(data.title) + '</h2>' +
          '<p class="project-case-overlay__desc">' + escapeHtml(data.desc) + '</p>' +
          '<div class="project-case-overlay__tech">' + tagsHtml + '</div>' +
          (data.link ? '<a href="' + escapeHtml(data.link) + '" target="_blank" rel="noopener" class="project-case-overlay__cta">' +
            '<span>Ver Projeto</span>' +
            '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12L12 4M12 4H6M12 4V10"/></svg>' +
          '</a>' : '') +
        '</div>' +
        '<button class="project-case-overlay__close" aria-label="Fechar">' +
          '<svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
        '</button>';

      document.body.appendChild(overlay);
      currentOverlay = overlay;
      if (window.PortfolioScrollLock) {
        window.PortfolioScrollLock.lock('case-study');
      } else {
        document.body.style.overflow = 'hidden';
      }

      requestAnimationFrame(() => {
        overlay.classList.add('is-active');
        isAnimating = false;
      });

      overlay.querySelector('.project-case-overlay__close').addEventListener('click', closeOverlay);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('project-case-overlay__bg')) {
          closeOverlay();
        }
      });
      document.addEventListener('keydown', onKeyDown);
    }

    function closeOverlay() {
      if (!currentOverlay || isAnimating) return;
      isAnimating = true;
      currentOverlay.classList.remove('is-active');
      setTimeout(() => {
        if (currentOverlay && currentOverlay.parentNode) {
          currentOverlay.parentNode.removeChild(currentOverlay);
        }
        currentOverlay = null;
        if (window.PortfolioScrollLock) {
          window.PortfolioScrollLock.unlock('case-study');
        } else {
          document.body.style.overflow = '';
        }
        document.removeEventListener('keydown', onKeyDown);
        isAnimating = false;
      }, 700);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') closeOverlay();
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  })();

})();
