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

    const cards = document.querySelectorAll('.project-card, .testimonial-card');

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

    const cards = document.querySelectorAll('.project-card, .testimonial-card, .faq-item');

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
  // 9. WORD BY WORD REVEAL
  // ═══════════════════════════════════════════
  function initWordByWordReveal() {
    if (prefersReducedMotion) return;

    const elements = document.querySelectorAll('.trajectory-header__lead, .hero-editorial__desc');

    elements.forEach(el => {
      const text = el.innerText;
      const words = text.split(' ');
      el.innerHTML = '';
      el.classList.add('word-reveal');

      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.innerText = word + ' ';
        span.style.transitionDelay = `${i * 0.04}s`;
        el.appendChild(span);
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.word-reveal').forEach(el => observer.observe(el));
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
    const elements = document.querySelectorAll('.timeline-item, .tech-label, .faq-item, .testimonial-card, .project-card');

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
  // 14. NOISE TEXTURE
  // ═══════════════════════════════════════════
  function initNoiseTexture() {
    const noise = document.createElement('div');
    noise.id = 'noise-texture';
    document.body.appendChild(noise);
  }

  // ═══════════════════════════════════════════
  // 15. AMBIENT ORBS
  // ═══════════════════════════════════════════
  function initAmbientOrbs() {
    if (prefersReducedMotion) return;

    const orb1 = document.createElement('div');
    orb1.className = 'ambient-orb ambient-orb--1';
    const orb2 = document.createElement('div');
    orb2.className = 'ambient-orb ambient-orb--2';
    const orb3 = document.createElement('div');
    orb3.className = 'ambient-orb ambient-orb--3';

    document.body.insertBefore(orb1, document.body.firstChild);
    document.body.insertBefore(orb2, document.body.firstChild);
    document.body.insertBefore(orb3, document.body.firstChild);
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
    const cards = document.querySelectorAll('.project-card, .testimonial-card');
    cards.forEach(card => card.classList.add('depth-card'));
  }

  // ═══════════════════════════════════════════
  // 19. GLOW BORDERS
  // ═══════════════════════════════════════════
  function initGlowBorders() {
    const sections = document.querySelectorAll('.project-card, .testimonial-card, .faq-item');
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
  // 23. PROJECT THUMBNAIL PARALLAX
  // ═══════════════════════════════════════════
  function initProjectParallax() {
    if (prefersReducedMotion || isTouchDevice) return;

    const wrappers = document.querySelectorAll('.project-thumbnail-wrapper');

    wrappers.forEach(wrapper => {
      const img = wrapper.querySelector('img');
      if (!img) return;

      wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        img.style.transform = `scale(1.1) translate(${x * -20}px, ${y * -20}px)`;
      });

      wrapper.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1) translate(0, 0)';
      });
    });
  }

  // ═══════════════════════════════════════════
  // 24. SKILL TAG SPARKLE
  // ═══════════════════════════════════════════
  function initSkillSparkle() {
    const labels = document.querySelectorAll('.tech-label');
    labels.forEach(label => {
      label.addEventListener('mouseenter', () => {
        label.style.textShadow = '0 0 10px rgba(255,255,255,0.4)';
      });
      label.addEventListener('mouseleave', () => {
        label.style.textShadow = 'none';
      });
    });
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

  // ═══════════════════════════════════════════
  // 26. HERO CTA MAGNETIC (reforço)
  // ═══════════════════════════════════════════
  function initHeroCTAMagnetic() {
    if (isTouchDevice || prefersReducedMotion) return;

    const cta = document.querySelector('.hero-editorial__cta');
    if (!cta) return;

    cta.addEventListener('mousemove', (e) => {
      const rect = cta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      cta.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    cta.addEventListener('mouseleave', () => {
      cta.style.transform = 'translate(0, 0)';
    });
  }

  // ═══════════════════════════════════════════
  // INITIALIZE ALL
  // ═══════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', () => {
    const initEffects = () => {
      initAuroraCanvas();
      initCursorGlow();
      initMagneticButtons();
      init3DTilt();
      initSpotlightHover();
      initSectionEntrance();
      initSectionDividers();
      initSectionTitleEntrance();
      initWordByWordReveal();
      initTimelineLineDraw();
      initStaggerReveal();
      initAmbientParticles();
      initVignette();
      initNoiseTexture();
      initAmbientOrbs();
      initLiquidButtons();
      initShimmer();
      initDepthCards();
      initGlowBorders();
      initContactEnhancements();
      initNavEnhancements();
      initScrollProgressGlow();
      initProjectParallax();
      initSkillSparkle();
      initFooterEnhancement();
      initHeroCTAMagnetic();

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
