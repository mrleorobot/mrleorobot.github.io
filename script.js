
// =========================================
// APP DEPTH SCROLL (mobile) — a seção que domina a tela fica em primeiro
// plano; as outras recuam/escurecem. Mede pela área visível na TELA (não
// pelo tamanho da própria seção), então funciona igual numa seção curta
// (Game Dev) e numa bem longa (Projetos, FAQ).
// =========================================
function initAppDepthScroll() {
  if (window.innerWidth > 768) return;

  const sections = document.querySelectorAll(".app-depth");
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const thresholds = [];
  for (let i = 0; i <= 20; i++) thresholds.push(i / 20);

  const observer = new IntersectionObserver(
    (entries) => {
      const vh = window.innerHeight;
      entries.forEach((entry) => {
        const visiblePx = entry.intersectionRect.height;
        const visibleFraction = vh > 0 ? visiblePx / vh : 0;
        if (visibleFraction > 0.5) {
          entry.target.classList.add("is-active");
        } else {
          entry.target.classList.remove("is-active");
        }
      });
    },
    { threshold: thresholds },
  );

  sections.forEach((s) => observer.observe(s));
}
document.addEventListener("DOMContentLoaded", initAppDepthScroll);

// =========================================
// TEXT MASK REVEAL (TITLES)
// =========================================
function initTextMaskReveal() {
  if (window.innerWidth <= 768) return;
  
  const mainTitles = document.querySelectorAll('.skills-header h2, .design-header h2, .faq-container h2, .contact-panel h2');
  
  mainTitles.forEach(title => {
    // avoid empty or nested complex HTML
    if (title.children.length === 0 || (title.children.length === 1 && title.children[0].tagName === 'BR')) {
       const text = title.innerHTML;
       title.innerHTML = `<span class="text-mask-wrapper"><span class="text-mask-inner">${text}</span></span>`;
    } else {
       // if it already has complex HTML, just wrap innerHTML
       const text = title.innerHTML;
       title.innerHTML = `<span class="text-mask-wrapper"><span class="text-mask-inner">${text}</span></span>`;
    }
    
    const maskObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed-mask');
          maskObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
    
    maskObserver.observe(title);
  });
}
document.addEventListener("DOMContentLoaded", initTextMaskReveal);


// =========================================
// INNER IMAGE PARALLAX
// =========================================
function initImageParallax() {
  // Only apply on non-mobile devices for better performance
  if (window.innerWidth <= 768) return;
  
  const parallaxWrappers = document.querySelectorAll('.project-thumbnail-wrapper');
  if (!parallaxWrappers.length) return;

  window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
      parallaxWrappers.forEach(wrapper => {
        const rect = wrapper.getBoundingClientRect();
        // Check if in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          // Calculate progress from 0 (bottom of screen) to 1 (top of screen)
          const progress = 1 - ((rect.top + rect.height) / (window.innerHeight + rect.height));
          // Map to a Y translation (e.g. -15% to 5%)
          const yMove = (progress * 25) - 15; 
          
          const img = wrapper.querySelector('img');
          if (img) {
            img.style.setProperty('--parallax-y', `${yMove}%`);
          }
        }
      });
    });
  });
}
document.addEventListener("DOMContentLoaded", initImageParallax);

// =========================================
// CINEMATIC LOADER ANIMATION
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("cinematic-loader");
  const brandEl = document.getElementById("cinematic-brand");
  const body = document.body;

  if (!loader || !brandEl) {
    if (loader) loader.remove();
    body.classList.remove("loading-locked");
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    body.classList.remove("loading-locked");
    loader.remove();
    return;
  }

  body.classList.add("loading-locked");

  // Sequência calibrada para ~5s no total: cortina fechada -> nome aparece -> lê -> cortina abre
  setTimeout(() => {
    brandEl.classList.add("show");

    setTimeout(() => {
      loader.classList.add("reveal");

      setTimeout(() => {
        body.classList.remove("loading-locked");
        loader.remove();
      }, 2000); // Tempo da cortina deslizar (bate com o CSS: 1.8s + folga)
    }, 2500); // Tempo pra ler a marca
  }, 500); // Pequena pausa inicial antes do nome aparecer

  // Segurança: nunca deixa a tela travada se algo der errado
  setTimeout(() => {
    if (document.getElementById("cinematic-loader")) {
      body.classList.remove("loading-locked");
      loader.remove();
    }
  }, 6000);
});

// Garantir que a página recomece no topo ao recarregar (Melhora a percepção das animações de entrada)
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

/**
 * ========================================================
 * VERSION 1.1: LIGHTWEIGHT MOTION DESIGN (VANILLA JS)
 * ========================================================
 * Este script adiciona interatividade elegante sem bibliotecas externas.
 * Focado em performance e experiência do usuário.
 */


