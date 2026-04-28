// Garantir que a página recomece no topo ao recarregar (Melhora a percepção das animações de entrada)
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    /**
     * ========================================================
     * VERSION 1.1: LIGHTWEIGHT MOTION DESIGN (VANILLA JS)
     * ========================================================
     * Este script adiciona interatividade elegante sem bibliotecas externas.
     * Focado em performance e experiência do usuário.
     */

    // Easter Egg para Recrutadores Técnicos
    console.log(
      "%c🚀 Olá, Tech Recruiter ou Tech Lead! %c\n\nVejo que você gosta de olhar debaixo do capô. Este portfólio é 100% Vanilla JS, com Tipografia Fluida, Acessibilidade Sensorial, Busca Fuzzy e Cache de API no LocalStorage.\n\nSe gostou da organização e da atenção aos detalhes, vamos conversar sobre a próxima vaga da sua equipe!",
      "color: #00e5ff; font-size: 20px; font-weight: bold; text-shadow: 1px 1px 0 #ff00ff;",
      "color: #a0aec0; font-size: 14px; line-height: 1.5;"
    );

    // --------------------------------------------------------
    // 0. Hero Generative Art (Node-Link reactive web)
    // --------------------------------------------------------
    function initHeroParticles() {
      const canvas = document.getElementById('hero-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      
      let particles = [];
      const particleCount = window.innerWidth < 768 ? 40 : 100; // Even fewer for performance on mobile
      const colors = ['#00e5ff', '#ff7b9c', '#ffeb3b', '#ffffff'];
      const mouse = { x: null, y: null, radius: 100 }; // Constrain interaction area for speed

      window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });

      window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
      });
      
      function resize() {
        if (!canvas) return;
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      }
      
      window.addEventListener('resize', resize);
      resize();
      
      class Particle {
        constructor() {
          this.init();
        }
        
        init() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.baseX = this.x;
          this.baseY = this.y;
          this.vx = (Math.random() - 0.5) * 1.2;
          this.vy = (Math.random() - 0.5) * 1.2;
          this.size = Math.random() * 2 + 1;
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.alpha = Math.random() * 0.5 + 0.2;
          this.density = (Math.random() * 30) + 1;
        }
        
        update() {
          // Normal floating movement
          this.x += this.vx;
          this.y += this.vy;
          
          if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
          if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

          // Mouse interaction (Magnetic Effect)
          if (mouse.x !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < mouse.radius) {
              this.x -= directionX;
              this.y -= directionY;
            }
          }
        }
        
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = this.alpha;
          ctx.fill();
        }
      }
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
      
      function drawLines() {
        const maxDist = window.innerWidth < 768 ? 55 : 95; 
        const maxDistSq = maxDist * maxDist; // Pre-calculate square distance
        
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            
            // Fast distance check using square distance (avoids expensive Math.sqrt)
            const distSq = dx * dx + dy * dy;
            
            if (distSq < maxDistSq) {
              const distance = Math.sqrt(distSq); // Only calc sqrt if we actually need to draw
              const alpha = (1 - distance / maxDist) * 0.12;
              ctx.beginPath();
              ctx.strokeStyle = p1.color;
              ctx.globalAlpha = alpha;
              ctx.lineWidth = 0.5;
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }
      
      function animate() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
          p.update();
          p.draw();
        });
        
        drawLines();
        requestAnimationFrame(animate);
      }
      
      animate();
    }

    // --------------------------------------------------------
    // 0.1 Hero Micro-Parallax Effect (Optimized with RequestAnimationFrame)
    // --------------------------------------------------------
    function initHeroParallax() {
      const title = document.querySelector('.glitch-title');
      const canvas = document.getElementById('hero-canvas');
      if (!title && !canvas) return;

      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;
      const easing = 0.08; // Smooth interpolation

      window.addEventListener('mousemove', (e) => {
        const dampening = 300;
        targetX = (window.innerWidth / 2 - e.pageX) / dampening;
        targetY = (window.innerHeight / 2 - e.pageY) / dampening;
        
        const limit = 10;
        targetX = Math.max(-limit, Math.min(limit, targetX));
        targetY = Math.max(-limit, Math.min(limit, targetY));
      });

      function updateParallax() {
        // Linear interpolation for buttery smoothness
        mouseX += (targetX - mouseX) * easing;
        mouseY += (targetY - mouseY) * easing;

        if (title) {
          title.style.transform = `skew(-1deg) translateZ(50px) translate(${mouseX * 1.2}px, ${mouseY * 1.2}px)`;
        }
        if (canvas) {
          canvas.style.transform = `scale(1.1) translate(${mouseX * 0.5}px, ${mouseY * 0.5}px)`;
        }
        requestAnimationFrame(updateParallax);
      }

      requestAnimationFrame(updateParallax);
    }

    // --------------------------------------------------------
    // 1. The Storyteller Effect (Typewriter)
    // --------------------------------------------------------
    function initTypewriter() {
      const titleElement = document.querySelector('.typewriter-text');
      if (!titleElement) return;

      // O texto original está no HTML (bom para SEO). 
      // Vamos capturá-lo, limpá-lo e redigitá-lo.
      // Usamos o caractere '|' como um marcador secreto para a quebra de linha (<br>).
      const textToType = "Criatividade|em Código.";
      let currentIndex = 0;
      
      // Limpa o conteúdo inicial para começar a animação
      titleElement.innerHTML = '';

      function type() {
        // Verifica se ainda há letras para digitar
        if (currentIndex < textToType.length) {
          const char = textToType.charAt(currentIndex);
          
          // Se encontrarmos o marcador '|', inserimos uma quebra de linha real
          if (char === '|') {
            titleElement.innerHTML += '<br>';
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
      const elementsToAnimate = document.querySelectorAll('.reveal-item');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      elementsToAnimate.forEach(element => observer.observe(element));

      // Immediate reveal for Hero to improve F5 fluidity
      const heroItems = document.querySelectorAll('#hero .reveal-item');
      heroItems.forEach(item => {
        // We use a tiny delay to ensure the browser registers the base styles first
        setTimeout(() => item.classList.add('revealed'), 100);
      });
    }

    // --------------------------------------------------------
    // 3. Technical Easter Egg: Retro Mode (Evoluído)
    // --------------------------------------------------------
    function initPixelMode() {
      const pixelToggleBtn = document.getElementById('pixelToggle');
      const retroOverlay = document.getElementById('retro-overlay');
      const body = document.body;

      // Check saved preference
      if (localStorage.getItem('retroMode') === 'enabled') {
        body.classList.add('modo-retro');
        body.classList.add('vhs-mode');
      }

      if (pixelToggleBtn) {
        pixelToggleBtn.addEventListener('click', () => {
          // PONTO 8: Haptic Feedback (Modo Retro)
          if (navigator.vibrate) { navigator.vibrate([100, 50, 100]); }

          // Ativa o Overlay Retro (Estilo BIOS)
          if (retroOverlay) {
            retroOverlay.classList.add('ativar-retro');
            
            setTimeout(() => {
              body.classList.toggle('modo-retro');
              body.classList.toggle('vhs-mode');
              
              // Save preference
              if (body.classList.contains('modo-retro')) {
                localStorage.setItem('retroMode', 'enabled');
              } else {
                localStorage.setItem('retroMode', 'disabled');
              }
              
              // Aguarda o fim da animação
              setTimeout(() => {
                retroOverlay.classList.remove('ativar-retro');
              }, 500);

            }, 300); // 300ms = Pico do boot (clip-path abrindo)
          } else {
            // Fallback
            body.classList.toggle('modo-retro');
            body.classList.toggle('vhs-mode');
            if (body.classList.contains('modo-retro')) {
              localStorage.setItem('retroMode', 'enabled');
            } else {
              localStorage.setItem('retroMode', 'disabled');
            }
          }
        });
      }
    }

    // Inicializa todas as funções quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
      initHeroParticles();
      initHeroParallax();
      initTypewriter();
      initCinematicScroll();
      initPixelMode();
      initSearchAndMenu();
    });

    // --------------------------------------------------------
    // 4. Search Filter & Mobile Menu
    // --------------------------------------------------------
    function initSearchAndMenu() {
      // Mobile Menu
      const hamburger = document.querySelector('.hamburger');
      const navLinks = document.querySelector('.nav-links');
      
      if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
          const isActive = hamburger.classList.contains('active');
          hamburger.classList.toggle('active');
          navLinks.classList.toggle('active');
          hamburger.setAttribute('aria-expanded', !isActive);
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
          });
        });
      }

      // Search Filter
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const term = e.target.value.toLowerCase();
          // Select both inventory cards and project cards
          const cards = document.querySelectorAll('.kurz-card, .ut-card');
          
          cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            if (text.includes(term)) {
              card.style.display = '';
              card.classList.add('revealed'); // Force showing if searched
            } else {
              card.style.display = 'none';
            }
          });
        });
      }
    }

    // --------------------------------------------------------
    // 5. Theme Toggle (Light/Dark Mode) with Glitch Transition
    // --------------------------------------------------------
    const themeBtn = document.getElementById('themeToggleBtn');
    const glitchOverlay = document.getElementById('glitch-overlay');
    const body = document.body;
    
    const iconSun = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    const iconMoon = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';

    // Check local storage for preference
    const savedTheme = localStorage.getItem('portfolioTheme');
    if (savedTheme === 'light') {
      body.classList.add('light-mode');
      // Força a atualização do design no Undertale se foi carregado inicialmente claro
      if(window.writeUndertaleText) setTimeout(writeUndertaleText, 100); 
      if(themeBtn) themeBtn.innerHTML = iconMoon;
    }

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        // PONTO 8: Haptic Feedback (Modo Glitch)
        if (navigator.vibrate) { navigator.vibrate([100, 50, 100]); }
        
        // Ativa o Overlay Glitch
        if (glitchOverlay) {
          glitchOverlay.classList.add('ativar-glitch');
          
          // Aguarda o pico do Glitch (200ms) para trocar a classe do Body e do Ícone
          setTimeout(() => {
            body.classList.toggle('light-mode');
            
            if (body.classList.contains('light-mode')) {
              localStorage.setItem('portfolioTheme', 'light');
              themeBtn.innerHTML = iconMoon;
            } else {
              localStorage.setItem('portfolioTheme', 'dark');
              themeBtn.innerHTML = iconSun;
            }

            // Atualiza os modais da sessão Undertale se precisarem recalcular cores
            if(window.writeUndertaleText) writeUndertaleText();

            // Aguarda o final do pico (mais 250ms) para remover a tela do glitch
            setTimeout(() => {
              glitchOverlay.classList.remove('ativar-glitch');
            }, 250);

          }, 200);
        } else {
          // Fallback caso o overlay não exista na DOM
          body.classList.toggle('light-mode');
          if (body.classList.contains('light-mode')) {
            localStorage.setItem('portfolioTheme', 'light');
            themeBtn.innerHTML = iconMoon;
          } else {
            localStorage.setItem('portfolioTheme', 'dark');
            themeBtn.innerHTML = iconSun;
          }
        }
      });
    }

    // --------------------------------------------------------
    // 6. FAQ Accordion Logic
    // --------------------------------------------------------
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const item = question.parentNode;
        const answer = item.querySelector('.faq-answer-wrapper');
        const isActive = item.classList.contains('active');

        // Fecha outros abertos (opcional, mas garante um visual limpo)
        document.querySelectorAll('.faq-item').forEach(otherItem => {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-answer-wrapper').style.maxHeight = null;
          otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Se este estava fechado, abre.
        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + "px";
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // --------------------------------------------------------
    // 7. Copy Email Toast Logic
    // --------------------------------------------------------
    const btnCopiarEmail = document.getElementById('btn-copiar-email');
    const toastNotificacao = document.getElementById('toast-notificacao');

    if (btnCopiarEmail) {
      const conteudoOriginalBtn = btnCopiarEmail.innerHTML;

      btnCopiarEmail.addEventListener('click', (e) => {
        e.preventDefault(); // Prevenção: Impede o mailto padrão de abrir
        
        const emailCopy = 'leosouza5555@gmail.com';
        
        const dispararFeedback = () => {
          // Feedback Tátil Se disponível
          if (navigator.vibrate) { navigator.vibrate(50); }

          // Feedback Visual: Atualiza botão
          btnCopiarEmail.innerHTML = '✨ E-mail copiado!';
          btnCopiarEmail.style.background = '#00a0b3'; // Transição de cor

          // Opcional: Atualiza o Toast também
          if (toastNotificacao) {
            toastNotificacao.innerHTML = '✨ E-mail copiado!';
            toastNotificacao.classList.remove('toast-escondido');
            toastNotificacao.classList.add('toast-visivel');
          }

          // Restaura após 3 segundos
          setTimeout(() => {
            btnCopiarEmail.innerHTML = conteudoOriginalBtn;
            btnCopiarEmail.style.background = ''; // Volta pro CSS padrão
            if (toastNotificacao) {
              toastNotificacao.classList.remove('toast-visivel');
              toastNotificacao.classList.add('toast-escondido');
            }
          }, 3000);
        };

        // Lógica de Cópia
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(emailCopy)
            .then(dispararFeedback)
            .catch(err => console.error('Erro ao copiar usando API Tátil', err));
        } else {
          // Fallback Clássico para iframes legados
          const textArea = document.createElement("textarea");
          textArea.value = emailCopy;
          textArea.style.position = "fixed";
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            dispararFeedback();
          } catch (err) {}
          textArea.remove();
        }
      });
    }

    // --------------------------------------------------------
    // 8. Animated Counters Logic
    // --------------------------------------------------------
    const contadores = document.querySelectorAll('.contador');

    if (contadores.length > 0) {
      const observarContadores = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const alvo = parseInt(el.getAttribute('data-alvo'), 10);
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
              const barra = container.querySelector('.tech-bar');
              if (barra) {
                const larguraFinal = barra.getAttribute('data-alvo-largura');
                // Adicionamos um pequeno delay (setTimeout) para dar um charme visual a mais (staggering)
                setTimeout(() => {
                  barra.style.width = larguraFinal + '%';
                }, 100);
              }
            }

            // Parar de observar após engatilhar a animação
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.5
      });

      contadores.forEach(contador => {
        observarContadores.observe(contador);
      });
    }

    // --------------------------------------------------------
    // 9. GitHub API Integration (Com Cache Inteligente)
    // --------------------------------------------------------
    async function buscarDadosGitHub() {
      const cacheKey = 'githubDataCache';
      const cacheTimestampKey = 'githubDataTimestamp';
      const cacheDuration = 3600000; // 1 hora em milissegundos
      const now = Date.now();

      const cachedData = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(cacheTimestampKey);

      if (cachedData && cachedTimestamp && (now - cachedTimestamp < cacheDuration)) {
        // Usa dados do cache se ainda estiverem válidos
        try {
          const data = JSON.parse(cachedData);
          document.getElementById('gh-repos').innerText = data.public_repos;
          document.getElementById('gh-followers').innerText = data.followers;
          return; // Para a execução, evitando o fetch
        } catch (e) {
          console.warn("Erro ao ler cache do Github", e);
        }
      }

      try {
        const response = await fetch('https://api.github.com/users/mrleorobot');
        if (!response.ok) throw new Error('Falha ao buscar dados do GitHub');
        
        const data = await response.json();
        
        document.getElementById('gh-repos').innerText = data.public_repos;
        document.getElementById('gh-followers').innerText = data.followers;

        // Salva os dados e recria o timestamp no localStorage
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(cacheTimestampKey, now.toString());

      } catch (error) {
        console.error("Erro na integração com GitHub:", error);
        
        // Em caso de offline/falha, se houver cache vencido, tenta exibir ele mesmo
        if (cachedData) {
          try {
            const data = JSON.parse(cachedData);
            document.getElementById('gh-repos').innerText = data.public_repos + ' (Offline)';
            document.getElementById('gh-followers').innerText = data.followers + ' (Offline)';
            return;
          } catch(e){}
        }

        document.getElementById('gh-repos').innerText = 'Indisponível';
        document.getElementById('gh-followers').innerText = 'Indisponível';
      }
    }
    
    buscarDadosGitHub();

    // --------------------------------------------------------
    // 10. Memory / Returning Visitor Greeting
    // --------------------------------------------------------
    const visitouAntes = localStorage.getItem('visitouLeo');
    const saudacaoEl = document.getElementById('saudacao-visitante');

    if (saudacaoEl) {
      if (visitouAntes === null) {
        // Primeira visita: grava no localStorage e mantém o HTML base
        localStorage.setItem('visitouLeo', 'sim');
      } else if (visitouAntes === 'sim') {
        // Visitante retornando: muda o texto sem emojis
        saudacaoEl.innerHTML = 'Bem-vindo de volta! Que bom te ver de novo.';
      }
    }

    // --------------------------------------------------------
    // 11. Availability Status Logic (Business Hours)
    // --------------------------------------------------------
    function verificarDisponibilidade() {
      const agora = new Date();
      const hora = agora.getHours();
      const diaDaSemana = agora.getDay(); // 0 = Domingo, 6 = Sábado
      
      const bolinhaElement = document.getElementById('bolinha-status');
      const textoElement = document.getElementById('texto-status');
      
      if (!bolinhaElement || !textoElement) return;

      // Horários Disponíveis:
      // - Segunda a Sexta (1 a 5): 08:00 às 17:59
      // - Sábado (6): 08:00 às 16:59
      const isDiaDeSemana = (diaDaSemana >= 1 && diaDaSemana <= 5 && hora >= 8 && hora < 18);
      const isSabado = (diaDaSemana === 6 && hora >= 8 && hora < 17);

      if (isDiaDeSemana || isSabado) {
        bolinhaElement.style.backgroundColor = '#00ff00';
        bolinhaElement.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.8)';
        textoElement.innerText = 'Online - Disponível para contato';
      } else {
        bolinhaElement.style.backgroundColor = '#ffb703';
        bolinhaElement.style.boxShadow = '0 0 10px rgba(255, 183, 3, 0.8)';
        textoElement.innerText = 'Offline - Recarregando as baterias';
      }
    }

    verificarDisponibilidade();
    setInterval(verificarDisponibilidade, 60000); // Atualiza a cada 1 minuto

    // --------------------------------------------------------
    // 12. Weather Widget (Open-Meteo API - No Key Required)
    // --------------------------------------------------------
    async function buscarClima() {
      const lat = '-5.79';
      const lon = '-35.21';
      const cidadeNome = 'Natal, RN';
      
      const iconeEl = document.getElementById('clima-icone');
      const textoEl = document.getElementById('clima-texto');
      
      if (!iconeEl || !textoEl) return;

      const svgSun = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
      const svgCloud = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>';
      const svgRain = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16" y1="13" x2="16" y2="21"></line><line x1="8" y1="13" x2="8" y2="21"></line><line x1="12" y1="15" x2="12" y2="23"></line><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path></svg>';
      const svgStorm = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><polyline points="13 11 9 17 15 17 11 23"></polyline></svg>';
      const svgSnow = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line><path d="M20 16l-4-4 4-4"></path><path d="M4 8l4 4-4 4"></path><path d="M16 4l-4 4-4-4"></path><path d="M8 20l4-4 4 4"></path></svg>';

      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao buscar clima');
        
        const data = await response.json();
        const temp = Math.round(data.current_weather.temperature);
        const code = data.current_weather.weathercode;
        
        let statusTexto = 'Limpo';
        let iconeSvg = svgSun;
        
        if (code === 0) {
          statusTexto = 'Céu Limpo';
          iconeSvg = svgSun;
        } else if ([1, 2, 3, 45, 48].includes(code)) {
          statusTexto = 'Nublado';
          iconeSvg = svgCloud;
        } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
          statusTexto = 'Chuva';
          iconeSvg = svgRain;
        } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
          statusTexto = 'Neve';
          iconeSvg = svgSnow;
        } else if ([95, 96, 99].includes(code)) {
          statusTexto = 'Tempestade';
          iconeSvg = svgStorm;
        }
        
        iconeEl.innerHTML = iconeSvg;
        textoEl.innerText = `${cidadeNome}: ${temp}°C, ${statusTexto}`;
      } catch (error) {
        console.warn('Erro ao carregar clima real:', error);
        iconeEl.innerHTML = svgCloud;
        textoEl.innerText = `${cidadeNome}: Clima Indisponível`;
      }
    }

    buscarClima();
    setInterval(buscarClima, 1800000); // 30 min

    // Back to top button logic
    const btnTopo = document.getElementById('btn-topo');
    if (btnTopo) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          btnTopo.classList.add('show');
        } else {
          btnTopo.classList.remove('show');
        }
      });
      btnTopo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Easter Egg: PokeAPI
    console.log("%cOlá, Tech Recruiter! Vi que você gosta de olhar os bastidores. Digite a palavra pixel no teclado para uma surpresa. 😉", "color: #00e5ff; font-size: 14px; font-weight: bold; background: #02040a; padding: 10px; border-radius: 5px;");
    
    let secretCode = 'pixel';
    let inputCode = '';
    
    window.addEventListener('keydown', (e) => {
      // Ignora teclas de controle puro para nao quebrar a string se nao for letra
      if (e.key.length === 1) {
        inputCode += e.key.toLowerCase();
        if (inputCode.length > secretCode.length) {
          inputCode = inputCode.substring(inputCode.length - secretCode.length);
        }
        if (inputCode === secretCode) {
          inputCode = ''; // reset
          activateEasterEgg();
        }
      }
    });

    async function activateEasterEgg() {
      try {
        const randomId = Math.floor(Math.random() * 151) + 1;
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        if (!response.ok) return;
        const data = await response.json();
        const spriteUrl = data.sprites && data.sprites.front_default;
        
        if (spriteUrl) {
          const img = document.createElement('img');
          img.src = spriteUrl;
          img.alt = `Pokémon surpresa`;
          img.style.position = 'fixed';
          img.style.bottom = '20px';
          img.style.left = '-100px';
          img.style.zIndex = '9999';
          img.style.width = '80px';
          img.style.height = '80px';
          img.style.imageRendering = 'pixelated';
          img.style.pointerEvents = 'none';
          img.style.transition = 'transform 6s linear';
          document.body.appendChild(img);
          
          // Trigger reflow
          void img.offsetWidth;
          
          // Animate
          img.style.transform = `translateX(${window.innerWidth + 200}px)`;
          
          // Remove after animation
          setTimeout(() => {
            img.remove();
          }, 6000);
        }
      } catch (err) {
        // Fail silently
      }
    }