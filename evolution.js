/* ═══════════════════════════════════════════
   EVOLUTION.JS — Motion Upgrade v2.1
   Aurora monocromática, magnetic buttons,
   timeline line draw, section entrance animations,
   section markers grandes, word-by-word reveal.
   ═══════════════════════════════════════════ */

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  const chromiumLite = document.documentElement.classList.contains('is-chromium');

  // ═══════════════════════════════════════════
  // 1. AURORA MESH GRADIENT CANVAS — Monocromático
  // ═══════════════════════════════════════════
  function initAuroraCanvas() {
    if (prefersReducedMotion) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'aurora-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let time = 0;
    let animId;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Monocromático: apenas tons de branco/cinza
    const blobs = [
      { x: 0.3, y: 0.4, r: 400, c: 'rgba(255,255,255,0.04)', s: 0.25 },
      { x: 0.7, y: 0.3, r: 350, c: 'rgba(200,200,200,0.03)', s: 0.35 },
      { x: 0.5, y: 0.7, r: 450, c: 'rgba(255,255,255,0.025)', s: 0.3 },
      { x: 0.2, y: 0.6, r: 300, c: 'rgba(180,180,180,0.02)', s: 0.2 },
    ];

    function draw() {
      const lw = window.innerWidth;
      const lh = window.innerHeight;
      ctx.clearRect(0, 0, lw, lh);

      blobs.forEach(b => {
        const nx = b.x * lw + Math.sin(time * b.s) * 100;
        const ny = b.y * lh + Math.cos(time * b.s * 0.7) * 80;
        const nr = b.r + Math.sin(time * 0.5) * 50;

        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        grad.addColorStop(0, b.c);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, lw, lh);
      });

      time += 0.006;
      animId = requestAnimationFrame(draw);
    }

    const checkLoader = setInterval(() => {
      if (document.body.classList.contains('loader-complete') || !document.getElementById('cinematic-loader')) {
        clearInterval(checkLoader);
        draw();
      }
    }, 500);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else draw();
    });
  }

  // ═══════════════════════════════════════════
  // 2. CURSOR GLOW
  // ═══════════════════════════════════════════
  function initCursorGlow() {
    if (isTouchDevice || prefersReducedMotion) return;

    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    document.body.appendChild(glow);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let rafId;
    let isMoving = false;
    let moveTimeout;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => { isMoving = false; }, 100);
      if (!rafId) rafId = requestAnimationFrame(animate);
    }, { passive: true });

    function animate() {
      currentX += (mouseX - currentX) * 0.1;
      currentY += (mouseY - currentY) * 0.1;
      glow.style.left = currentX + 'px';
      glow.style.top = currentY + 'px';
      if (isMoving || Math.abs(mouseX - currentX) > 0.5) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    }
  }

  // ═══════════════════════════════════════════
  // 3. MAGNETIC BUTTONS
  // ═══════════════════════════════════════════
  function initMagneticButtons() {
    if (isTouchDevice || prefersReducedMotion) return;

    const buttons = document.querySelectorAll('.hero-editorial__cta, .btn-cv, .contact-link, .dock-item');

    buttons.forEach(btn => {
      btn.classList.add('magnetic-btn');

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ═══════════════════════════════════════════
  // 4. 3D TILT CARDS
  // ═══════════════════════════════════════════
  function init3DTilt() {
    if (isTouchDevice || prefersReducedMotion) return;

    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
      card.classList.add('tilt-card');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / centerY * -6;
        const rotateY = (x - centerX) / centerX * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  // ═══════════════════════════════════════════
  // 5. SPOTLIGHT HOVER
  // ═══════════════════════════════════════════
  function initSpotlightHover() {
    if (isTouchDevice) return;

    const cards = document.querySelectorAll('.project-card, .faq-item');

    cards.forEach(card => {
      card.classList.add('spotlight-card');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', x + '%');
        card.style.setProperty('--mouse-y', y + '%');
      });
    });
  }

  // ═══════════════════════════════════════════
  // 6. SECTION ENTRANCE ANIMATIONS
  // ═══════════════════════════════════════════
  function initSectionEntrance() {
    const sections = document.querySelectorAll('section:not(#hero)');

    sections.forEach(section => {
      section.classList.add('section-entrance');
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // ═══════════════════════════════════════════
  // 7. SECTION DIVIDER LINE ANIMATION
  // ═══════════════════════════════════════════
  function initSectionDividers() {
    const dividers = document.querySelectorAll('.section-divider');

    dividers.forEach(div => {
      div.classList.add('section-divider-animated');
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    dividers.forEach(d => observer.observe(d));
  }

  // ═══════════════════════════════════════════
  // 8. SECTION TITLE ENTRANCE (3D rotate)
  // ═══════════════════════════════════════════
  function initSectionTitleEntrance() {
    const titles = document.querySelectorAll('.section-title-kinetic, .skills-header h2, .design-header h2, .faq-container h2, .contact-panel h2');

    titles.forEach(title => {
      title.classList.add('section-title-entrance');
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    titles.forEach(t => observer.observe(t));
  }

  // ═══════════════════════════════════════════
  // 10. TIMELINE LINE DRAW
  // ═══════════════════════════════════════════
  function initTimelineLineDraw() {
    const items = document.querySelectorAll('.timeline-item');
    items.forEach(item => item.classList.add('timeline-item'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    items.forEach(item => observer.observe(item));
  }

  // ═══════════════════════════════════════════
  // 11. STAGGER REVEAL
  // ═══════════════════════════════════════════
  function initStaggerReveal() {
    const elements = document.querySelectorAll('.timeline-item, .tech-label, .faq-item, .project-card');

    elements.forEach((el, i) => {
      el.classList.add('reveal-stagger');
      el.style.transitionDelay = `${i * 0.05}s`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  // ═══════════════════════════════════════════
  // 12. AMBIENT PARTICLES
  // ═══════════════════════════════════════════
  function initAmbientParticles() {
    if (prefersReducedMotion || isTouchDevice) return;

    const container = document.createElement('div');
    container.id = 'ambient-particles';
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;';
    document.body.insertBefore(container, document.body.children[1] || null);

    const PARTICLE_COUNT = 20;
    const particles = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 2 + 1;
      p.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255,255,255,${Math.random() * 0.2 + 0.05});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        will-change: transform;
      `;
      container.appendChild(p);

      particles.push({
        el: p,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    let animId;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function animate() {
      particles.forEach(p => {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = window.innerWidth + 10;
        if (p.x > window.innerWidth + 10) p.x = -10;
        if (p.y < -10) p.y = window.innerHeight + 10;
        if (p.y > window.innerHeight + 10) p.y = -10;

        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      });

      animId = requestAnimationFrame(animate);
    }

    const checkLoader = setInterval(() => {
      if (document.body.classList.contains('loader-complete') || !document.getElementById('cinematic-loader')) {
        clearInterval(checkLoader);
        animate();
      }
    }, 500);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else animate();
    });
  }

  // ═══════════════════════════════════════════
  // 13. VIGNETTE OVERLAY
  // ═══════════════════════════════════════════
  function initVignette() {
    const vignette = document.createElement('div');
    vignette.id = 'vignette-overlay';
    document.body.appendChild(vignette);

    let opacity = 0.6;
    let targetOpacity = 0.6;

    window.addEventListener('scroll', () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      targetOpacity = 0.4 + scrollPercent * 0.4;
    }, { passive: true });

    function update() {
      opacity += (targetOpacity - opacity) * 0.05;
      vignette.style.opacity = opacity;
      requestAnimationFrame(update);
    }
    update();
  }

  // ═══════════════════════════════════════════
  // 16. LIQUID BUTTONS
  // ═══════════════════════════════════════════
  function initLiquidButtons() {
    const buttons = document.querySelectorAll('.hero-editorial__cta, .btn-cv');
    buttons.forEach(btn => btn.classList.add('liquid-btn'));
  }

  // ═══════════════════════════════════════════
  // 17. SHIMMER ON PROJECT CARDS
  // ═══════════════════════════════════════════
  function initShimmer() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => card.classList.add('shimmer'));
  }

  // ═══════════════════════════════════════════
  // 18. DEPTH CARDS
  // ═══════════════════════════════════════════
  function initDepthCards() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => card.classList.add('depth-card'));
  }

  // ═══════════════════════════════════════════
  // 19. GLOW BORDERS
  // ═══════════════════════════════════════════
  function initGlowBorders() {
    const sections = document.querySelectorAll('.project-card, .faq-item');
    sections.forEach(s => s.classList.add('glow-border'));
  }

  // ═══════════════════════════════════════════
  // 20. CONTACT LINK ENHANCEMENTS
  // ═══════════════════════════════════════════
  function initContactEnhancements() {
    const links = document.querySelectorAll('.contact-link, .social-link');
    links.forEach(link => link.classList.add('contact-link'));
  }

  // ═══════════════════════════════════════════
  // 21. NAV LINK UNDERLINE
  // ═══════════════════════════════════════════
  function initNavEnhancements() {
    const navLinks = document.querySelectorAll('.nav-links a:not(.btn-cv)');
    navLinks.forEach(link => {
      link.style.position = 'relative';
      link.style.overflow = 'hidden';

      const underline = document.createElement('span');
      underline.style.cssText = `
        position: absolute;
        bottom: 0; left: 50%;
        width: 0; height: 1px;
        background: rgba(255,255,255,0.5);
        transition: width 0.3s ease, left 0.3s ease;
      `;
      link.appendChild(underline);

      link.addEventListener('mouseenter', () => {
        underline.style.width = '100%';
        underline.style.left = '0';
      });
      link.addEventListener('mouseleave', () => {
        underline.style.width = '0';
        underline.style.left = '50%';
      });
    });
  }

  // ═══════════════════════════════════════════
  // 22. SCROLL PROGRESS GLOW
  // ═══════════════════════════════════════════
  function initScrollProgressGlow() {
    const progressBar = document.getElementById('header-scroll-progress');
    if (progressBar) progressBar.classList.add('scroll-progress-bar');
  }

  // ═══════════════════════════════════════════
  // 25. FOOTER ENHANCEMENT
  // ═══════════════════════════════════════════
  function initFooterEnhancement() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    footer.style.borderTop = '1px solid rgba(255,255,255,0.04)';
    footer.style.background = 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)';
  }

  // Pausa animações ambientais quando a seção não está visível. Isso evita
  // que a Hero, a Trajetória e o fechamento disputem GPU ao mesmo tempo.
  function initPerformanceVisibility() {
    if (!("IntersectionObserver" in window)) return;
    const sections = document.querySelectorAll('#hero, #sobre, #cta-final');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-performance-visible', entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: '12% 0px 12% 0px' });
    sections.forEach((section) => observer.observe(section));
  }

  // ═══════════════════════════════════════════
  // INITIALIZE ALL
  // ═══════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', () => {
    let effectsInitialized = false;
    const initEffects = () => {
      if (effectsInitialized) return;
      effectsInitialized = true;

      // Efeitos globais contínuos foram aposentados. As auroras locais em
      // CSS preservam a direção de arte sem manter vários RAFs concorrentes.
      initSectionEntrance();
      initSectionDividers();
      initSectionTitleEntrance();
      initTimelineLineDraw();
      initStaggerReveal();
      if (!chromiumLite) {
        initLiquidButtons();
        initShimmer();
        initDepthCards();
        initGlowBorders();
      }
      initContactEnhancements();
      initNavEnhancements();
      initScrollProgressGlow();
      initFooterEnhancement();
      initPerformanceVisibility();

      console.log('%c EVOLUTION v2.1 ', 'background: #fff; color: #000; font-weight: bold; padding: 4px 8px; border-radius: 4px;', 'loaded — monocromático, magnetic, timeline draw, section entrance');
    };

    if (document.body.classList.contains('loading-locked')) {
      const checkInterval = setInterval(() => {
        if (!document.body.classList.contains('loading-locked') || !document.getElementById('cinematic-loader')) {
          clearInterval(checkInterval);
          setTimeout(initEffects, 300);
        }
      }, 200);
      setTimeout(() => { clearInterval(checkInterval); initEffects(); }, 5000);
    } else {
      initEffects();
    }
  });

})();

// ═══════════════════════════════════════════════════════════
// TRAJECTORY EXPERIENCE 2026
// Timeline editorial com ciclo automático de 10 segundos.
// ═══════════════════════════════════════════════════════════
(() => {
  const AUTOPLAY_DELAY = 10000;

  const moments = [
    {
      year: '2023',
      status: 'Fundação',
      kicker: 'Início Operacional',
      title: 'Atendimento e Organização',
      description: 'Como Atendente e Operador de Caixa na Cantina CDF, desenvolvi agilidade e proatividade no relacionamento direto com o público — bases que uso até hoje no suporte técnico e educacional. Também concluí o Ensino Médio nesse ano.',
      tags: ['Atendimento', 'Organização', 'Ensino Médio'],
      period: '2023',
      datetime: '2023',
      note: 'As primeiras bases profissionais.'
    },
    {
      year: '2024',
      status: 'Aprendizado',
      kicker: 'Jornada Técnica',
      title: 'Formação Multidisciplinar',
      description: 'Capacitação técnica em Informática, Design Gráfico, Gestão em RH, Redes, Linux, Hardware e Inteligência Artificial — seguida pelos primeiros projetos em HTML e CSS.',
      tags: ['Informática', 'Design', 'HTML & CSS'],
      period: '2024 — 2025',
      datetime: '2024',
      note: 'Transformando curiosidade em repertório.'
    },
    {
      year: '2025',
      status: 'Prática',
      kicker: 'Instrutor',
      title: 'Informática e Web Design',
      description: 'Na Motiva Cursos, ministrei aulas de Informática e Web Design, apoiei o uso de ferramentas digitais e acompanhei alunos e responsáveis — aproximando tecnologia, educação e comunicação.',
      tags: ['Educação', 'Web Design', 'Suporte'],
      period: 'ABR — OUT 2025',
      datetime: '2025',
      note: 'Conhecimento que ganha valor quando é compartilhado.'
    },
    {
      year: '2026',
      status: 'Agora',
      kicker: 'Reposicionamento',
      title: 'Novos Desafios',
      description: 'Atuação contínua na ESTEADEB unindo secretaria e suporte técnico, curso de Administração na ETEP em andamento e reconstrução estratégica do portfólio para novas oportunidades em Front-end e Interface Design.',
      tags: ['Front-end', 'Interface Design', 'Administração'],
      period: '2026 — PRESENTE',
      datetime: '2026',
      note: 'Construindo a próxima fase com intenção.'
    }
  ];

  function initTrajectoryExperience() {
    const root = document.querySelector('[data-trajectory-root]');
    if (!root || root.dataset.trajectoryReady === 'true') return;

    const tabs = Array.from(root.querySelectorAll('[data-trajectory-year]'));
    const stage = root.querySelector('[data-trajectory-stage]');
    const panel = root.querySelector('#trajectory-panel');
    const cycleToggle = root.querySelector('[data-trajectory-cycle-toggle]');
    const cycleGlyph = root.querySelector('[data-trajectory-cycle-glyph]');
    const cycleLabel = root.querySelector('[data-trajectory-cycle-label]');
    const fields = {
      progress: root.querySelector('[data-trajectory-progress]'),
      status: root.querySelector('[data-trajectory-status]'),
      year: root.querySelector('[data-trajectory-year-display]'),
      kicker: root.querySelector('[data-trajectory-kicker]'),
      title: root.querySelector('[data-trajectory-title]'),
      description: root.querySelector('[data-trajectory-description]'),
      tags: root.querySelector('[data-trajectory-tags]'),
      period: root.querySelector('[data-trajectory-period]'),
      note: root.querySelector('[data-trajectory-note]')
    };

    const required = [stage, panel, cycleToggle, cycleGlyph, cycleLabel, ...Object.values(fields)];
    if (tabs.length !== moments.length || required.some((element) => !element)) return;

    root.dataset.trajectoryReady = 'true';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobileExperience = window.matchMedia('(max-width: 768px)').matches;
    let activeIndex = Math.max(0, moments.findIndex((moment) => moment.year === root.dataset.activeYear));
    let autoplayTimer = null;
    let transitionTimer = null;
    let entranceTimer = null;
    let isVisible = false;
    let isPaused = reduceMotion || mobileExperience;

    const clearAutoplay = () => {
      if (autoplayTimer) window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    };

    const updateCycleControl = () => {
      cycleToggle.setAttribute('aria-pressed', String(isPaused));
      cycleToggle.dataset.paused = String(isPaused);
      cycleGlyph.textContent = isPaused ? '▶' : '❚❚';
      cycleLabel.textContent = isPaused ? 'Retomar ciclo' : 'Pausar ciclo';
    };

    const scheduleAutoplay = () => {
      clearAutoplay();
      if (isPaused || reduceMotion || !isVisible || document.hidden) return;
      autoplayTimer = window.setTimeout(() => {
        selectMoment((activeIndex + 1) % moments.length, true, false);
      }, AUTOPLAY_DELAY);
    };

    const writeMoment = (index) => {
      const moment = moments[index];
      activeIndex = index;
      root.dataset.activeYear = moment.year;

      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });

      panel.setAttribute('aria-labelledby', tabs[index].id);
      fields.progress.style.transform = `scaleX(${(index + 1) / moments.length})`;
      fields.status.textContent = moment.status;
      fields.year.textContent = moment.year;
      fields.kicker.textContent = moment.kicker;
      fields.title.textContent = moment.title;
      fields.description.textContent = moment.description;
      fields.period.textContent = moment.period;
      fields.period.setAttribute('datetime', moment.datetime);
      fields.note.textContent = moment.note;

      const tagElements = moment.tags.map((tag) => {
        const element = document.createElement('span');
        element.textContent = tag;
        return element;
      });
      fields.tags.replaceChildren(...tagElements);
    };

    function selectMoment(index, animate = true, announce = true) {
      const normalizedIndex = (index + moments.length) % moments.length;
      clearAutoplay();
      if (transitionTimer) window.clearTimeout(transitionTimer);
      if (entranceTimer) window.clearTimeout(entranceTimer);
      stage.classList.remove('is-entering');
      panel.setAttribute('aria-live', announce ? 'polite' : 'off');

      const commit = () => {
        writeMoment(normalizedIndex);
        stage.classList.remove('is-switching');

        if (!reduceMotion && animate) {
          stage.classList.add('is-entering');
          entranceTimer = window.setTimeout(() => {
            stage.classList.remove('is-entering');
            panel.setAttribute('aria-live', 'off');
          }, 760);
        } else {
          panel.setAttribute('aria-live', 'off');
        }

        scheduleAutoplay();
      };

      if (!reduceMotion && animate && normalizedIndex !== activeIndex) {
        stage.classList.add('is-switching');
        transitionTimer = window.setTimeout(commit, 220);
      } else {
        stage.classList.remove('is-switching');
        commit();
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectMoment(index, true, true));
      tab.addEventListener('keydown', (event) => {
        let nextIndex = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex === null) return;

        event.preventDefault();
        tabs[nextIndex].focus();
        selectMoment(nextIndex, true, true);
      });
    });

    if (mobileExperience && 'PointerEvent' in window) {
      let swipeStart = null;

      stage.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse') return;
        swipeStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
      }, { passive: true });

      stage.addEventListener('pointerup', (event) => {
        if (!swipeStart || swipeStart.id !== event.pointerId) return;
        const deltaX = event.clientX - swipeStart.x;
        const deltaY = event.clientY - swipeStart.y;
        swipeStart = null;

        if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) return;
        selectMoment(activeIndex + (deltaX < 0 ? 1 : -1), true, true);
      }, { passive: true });

      stage.addEventListener('pointercancel', () => {
        swipeStart = null;
      }, { passive: true });
    }

    cycleToggle.addEventListener('click', () => {
      isPaused = !isPaused;
      updateCycleControl();
      if (isPaused) clearAutoplay();
      else scheduleAutoplay();
    });

    if (reduceMotion || mobileExperience) {
      cycleToggle.hidden = true;
    } else {
      updateCycleControl();
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        isVisible = Boolean(entries[0]?.isIntersecting);
        if (isVisible) scheduleAutoplay();
        else clearAutoplay();
      }, { threshold: 0.28 });
      observer.observe(root);
    } else {
      isVisible = true;
      scheduleAutoplay();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearAutoplay();
      else scheduleAutoplay();
    });

    window.addEventListener('pagehide', clearAutoplay, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrajectoryExperience, { once: true });
  } else {
    initTrajectoryExperience();
  }
})();
