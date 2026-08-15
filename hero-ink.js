// ============================================================
// hero-ink.js — "Tinta → Código → Interface"
//
// Fases:
//   1. SPLASH   — mancha de tinta aparece no centro e se espalha (0–1.6s)
//   2. REVEAL   — clip-path do conteúdo abre em cascata (1.0s–2.4s)
//   3. AMBIENT  — movimento muito sutil e contínuo enquanto hero visível
//
// Técnica: Canvas 2D puro, partículas de tinta com curl-noise JS,
//          sem WebGL/Three.js/GSAP. Zero dependências externas.
//
// Performance:
//   • DPR limitado a 1.5 (visual ok, menos pixels)
//   • RAF só quando hero está visível (IntersectionObserver)
//   • Para no prefers-reduced-motion (fallback estático imediato)
//   • No mobile (<769px) o canvas nem inicializa
// ============================================================
(function () {
  "use strict";

  /* ─── Config ─────────────────────────────────────────── */
  var CFG = {
    DESKTOP_MIN: 769,
    MAX_DPR: 1.5,

    // Splash
    SPLASH_PARTICLES: 420,       // quantas partículas geram a mancha
    SPLASH_DURATION: 1800,       // ms até a mancha parar de crescer
    SPLASH_RADIUS_FACTOR: 0.55,  // raio máximo como fração da metade menor do canvas

    // Cor da tinta — branco com transparência variável
    INK_COLOR_LIGHT: "rgba(255,255,255,",  // prefixo; alpha concatenado depois
    INK_ALPHA_MIN: 0.04,
    INK_ALPHA_MAX: 0.18,

    // Ambient
    AMBIENT_SPEED: 0.00006,      // muito lento
    AMBIENT_AMPLITUDE: 1.8,      // px de deslocamento máximo por frame
    NOISE_SCALE: 0.0018,         // granularidade do campo de fluxo

    // Mouse
    MOUSE_INFLUENCE: 0.22,       // quanto o mouse torce o campo (0–1)
    MOUSE_EASE: 0.06,            // suavização do mouse

    // Reveal cascata (CSS vai ler via evento/classe)
    REVEAL_START: 900,           // ms após init para começar reveal
    REVEAL_STAGGER: 180,         // ms entre cada elemento
  };

  /* ─── Estado global ────────────────────────────────── */
  var canvas, ctx, hero;
  var W = 0, H = 0;
  var rafId = null;
  var running = false;
  var startTime = 0;
  var phase = "splash"; // "splash" | "ambient"

  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }; // normalizado 0–1

  var particles = [];

  /* ─── Noise simples (Perlin 2D sem deps) ────────────── */
  // Implementação compacta de Perlin 2D (Ken Perlin, 1985)
  var perm = (function () {
    var p = [];
    for (var i = 0; i < 256; i++) p[i] = i;
    for (var i = 255; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    var out = [];
    for (var i = 0; i < 512; i++) out[i] = p[i & 255];
    return out;
  })();

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + t * (b - a); }
  function grad(h, x, y) {
    h = h & 3;
    var u = h < 2 ? x : y, v = h < 2 ? y : x;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  }
  function noise2(x, y) {
    var X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    var u = fade(x), v = fade(y);
    var a = perm[X] + Y, aa = perm[a], ab = perm[a + 1];
    var b = perm[X + 1] + Y, ba = perm[b], bb = perm[b + 1];
    return lerp(
      lerp(grad(perm[aa], x, y), grad(perm[ba], x - 1, y), u),
      lerp(grad(perm[ab], x, y - 1), grad(perm[bb], x - 1, y - 1), u),
      v
    );
  }

  // Curl-noise 2D: deriva perpendicular do gradiente de ruído → movimento fluido
  var CURL_EPS = 0.5;
  function curlNoise(x, y, t) {
    var n1 = noise2(x * CFG.NOISE_SCALE, y * CFG.NOISE_SCALE + t);
    var n2 = noise2(x * CFG.NOISE_SCALE + 100, y * CFG.NOISE_SCALE + t + 100);
    return {
      vx: (noise2(x * CFG.NOISE_SCALE, (y + CURL_EPS) * CFG.NOISE_SCALE + t) - n1) / CURL_EPS,
      vy: -(noise2((x + CURL_EPS) * CFG.NOISE_SCALE, y * CFG.NOISE_SCALE + t) - n2) / CURL_EPS
    };
  }

  /* ─── Partícula de tinta ──────────────────────────── */
  function Particle() {
    this.reset();
  }

  Particle.prototype.reset = function () {
    // Nasce próximo ao centro, com leve dispersão inicial
    var cx = W * 0.5, cy = H * 0.48;
    var angle = Math.random() * Math.PI * 2;
    var r = Math.random() * 8;
    this.x = cx + Math.cos(angle) * r;
    this.y = cy + Math.sin(angle) * r;

    // Velocidade radial inicial — impulsiona o splash para fora
    var speed = 0.8 + Math.random() * 2.2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.size = 1.2 + Math.random() * 3.2;
    this.alpha = CFG.INK_ALPHA_MIN + Math.random() * (CFG.INK_ALPHA_MAX - CFG.INK_ALPHA_MIN);
    this.life = 0; // 0→1 (normalizado pelo tempo)
    this.maxDist = (Math.min(W, H) * CFG.SPLASH_RADIUS_FACTOR) * (0.5 + Math.random() * 0.8);
    this.dist = 0;
    this.settled = false;

    // Offset de noise para variar entre partículas
    this.noiseOffset = Math.random() * 1000;
    this.noiseSpeed = 0.4 + Math.random() * 0.6; // velocidade individual no ambient
  };

  Particle.prototype.updateSplash = function (progress) {
    // progress: 0→1 durante a fase splash
    if (this.settled) return;

    // Desacelera à medida que o splash avança (easing out)
    var eased = 1 - Math.pow(1 - Math.min(progress * 1.2, 1), 3);
    var targetDist = this.maxDist * eased;

    var angle = Math.atan2(this.vy, this.vx);
    var curl = curlNoise(this.x, this.y, progress * 2 + this.noiseOffset);
    // Mistura direção radial com curl para forma orgânica
    var blend = 0.3 + progress * 0.4;
    this.vx = this.vx * (1 - blend) + curl.vx * blend;
    this.vy = this.vy * (1 - blend) + curl.vy * blend;

    // Normaliza e aplica velocidade decaindo
    var mag = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1;
    var speed = (2.5 - progress * 2.0) * (0.7 + Math.random() * 0.3);
    this.x += (this.vx / mag) * speed;
    this.y += (this.vy / mag) * speed;

    this.dist = Math.sqrt(
      Math.pow(this.x - W * 0.5, 2) + Math.pow(this.y - H * 0.48, 2)
    );

    if (this.dist >= this.maxDist * 0.92) {
      this.settled = true;
    }
  };

  Particle.prototype.updateAmbient = function (t) {
    var curl = curlNoise(
      this.x + this.noiseOffset * 50,
      this.y + this.noiseOffset * 50,
      t * this.noiseSpeed + this.noiseOffset
    );
    // Influência do mouse: torce levemente o campo
    var mx = (mouse.x - 0.5) * CFG.MOUSE_INFLUENCE;
    var my = (mouse.y - 0.5) * CFG.MOUSE_INFLUENCE;
    this.x += (curl.vx + mx) * CFG.AMBIENT_AMPLITUDE;
    this.y += (curl.vy + my) * CFG.AMBIENT_AMPLITUDE;

    // Mantém dentro de uma área relaxada ao redor do centro
    var cx = W * 0.5, cy = H * 0.48;
    var dx = this.x - cx, dy = this.y - cy;
    var d = Math.sqrt(dx * dx + dy * dy);
    var maxR = Math.min(W, H) * CFG.SPLASH_RADIUS_FACTOR * 1.05;
    if (d > maxR) {
      this.x -= dx * 0.015;
      this.y -= dy * 0.015;
    }
  };

  /* ─── Render ─────────────────────────────────────── */
  function draw(elapsed) {
    ctx.clearRect(0, 0, W, H);

    var t = elapsed * CFG.AMBIENT_SPEED * 1000; // tempo normalizado p/ noise

    if (phase === "splash") {
      var progress = Math.min(elapsed / CFG.SPLASH_DURATION, 1);

      // Fade-in global da tinta durante o splash
      var globalAlpha = Math.min(progress * 2.5, 1);

      particles.forEach(function (p) {
        p.updateSplash(progress);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = CFG.INK_COLOR_LIGHT + (p.alpha * globalAlpha).toFixed(3) + ")";
        ctx.fill();
      });

      if (progress >= 1) {
        phase = "ambient";
      }

    } else {
      // Ambient: mouse suavizado
      mouse.x += (mouse.tx - mouse.x) * CFG.MOUSE_EASE;
      mouse.y += (mouse.ty - mouse.y) * CFG.MOUSE_EASE;

      particles.forEach(function (p) {
        p.updateAmbient(t);
        // Alpha pulsa suavemente por partícula
        var breathe = 0.7 + 0.3 * Math.sin(t * 80 * p.noiseSpeed + p.noiseOffset);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = CFG.INK_COLOR_LIGHT + (p.alpha * breathe).toFixed(3) + ")";
        ctx.fill();
      });
    }
  }

  /* ─── Loop RAF ──────────────────────────────────── */
  function loop(now) {
    if (!running) return;
    var elapsed = now - startTime;
    draw(elapsed);
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    startTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  /* ─── Resize ─────────────────────────────────────── */
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, CFG.MAX_DPR);
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    if (w < 4) w = window.innerWidth;
    if (h < 4) h = window.innerHeight;
    W = Math.floor(w * dpr);
    H = Math.floor(h * dpr);
    canvas.width = W;
    canvas.height = H;
    ctx.scale(dpr, dpr);
    W = w; H = h; // trabalhar em coordenadas CSS após o scale
  }

  /* ─── Reveal do conteúdo (cascata CSS) ──────────── */
  function triggerReveal() {
    var items = hero ? hero.querySelectorAll(".ink-reveal") : [];
    items.forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add("ink-revealed");
      }, CFG.REVEAL_START + i * CFG.REVEAL_STAGGER);
    });
  }

  /* ─── Partículas iniciais ─────────────────────────  */
  function buildParticles() {
    particles = [];
    for (var i = 0; i < CFG.SPLASH_PARTICLES; i++) {
      particles.push(new Particle());
    }
  }

  /* ─── Interação mouse / touch ─────────────────── */
  function onMouseMove(e) {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = e.clientY / window.innerHeight;
  }

  function onTouchMove(e) {
    if (!e.touches.length) return;
    mouse.tx = e.touches[0].clientX / window.innerWidth;
    mouse.ty = e.touches[0].clientY / window.innerHeight;
  }

  /* ─── Init ───────────────────────────────────── */
  function init() {
    if (window.innerWidth < CFG.DESKTOP_MIN) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Fallback estático: revela o conteúdo imediatamente sem animação
      triggerReveal();
      return;
    }

    canvas = document.getElementById("hero-ink-canvas");
    hero = document.getElementById("hero");
    if (!canvas || !hero) return;

    ctx = canvas.getContext("2d");
    if (!ctx) return;

    resize();
    buildParticles();

    // Visibility: RAF só quando hero visível
    var io = new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 });
    io.observe(canvas);

    // Pausa quando aba oculta
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : (phase !== "splash" && start());
    });

    // Resize
    var resizeOb = window.ResizeObserver
      ? new ResizeObserver(function () {
          resize();
          buildParticles();
        })
      : null;
    if (resizeOb) resizeOb.observe(canvas);
    else window.addEventListener("resize", function () { resize(); buildParticles(); }, { passive: true });

    // Mouse
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Dispara reveal de conteúdo
    triggerReveal();

    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