// --------------------------------------------------------
// 0.1 Hero Micro-Parallax Effect (Optimized with RequestAnimationFrame)
// --------------------------------------------------------
function initHeroParallax() {
  const title = document.querySelector(".glitch-title");
  if (!title) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const easing = 0.08; // Smooth interpolation

  window.addEventListener(
    "mousemove",
    (e) => {
      const dampening = 300;
      targetX = (window.innerWidth / 2 - e.pageX) / dampening;
      targetY = (window.innerHeight / 2 - e.pageY) / dampening;

      const limit = 10;
      targetX = Math.max(-limit, Math.min(limit, targetX));
      targetY = Math.max(-limit, Math.min(limit, targetY));
    },
    { passive: true },
  );

  let lastMouseX = -999;
  let lastMouseY = -999;

  let isParallaxVisible = true;
  const heroParallaxSection = document.getElementById("hero");
  if (heroParallaxSection) {
    new IntersectionObserver(
      (entries) => {
        isParallaxVisible = entries[0].isIntersecting;
      },
      { threshold: 0 },
    ).observe(heroParallaxSection);
  }
  function updateParallax() {
    requestAnimationFrame(updateParallax);
    if (!isParallaxVisible) return;
    mouseX += (targetX - mouseX) * easing;
    mouseY += (targetY - mouseY) * easing;

    // Limita a precisão para evitar escritas desnecessárias no repouso
    let roundedX = Math.round(mouseX * 100) / 100;
    let roundedY = Math.round(mouseY * 100) / 100;

    if (roundedX !== lastMouseX || roundedY !== lastMouseY) {
      if (canvas) {
        canvas.style.transform = `scale(1.1) translate3d(${roundedX * 0.5}px, ${roundedY * 0.5}px, 0)`;
      }
      lastMouseX = roundedX;
      lastMouseY = roundedY;
    }
  }
  requestAnimationFrame(updateParallax);
}

// --------------------------------------------------------
// 1. The Storyteller Effect (Typewriter)
// --------------------------------------------------------
function initTypewriter() {
  const titleElement = document.querySelector(".typewriter-text");
  if (!titleElement) return;

  // O texto original está no HTML (bom para SEO).
  // Vamos capturá-lo, limpá-lo e redigitá-lo.
  // Usamos o caractere '|' como um marcador secreto para a quebra de linha (<br>).
  const textToType = "Criatividade|em Código.";
  let currentIndex = 0;

  // Limpa o conteúdo inicial para começar a animação
  titleElement.innerHTML = "";

  function type() {
    // Verifica se ainda há letras para digitar
    if (currentIndex < textToType.length) {
      const char = textToType.charAt(currentIndex);

      // Se encontrarmos o marcador '|', inserimos uma quebra de linha real
      if (char === "|") {
        titleElement.innerHTML += "<br>";
      } else {
        titleElement.innerHTML += char;
      }

      currentIndex++;

      // Velocidade realista: variação aleatória entre 50ms e 120ms por letra
      // Imita o ritmo natural de digitação humana
      const typingSpeed = Math.random() * 70 + 50;
      setTimeout(type, typingSpeed);
    }
  }

  // Inicia o efeito com um pequeno atraso (300ms) para ser mais responsivo
  setTimeout(type, 300);
}

// --------------------------------------------------------
// 2. The Cinematic Scroll (Intersection Observer)
// --------------------------------------------------------
function initCinematicScroll() {
  const elementsToAnimate = document.querySelectorAll(
    ".reveal-item, .section-reveal",
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          // Trigger line-reveal children
          entry.target.querySelectorAll('.line-reveal').forEach(el => el.classList.add('revealed'));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  elementsToAnimate.forEach((element) => observer.observe(element));

  // Immediate reveal for Hero to improve F5 fluidity
  const heroItems = document.querySelectorAll(
    "#hero .reveal-item, #hero-intro .reveal-item",
  );
  heroItems.forEach((item) => {
    // We use a tiny delay to ensure the browser registers the base styles first
    setTimeout(() => item.classList.add("revealed"), 100);
  });
}

function initSpotlight() {
  const cards = document.querySelectorAll(
    ".kurz-card, .project-card, .design-card, .status-card, .timeline-content",
  );
  cards.forEach((card) => {
    card.classList.add("spotlight-card");
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });
}

function initTimelineScroll() {
  const timelineContainer = document.querySelector(".timeline-container");
  const timelineItems = document.querySelectorAll(".timeline-item");
  const timelineGlow = document.getElementById("timeline-glow");

  if (!timelineContainer || !timelineGlow) return;

  const observerTimeline = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          entry.target.classList.add("visible"); // If tied to reveal-item but let's be explicit
        }
      });
    },
    { threshold: 0.5, rootMargin: "0px 0px -100px 0px" },
  );

  timelineItems.forEach((item) => {
    observerTimeline.observe(item);
  });

  let timelineTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (timelineTicking) return;
      timelineTicking = true;
      requestAnimationFrame(() => {
        const topViewport = window.scrollY || document.documentElement.scrollTop;
        const rect = timelineContainer.getBoundingClientRect();
        const timelineTop = rect.top + topViewport;
        const timelineHeight = rect.height;
        const viewportHeight = window.innerHeight;
        let scrolled = topViewport + viewportHeight / 1.5 - timelineTop;
        let percentage = (scrolled / timelineHeight) * 100;
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        timelineGlow.style.height = `${percentage}%`;
        timelineTicking = false;
      });
    },
    { passive: true },
  );
}

// Inicializa todas as funções quando o DOM estiver pronto com proteção robusta de try-catch individual
document.addEventListener("DOMContentLoaded", () => {
  const initSafe = (fn, name) => {
    try {
      fn();
    } catch (e) {
      console.error(`Erro ao inicializar ${name}:`, e);
    }
  };

  // ---- Lenis Smooth Scroll ----
  if (typeof Lenis !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    try {
      const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        wheelMultiplier: 0.85,
        touchMultiplier: 1.4,
        infinite: false,
      });

      // Sync Lenis with GSAP ticker if GSAP is available
      if (typeof gsap !== 'undefined') {
        const onTick = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);

        // Sync with ScrollTrigger if available
        if (typeof ScrollTrigger !== 'undefined') {
          lenis.on('scroll', ScrollTrigger.update);
        }
      } else {
        // Fallback: use requestAnimationFrame
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }

      window.__lenis = lenis;
      console.log('✅ Lenis smooth scroll ativado');
    } catch (e) {
      console.warn('Lenis não pôde ser inicializado:', e);
    }
  }

  initSafe(setupDynamicTabs, "setupDynamicTabs");
  initSafe(initHeroParallax, "initHeroParallax");
  initSafe(initTypewriter, "initTypewriter");
  initSafe(initCinematicScroll, "initCinematicScroll");
  initSafe(initSearchAndMenu, "initSearchAndMenu");
  initSafe(initInteractiveRipples, "initInteractiveRipples");
  initSafe(initTimelineScroll, "initTimelineScroll");
  initSafe(initSpotlight, "initSpotlight");
  initSafe(initTabSystem, "initTabSystem");
  initSafe(initScrollProgressBar, "initScrollProgressBar");
});

// --------------------------------------------------------
// 4. Search Filter & Mobile Menu
// --------------------------------------------------------
function initSearchAndMenu() {
  // Mobile Menu
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = hamburger.classList.contains("active");
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", !isActive);

      if (!isActive) {
        // Stop scroll when menu is open
        if (window.__lenis) window.__lenis.stop();
        document.body.style.overflow = 'hidden';
        
        // Wait for display transition then focus first item
        setTimeout(() => {
          const firstLink = navLinks.querySelector("a");
          if (firstLink) firstLink.focus();
        }, 100);
      } else {
        // Resume scroll when menu is closed
        if (window.__lenis) window.__lenis.start();
        document.body.style.overflow = '';
      }
    });

    // Focus Trap on Mobile Menu
    navLinks.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const focusableElements = navLinks.querySelectorAll("a");
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Se Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Se só Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
      if (e.key === "Escape") {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        if (window.__lenis) window.__lenis.start();
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });

    // Close menu when clicking a link
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        if (window.__lenis) window.__lenis.start();
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (navLinks.classList.contains("active")) {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
          hamburger.classList.remove("active");
          navLinks.classList.remove("active");
          hamburger.setAttribute("aria-expanded", "false");
          if (window.__lenis) window.__lenis.start();
          document.body.style.overflow = '';
        }
      }
    });
  }

  // Debounce Helper
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // --------------------------------------------------------
  // Skills Infinite Scrolling (Vertical Marquee Cloning)
  // --------------------------------------------------------
  const marqueeGrids = [
    document.getElementById("skills-marquee-grid"),
    document.getElementById("skills-marquee-grid-2"),
  ];

  marqueeGrids.forEach((grid) => {
    if (grid) {
      const originalCards = Array.from(grid.children);
      originalCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.classList.add("clone");
        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("tabindex", "-1");
        // Remove scroll reveal animation classes from clones to prevent conflict
        clone.classList.remove(
          "reveal-item",
          "stagger-1",
          "stagger-2",
          "stagger-3",
        );
        grid.appendChild(clone);
      });
    }
  });

  // Search Filter
  const searchInput = document.getElementById("searchInput");
  const marqueeContainer = document.getElementById("skills-marquee-container");
  if (searchInput) {
    const handleSearch = debounce((e) => {
      const term = e.target.value.toLowerCase().trim();
      // Select both inventory cards, project cards, and skills cards
      const cards = document.querySelectorAll(
        ".kurz-card, .ut-card, .kurz-skill-card",
      );

      if (term) {
        if (marqueeContainer) {
          marqueeContainer.classList.add("searching");
        }
        cards.forEach((card) => {
          if (card.classList.contains("clone")) {
            card.style.display = "none";
            return;
          }
          const text = card.innerText.toLowerCase();
          if (text.includes(term)) {
            card.style.display = "";
            card.classList.add("revealed"); // Force showing if searched
          } else {
            card.style.display = "none";
          }
        });
      } else {
        if (marqueeContainer) {
          marqueeContainer.classList.remove("searching");
        }
        cards.forEach((card) => {
          card.style.display = "";
        });
      }
    }, 300);

    searchInput.addEventListener("input", handleSearch);
  }
}

// --------------------------------------------------------
// 6. FAQ Accordion Logic
// --------------------------------------------------------
const faqQuestions = document.querySelectorAll(".faq-question");
faqQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const item = question.parentNode;
    const answer = item.querySelector(".faq-answer-wrapper");
    const isActive = item.classList.contains("active");

    // Fecha outros abertos (opcional, mas garante um visual limpo)
    document.querySelectorAll(".faq-item").forEach((otherItem) => {
      otherItem.classList.remove("active");
      otherItem.querySelector(".faq-answer-wrapper").style.maxHeight = null;
      otherItem
        .querySelector(".faq-question")
        .setAttribute("aria-expanded", "false");
    });

    // Se este estava fechado, abre.
    if (!isActive) {
      item.classList.add("active");
      answer.style.maxHeight = answer.scrollHeight + "px";
      question.setAttribute("aria-expanded", "true");

      item.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
});

// --------------------------------------------------------
// 7. Copy Email Toast Logic
// --------------------------------------------------------
const btnCopiarEmail = document.getElementById("btn-copiar-email");
const toastNotificacao = document.getElementById("toast-notificacao");

if (btnCopiarEmail) {
  const conteudoOriginalBtn = btnCopiarEmail.innerHTML;
  let isWorking = false;

  btnCopiarEmail.addEventListener("click", (e) => {
    e.preventDefault();

    if (isWorking) return;
    isWorking = true;

    // Setup ripple
    const rect = btnCopiarEmail.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    if (e.clientX === 0 && e.clientY === 0) {
      x = rect.width / 2;
      y = rect.height / 2;
    }

    const ripple = document.createElement("span");
    ripple.classList.add("ripple-span");
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btnCopiarEmail.appendChild(ripple);

    setTimeout(() => {
      const emailCopy = "leosouza5555@gmail.com";

      const dispararFeedback = () => {
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        const linkText = btnCopiarEmail.querySelector(".link-text");
        if (linkText) {
          linkText.innerText = "Copiado!";
        } else {
          btnCopiarEmail.innerHTML = "E-mail copiado!";
        }
        btnCopiarEmail.style.background = "#ffffff"; // Primary accent tint
        btnCopiarEmail.classList.add("copied-feedback");

        if (toastNotificacao) {
          toastNotificacao.innerHTML = "E-mail copiado!";
          toastNotificacao.classList.remove("toast-escondido");
          toastNotificacao.classList.add("toast-visivel");
        }

        setTimeout(() => {
          btnCopiarEmail.innerHTML = conteudoOriginalBtn;
          btnCopiarEmail.style.background = "";
          btnCopiarEmail.classList.remove("copied-feedback");
          if (toastNotificacao) {
            toastNotificacao.classList.remove("toast-visivel");
            toastNotificacao.classList.add("toast-escondido");
          }
          const currentRipple = btnCopiarEmail.querySelector(".ripple-span");
          if (currentRipple) currentRipple.remove();
          isWorking = false;
        }, 3000);
      };

      try {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(emailCopy).then(dispararFeedback);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = emailCopy;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          dispararFeedback();
        }
      } catch (err) {
        console.error("Falha ao copiar", err);
        isWorking = false;
        const currentRipple = btnCopiarEmail.querySelector(".ripple-span");
        if (currentRipple) currentRipple.remove();
      }
    }, 350); // let ripple expand before changing text
  });
}

// --------------------------------------------------------
// 7.1. Vertical Ticker Card Interaction Logic
// --------------------------------------------------------
const tickerItems = document.querySelectorAll(".ticker-item");
if (tickerItems.length > 0 && toastNotificacao) {
  let tickerTimeout;
  tickerItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const title = item.getAttribute("data-title");
      const desc = item.getAttribute("data-desc");

      // Setup micro-interaction ripple
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.classList.add("ripple-span");
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      item.appendChild(ripple);

      if (navigator.vibrate) {
        navigator.vibrate(30);
      }

      // Display high-fidelity detailed notification toast
      clearTimeout(tickerTimeout);
      toastNotificacao.innerHTML = `<strong>${title}:</strong> ${desc}`;
      toastNotificacao.classList.remove("toast-escondido");
      toastNotificacao.classList.add("toast-visivel");

      tickerTimeout = setTimeout(() => {
        toastNotificacao.classList.remove("toast-visivel");
        toastNotificacao.classList.add("toast-escondido");
        ripple.remove();
      }, 5000);
    });
  });
}

// --------------------------------------------------------
// 8. Animated Counters Logic
// --------------------------------------------------------
const contadores = document.querySelectorAll(".contador");

if (contadores.length > 0) {
  const observarContadores = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const alvo = parseInt(el.getAttribute("data-alvo"), 10);
          const duration = 2000; // 2 segundos
          const frameRate = 1000 / 60; // 60fps
          const totalFrames = Math.round(duration / frameRate);
          let currentFrame = 0;

          const counterInterval = setInterval(() => {
            currentFrame++;
            const progresso = currentFrame / totalFrames;
            // Easing out cubic
            const easeOut = 1 - Math.pow(1 - progresso, 3);
            const valorAtual = Math.round(alvo * easeOut);

            el.innerText = valorAtual;

            if (currentFrame >= totalFrames) {
              el.innerText = alvo;
              clearInterval(counterInterval);
            }
          }, frameRate);

          // Anima também a barra associada, se houver
          const container = el.closest('div[style*="margin-bottom: 1.5rem"]');
          if (container) {
            const barra = container.querySelector(".tech-bar");
            if (barra) {
              const larguraFinal = barra.getAttribute("data-alvo-largura");
              // Adicionamos um pequeno delay (setTimeout) para dar um charme visual a mais (staggering)
              setTimeout(() => {
                barra.style.width = larguraFinal + "%";
              }, 100);
            }
          }

          // Parar de observar após engatilhar a animação
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.5,
    },
  );

  contadores.forEach((contador) => {
    observarContadores.observe(contador);
  });
}

// --------------------------------------------------------
// 9. GitHub API Integration (Com Cache Inteligente)
// --------------------------------------------------------
async function buscarDadosGitHub() {
  const cacheKey = "githubDataCache";
  const cacheTimestampKey = "githubDataTimestamp";
  const cacheDuration = 3600000; // 1 hora em milissegundos
  const now = Date.now();

  const cachedData = localStorage.getItem(cacheKey);
  const cachedTimestamp = localStorage.getItem(cacheTimestampKey);

  if (cachedData && cachedTimestamp && now - cachedTimestamp < cacheDuration) {
    // Usa dados do cache se ainda estiverem válidos
    try {
      const data = JSON.parse(cachedData);
      document.getElementById("gh-repos").classList.remove("skeleton-text");
      document.getElementById("gh-repos").innerText = data.public_repos;
      document.getElementById("gh-followers").classList.remove("skeleton-text");
      document.getElementById("gh-followers").innerText = data.followers;
      return; // Para a execução, evitando o fetch
    } catch (e) {
      console.warn("Erro ao ler cache do Github", e);
    }
  }

  try {
    const response = await fetch("https://api.github.com/users/mrleorobot");
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error("Falha ao buscar dados do GitHub: " + e.message);
    }

    if (!response.ok || (data && data.message && data.message.includes("rate limit"))) {
      throw new Error("Falha ao buscar dados do GitHub ou Rate limit hit");
    }

    document.getElementById("gh-repos").classList.remove("skeleton-text");
    document.getElementById("gh-repos").innerText = data.public_repos;
    document.getElementById("gh-followers").classList.remove("skeleton-text");
    document.getElementById("gh-followers").innerText = data.followers;

    // Salva os dados e recria o timestamp no localStorage
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheTimestampKey, now.toString());
  } catch (error) {
    console.warn("Aviso na integração com GitHub (usando fallback):", error.message);

    // Em caso de offline/falha, se houver cache vencido, tenta exibir ele mesmo
    if (cachedData) {
      try {
        const data = JSON.parse(cachedData);
        document.getElementById("gh-repos").classList.remove("skeleton-text");
        document.getElementById("gh-repos").innerText =
          data.public_repos + " (Offline)";
        document
          .getElementById("gh-followers")
          .classList.remove("skeleton-text");
        document.getElementById("gh-followers").innerText =
          data.followers + " (Offline)";
        return;
      } catch (e) {}
    }

    document.getElementById("gh-repos").classList.remove("skeleton-text");
    document.getElementById("gh-repos").innerText = "20+";
    document.getElementById("gh-followers").classList.remove("skeleton-text");
    document.getElementById("gh-followers").innerText = "45+";
  }
}

async function fetchRecentRepos() {
  const container = document.getElementById("github-repos-grid");
  if (!container) return;

  const username = "mrleorobot";
  const numRepos = 6;
  const cacheKey = "githubReposData";
  const cacheTimestampKey = "githubReposTimestamp";
  const cacheDuration = 3600000; // 1 hr
  const now = Date.now();

  const cachedData = localStorage.getItem(cacheKey);
  const cachedTimestamp = localStorage.getItem(cacheTimestampKey);

  const renderRepos = (reposData) => {
    container.innerHTML = "";

    // Array estático de fallback caso a API falhe ou exija rate limit
    const fallbackRepos = [
      {
        name: "mrleorobot.github.io",
        description:
          "Meu portfólio pessoal construído com foco em UX/UI e interações fluidas.",
        language: "HTML",
        updated_at: new Date().toISOString(),
        html_url: "https://github.com/mrleorobot/mrleorobot.github.io",
        stargazers_count: 5,
        fork: false,
      },
      {
        name: "dashboard_de_inventario",
        description:
          "Dashboard em Power BI para gestão eficiente de estoque e previsão de demandas.",
        language: "DAX",
        updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        html_url: "https://github.com/mrleorobot/dashboard_de_inventario",
        stargazers_count: 8,
        fork: false,
      },
      {
        name: "design_system_etep",
        description:
          "Biblioteca unificada de componentes e guias de estilo para a ETEP.",
        language: "TypeScript",
        updated_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        html_url: "https://github.com/mrleorobot/design_system_etep",
        stargazers_count: 12,
        fork: false,
      },
      {
        name: "Aulas-Antigas-2024",
        description:
          "Repositório com o material didático das minhas turmas na ETEP.",
        language: "Markdown",
        updated_at: new Date(Date.now() - 86400000 * 20).toISOString(),
        html_url: "https://github.com/mrleorobot/Aulas-Antigas-2024",
        stargazers_count: 15,
        fork: false,
      },
    ];

    const targetData = Array.isArray(reposData) ? reposData : fallbackRepos;

    const repos = targetData.filter((repo) => !repo.fork).slice(0, numRepos);

    if (repos.length === 0) {
      container.innerHTML = `<div style="text-align: center; width: 100%; color: #a0aec0; grid-column: 1 / -1;">Nenhum repositório recente encontrado.</div>`;
      return;
    }

    const localObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            localObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    repos.forEach((repo, i) => {
      const article = document.createElement("article");
      article.className = `design-card reveal-item stagger-${(i % 3) + 1} active`;
      article.style.padding = "1.25rem";
      article.style.borderRadius = "16px";
      article.style.background = "rgba(10, 10, 10, 0.6)";
      article.style.border = "1px solid rgba(255, 255, 255, 0.05)";
      article.style.display = "flex";
      article.style.flexDirection = "column";

      const desc = repo.description
        ? repo.description
        : "Sem descrição fornecida.";
      const lang = repo.language ? repo.language : "Markdown";
      const date = new Date(repo.updated_at).toLocaleDateString("pt-BR");

      article.innerHTML = `
         <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary-accent);">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
            </svg>
            <span style="font-size: 0.8rem; color: #a0aec0; font-family: 'JetBrains Mono', monospace;">${date}</span>
         </div>
         <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem; word-break: break-word; overflow-wrap: break-word; text-transform: uppercase;" class="notranslate" translate="no">${repo.name}</h3>
         <p style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 1.25rem; flex: 1; line-height: 1.4;">${desc}</p>
         <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05);">
             <span class="notranslate" translate="no" style="font-size: 0.8rem; color: var(--primary-accent); display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--primary-accent); display: inline-block;"></span>
                ${lang}
             </span>
             <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" style="color: #fff; text-decoration: none; font-size: 0.8rem; border-bottom: 1px dotted currentColor; transition: opacity 0.3s ease; font-family: 'Space Grotesk', sans-serif;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Ver Repositório ↗</a>
         </div>
       `;
      container.appendChild(article);
      localObserver.observe(article);
    });
  };

  if (cachedData && cachedTimestamp && now - cachedTimestamp < cacheDuration) {
    try {
      renderRepos(JSON.parse(cachedData));
      return;
    } catch (e) {
      console.warn("Erro cache repos:", e);
    }
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=pushed&per_page=15`,
    );
    
    let data;
    try {
      data = await res.json();
    } catch(e) {
      throw new Error("Falha ao buscar repositórios do GitHub");
    }

    if (!res.ok || (data && data.message && data.message.includes("rate limit"))) {
      throw new Error("Falha ao buscar repositórios ou Rate limit hit");
    }
    renderRepos(data);
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheTimestampKey, now.toString());
  } catch (error) {
    console.warn("Aviso na integração com GitHub Repos (usando fallback):", error.message);
    if (cachedData) {
      try {
        renderRepos(JSON.parse(cachedData));
      } catch (e) {
        renderRepos(null); // fallback
      }
    } else {
      renderRepos(null); // fallback se n tiver cache
    }
  }
}

buscarDadosGitHub();
fetchRecentRepos();

// --------------------------------------------------------
// 11. Availability Status Logic (Business Hours)
// --------------------------------------------------------
function verificarDisponibilidade() {
  const agora = new Date();
  const hora = agora.getHours();
  const diaDaSemana = agora.getDay(); // 0 = Domingo, 6 = Sábado

  const bolinhaElement = document.getElementById("bolinha-status");
  const textoElement = document.getElementById("texto-status");

  if (!bolinhaElement || !textoElement) return;

  // Horários Disponíveis:
  // - Segunda a Sexta (1 a 5): 08:00 às 17:59
  // - Sábado (6): 08:00 às 16:59
  const isDiaDeSemana =
    diaDaSemana >= 1 && diaDaSemana <= 5 && hora >= 8 && hora < 18;
  const isSabado = diaDaSemana === 6 && hora >= 8 && hora < 17;

  if (isDiaDeSemana || isSabado) {
    bolinhaElement.style.backgroundColor = "#ffffff";
    bolinhaElement.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.8)";
    textoElement.innerText = "Online - Disponível para contato";
  } else {
    bolinhaElement.style.backgroundColor = "#ffffff";
    bolinhaElement.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.8)";
    textoElement.innerText = "Offline - Recarregando as baterias";
  }
}

verificarDisponibilidade();
setInterval(verificarDisponibilidade, 60000); // Atualiza a cada 1 minuto


// Back to top button logic
const btnTopo = document.getElementById("btn-topo");
if (btnTopo) {
  let isScrolling = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 300) {
            btnTopo.classList.add("show");
          } else {
            btnTopo.classList.remove("show");
          }
          isScrolling = false;
        });
        isScrolling = true;
      }
    },
    { passive: true },
  );
  btnTopo.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Initialize simple interactions

function initInteractiveRipples() {
  const rippleButtons = document.querySelectorAll(
    ".cardList__btn",
  );

  rippleButtons.forEach((btn) => {
    btn.addEventListener("mousedown", function (e) {
      const rect = btn.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      if (e.clientX === 0 && e.clientY === 0) {
        x = rect.width / 2;
        y = rect.height / 2;
      }

      const ripple = document.createElement("span");
      ripple.classList.add("ripple-span");
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      btn.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600); // the dynamic-ripple animation duration is 0.6s
    });
  });
}

function initStatusParallax() {
  // Desativado a pedido do usuário para remover efeito grosseiro de ampliação
}

// --------------------------------------------------------
// 13. Premium UI Sounds (Minimalist, Dark & Crisp)
// --------------------------------------------------------
const soundToggleBtn = document.getElementById("soundToggleBtn");
let soundEnabled = true;
let audioCtx = null;

const iconVolumeOn =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
const iconVolumeOff =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';

// Load Audio Preference
const savedAudio = localStorage.getItem("portfolioAudio");
if (savedAudio === "off") {
  soundEnabled = false;
  if (soundToggleBtn) soundToggleBtn.innerHTML = iconVolumeOff;
}

function initAudio() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  } catch (e) {}
}

function playHoverSound() {
  if (!soundEnabled) return;
  if (!audioCtx) initAudio();
  if (audioCtx.state === "suspended") return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // Subtle low thump for hover
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    40,
    audioCtx.currentTime + 0.05
  );

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.015, audioCtx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.05);
}

function playClickSound() {
  if (!soundEnabled) return;
  if (!audioCtx) initAudio();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // Crisp modern tap for click
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    150,
    audioCtx.currentTime + 0.05
  );

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
}

if (soundToggleBtn) {
  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      localStorage.setItem("portfolioAudio", "on");
      initAudio();
      soundToggleBtn.innerHTML = iconVolumeOn;
      playClickSound(); // Play test sound
    } else {
      localStorage.setItem("portfolioAudio", "off");
      soundToggleBtn.innerHTML = iconVolumeOff;
    }
  });
}

// Attach sounds to elements
document
  .querySelectorAll("button, a, .kurz-card, .design-card, .ut-card")
  .forEach((el) => {
    el.addEventListener("mouseenter", playHoverSound);
    el.addEventListener("click", playClickSound);
  });

// --------------------------------------------------------
// 16. Modals Logic
// --------------------------------------------------------
const modalBehance = document.getElementById("modal-behance");
if (modalBehance) {
  document.querySelectorAll(".contact-link.behance").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modalBehance.showModal();
    });
  });
}

const modalDribbble = document.getElementById("modal-dribbble");
if (modalDribbble) {
  document.querySelectorAll(".contact-link.dribbble").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modalDribbble.showModal();
    });
  });
}

const modalLightbox = document.getElementById("modal-lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxCategory = document.getElementById("lightbox-category");
const lightboxChallenge = document.getElementById("lightbox-challenge");
const lightboxSolution = document.getElementById("lightbox-solution");
const lightboxTech = document.getElementById("lightbox-tech");
const lightboxWrapper = document.getElementById("lightbox-wrapper");
const lightboxInfoSide = document.getElementById("lightbox-info-side");

const projectDetails = {
  "placeholder-dashboard": {
    title: "Dashboard de Gestão",
    category: "Web & Front-end Development",
    challenge:
      "Organizar e resumir dados densos de inventário de forma legível, fluida e esteticamente agradável para tomadores de decisão.",
    solution:
      "Criação de um painel interativo utilizando Next.js, Tailwind CSS e Framer Motion. Traz gráficos dinâmicos, animações fluidas e filtragem instantânea de métricas.",
    tech: ["Next.js", "Tailwind CSS", "Framer Motion", "Recharts"],
  },
  "placeholder-refugio": {
    title: "Refúgio Sereno",
    category: "UX/UI Design & Acessibilidade",
    challenge:
      "Facilitar a rotina diária de pessoas com TDAH e autismo leve, as quais frequentemente sofrem com sobrecarga cognitiva em interfaces convencionais.",
    solution:
      "Gerenciador de tarefas gamificado e acolhedor, utilizando contrastes suaves baseados na psicologia das cores, fontes altamente legíveis e feedbacks calmos.",
    tech: ["HTML5", "Sass", "JavaScript (ES6)", "Vanilla Motion"],
  },
  "placeholder-portal": {
    title: "Portal Corporativo",
    category: "Full-stack & Enterprise Design",
    challenge:
      "Criar uma interface administrativa unificada para suporte técnico interno e gestão de treinamentos operacionais de forma otimizada.",
    solution:
      "Painel administrativo minimalista com fendas laterais flutuantes, tabelas responsivas otimizadas e gerenciamento ágil de relatórios de auditoria.",
    tech: ["React", "CSS Modules", "ChartJS", "Node.js"],
  },
  "placeholder-chat-ia": {
    title: "Tutor IA",
    category: "Artificial Intelligence UI",
    challenge:
      "Prover um tutor personalizado e sempre disponível para tirar dúvidas sobre Administração, TI e Design para estudantes.",
    solution:
      "Interface de chat conversacional fluida com renderização em Markdown, respostas de streaming, e categorização rápida de matérias estudadas.",
    tech: ["Next.js", "Gemini API", "Tailwind CSS", "LocalCache API"],
  },
  "mockup-convite": {
    title: "Convite Digital",
    category: "UX/UI Design",
    challenge:
      "Modernizar o formato tradicional de convites físicos de eventos para um formato dinâmico, interativo e compartilhável.",
    solution:
      "Desenvolvimento de um convite digital de alta fidelidade com micro-interações elegantes de RSVP, integração direta com mapas de rotas e animações sutis de constelações.",
    tech: ["Figma", "Design de Interação", "Prototipagem de Fluxos"],
  },
  "mockup-hamburgueria": {
    title: "Menu Digital",
    category: "Visual Identity & Front-end Layout",
    challenge:
      "Criar um cardápio digital otimizado para celulares, que reduza a fricção de compra e evite a dispersão visual.",
    solution:
      "Estruturação em bento grid focado em usabilidade, com cores quentes baseadas em psicologia alimentar para destacar itens em alta, com adição de barra de busca instantânea.",
    tech: ["Photoshop", "Illustrator", "Grid System Design"],
  },
  "mockup-logo": {
    title: "LDS Magazine Branding",
    category: "Corporate Identity",
    challenge:
      "Projetar uma marca memorável de luxo e alto padrão que comunique sofisticação, precisão e minimalismo.",
    solution:
      "Logotipo desenhado a partir de grids geométricos perfeitos, com tipografia personalizada em serifado clássico e paleta baseada em tons de terra e champanhe.",
    tech: ["Illustrator", "Teoria de Grid", "Manual de Identidade"],
  },
  "mockup-editorial": {
    title: "LDS Magazine Editorial",
    category: "Editorial Design",
    challenge:
      "Diagramar um artigo longo e complexo de forma a convidar a uma leitura tranquila e absorção aprofundada.",
    solution:
      "Direção de arte editorial aplicando grids assimétricos de colunas, tipografia com alto contraste e respiros generosos no layout, evitando fadiga de leitura.",
    tech: ["InDesign", "Diagramação", "Tipografia Avançada"],
  },
  "mockup-pixelart": {
    title: "Creative C. Pixel Art",
    category: "Retro Visual Assets",
    challenge:
      "Criar um ambiente imersivo, nostálgico e autêntico de RPG retrô para projetos pessoais e marcas criativas.",
    solution:
      "Criação de sprites e paleta de cores reduzida de 16-bits. O design busca guiar as interações de forma lúdica através de elementos clássicos de jogos pixelados.",
    tech: ["Aseprite", "Pixel Art Theory", "Nostalgic UX"],
  },
  "mockup-psicologia": {
    title: "Estudo: Cores & UX",
    category: "Design Research",
    challenge:
      "Sistematizar o impacto das decisões cromáticas no comportamento dos usuários em produtos de saúde digital.",
    solution:
      "Um artigo científico prático que compila paletas testadas, métricas de conversão e acessibilidade para interfaces de bem-estar social.",
    tech: [
      "Análise Qualitativa",
      "Heurísticas de Jakob",
      "Acessibilidade WCAG",
    ],
  },
};

if (modalLightbox && lightboxImg) {
  // Attach to all images inside gallery wrapper and project thumbnails
  document
    .querySelectorAll(".cards__wrapper img, .project-lightbox-trigger")
    .forEach((img) => {
      img.addEventListener("click", () => {
        let targetImg = img;
        if (!img.src && img.querySelector("img")) {
          targetImg = img.querySelector("img");
        }

        const srcAttr = targetImg.getAttribute("src") || "";
        const srcFile = srcAttr.split("/").pop() || "";
        const key = srcFile.split(".")[0] || "";

        lightboxImg.src = targetImg.src || srcAttr;

        const details = projectDetails[key];
        if (
          details &&
          lightboxTitle &&
          lightboxCategory &&
          lightboxChallenge &&
          lightboxSolution &&
          lightboxTech
        ) {
          lightboxTitle.textContent = details.title;
          lightboxCategory.textContent = details.category;
          lightboxChallenge.textContent = details.challenge;
          lightboxSolution.textContent = details.solution;

          lightboxTech.innerHTML = "";
          details.tech.forEach((t) => {
            const span = document.createElement("span");
            span.textContent = t;
            lightboxTech.appendChild(span);
          });

          if (lightboxInfoSide) lightboxInfoSide.style.display = "flex";
          if (lightboxWrapper)
            lightboxWrapper.style.gridTemplateColumns = "1.1fr 0.9fr";
        } else {
          if (lightboxInfoSide) lightboxInfoSide.style.display = "none";
          if (lightboxWrapper)
            lightboxWrapper.style.gridTemplateColumns = "1fr";
        }

        modalLightbox.showModal();
      });
      img.style.cursor = "zoom-in";
    });
}

const modalFullscreen = document.getElementById("modal-fullscreen-image");
const fullscreenImg = document.getElementById("fullscreen-img");

if (lightboxImg && modalFullscreen && fullscreenImg) {
  lightboxImg.addEventListener("click", () => {
    fullscreenImg.src = lightboxImg.src;
    fullscreenImg.alt = lightboxImg.alt;
    modalFullscreen.showModal();
  });
}

// Close modals when clicking outside
document.querySelectorAll(".custom-modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.close();
    }
  });
});

// Share button logic
const btnShare = document.getElementById("btn-share");
if (btnShare) {
  btnShare.addEventListener("click", () => {
    const fallbackCopy = () => {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          const t = document.getElementById("toast-notificacao");
          if (t) {
            t.innerHTML = "Link copiado para área de transferência!";
            t.classList.remove("toast-escondido");
            t.classList.add("toast-visivel");
            setTimeout(() => {
              t.classList.remove("toast-visivel");
              t.classList.add("toast-escondido");
            }, 3000);
          }
        })
        .catch((err) => console.error("Erro ao copiar", err));
    };

    if (navigator.share) {
      navigator
        .share({
          title: "Portfólio - Leonilson Souza",
          text: "Confira o portfólio de Leonilson Souza!",
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Erro ao compartilhar", err);
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  });
}

// --------------------------------------------------------
// X. Language Logic (Google Translate)
// --------------------------------------------------------
const langToggleBtn = document.getElementById("langToggleBtn");
if (langToggleBtn) {
  let isEnglish = localStorage.getItem("site_lang") === "en";

  const updateLangButton = () => {
    const span = langToggleBtn.querySelector(".lang-text");
    if (span) {
      span.innerText = isEnglish ? "PT" : "EN";
    }
  };

  const triggerGoogleTranslate = (targetLang) => {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event("change"));
    } else {
      // Wait till it is available
      setTimeout(() => triggerGoogleTranslate(targetLang), 500);
    }
  };

  // Set initial state
  if (isEnglish) {
    updateLangButton();
    // Wait slightly for Google script to load before applying if it's EN
    setTimeout(() => triggerGoogleTranslate("en"), 1000);
  }

  langToggleBtn.addEventListener("click", () => {
    isEnglish = !isEnglish;
    localStorage.setItem("site_lang", isEnglish ? "en" : "pt");
    updateLangButton();
    triggerGoogleTranslate(isEnglish ? "en" : "pt");
  });
}

// --------------------------------------------------------
// Scroll Spy & Navigation Links Handling (No-tab Continuous Landing Page)
// --------------------------------------------------------
function setupDynamicTabs() {
  // Discarded because user requested a complete continuous landing page on a single screen scroll.
  // We keep the method defined so it doesn't cause script errors, but do not execute any DOM manipulation.
}

function initTabSystem() {
  const navLinks = document.querySelectorAll(".nav-links a, .logo");

  // Intercept all navigation links and add smooth scroll
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#") && href !== "#") {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          // Close mobile menu if open
          const navLinksContainer = document.querySelector(".nav-links");
          const hamburger = document.querySelector(".hamburger");
          if (
            navLinksContainer &&
            navLinksContainer.classList.contains("active")
          ) {
            navLinksContainer.classList.remove("active");
            if (hamburger) hamburger.setAttribute("aria-expanded", "false");
          }

          // Smooth scroll to target element
          const offset = 80; // height of fixed header to prevent overlapping
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = targetElement.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          // Update hash in URL
          history.pushState(null, null, href);
        }
      }
    });
  });

  // Scroll Spy using IntersectionObserver to update active state of navbar links dynamically!
  const spySections = ["hero", "sobre", "tech-stack", "projetos", "cta-final"];
  const options = {
    root: null,
    rootMargin: "-20% 0px -60% 0px", // triggers when section enters the viewport nicely
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");

        // Find corresponding link
        document.querySelectorAll(".nav-tab-link").forEach((link) => {
          const href = link.getAttribute("href");
          if (href === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, options);

  spySections.forEach((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) observer.observe(el);
  });
}

function initScrollProgressBar() {
  const progressBar = document.getElementById("header-scroll-progress");
  if (!progressBar) return;

  window.addEventListener(
    "scroll",
    () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        progressBar.style.width = "0%";
        return;
      }
      let scrollPercent = (scrollTop / docHeight) * 100;
      if (scrollPercent < 0) scrollPercent = 0;
      if (scrollPercent > 100) scrollPercent = 100;
      progressBar.style.width = `${scrollPercent}%`;
    },
    { passive: true },
  );
}

// Cursor glow logic removed

