// ============================================================
// hero-ink.js — "Nebula" (nebulosa cinematográfica cobrindo toda a hero)
//
// Camadas de rendering (todas source-over — sem formas escuras):
//   1. WISPS         — nuvens de mist nos cantos, extensão atmosférica
//   2. NEBULA BODY   — corpo principal da nebulosa (nuvem orgânica)
//   3. FILAMENTS     — filamentos finos irradiando do centro
//   4. CORE GLOW     — núcleo pulsante brilhante (star cluster feel)
//   5. STAR FIELD    — ~220 estrelas piscando distribuídas por toda hero
//   6. FLARED STARS  — 6 estrelas grandes com cross flare (astrofoto style)
//
// Compositing: canvas com `mix-blend-mode: screen` sobre fundo preto puro.
//   Cada pixel branco desenhado clareia o preto na proporção do alpha.
//   Zonas sem desenho ficam pretas naturalmente — criando os "vazios"
//   entre nuvens sem precisar de destination-out.
//
// Sprites pré-renderizados no init (custo zero por frame):
//   • nebulaBody, filaments, coreGlow, mistSprite
//
// Performance:
//   • 4 drawImage grandes + 5 pequenos + ~220 arcs + 6 flare stars por frame
//   • ~1.5ms num desktop moderno
//   • RAF pausa fora do hero e em abas ocultas
//   • DPR limitado a 1.5
//   • Mobile <769px: nem inicializa
// ============================================================
(function () {
  "use strict";

  var CFG = {
    DESKTOP_MIN: 769,
    MAX_DPR: 1.5,

    // Posição do núcleo da nebulosa
    NEBULA_CENTER_X: 0.62,
    NEBULA_CENTER_Y: 0.52,

    // Escalas de cada camada (fração de min(W,H))
    NEBULA_BODY_SCALE: 1.15,
    FILAMENTS_SCALE: 1.0,
    CORE_GLOW_SCALE: 0.42,

    // Splash / entrada
    NEBULA_APPEAR_MS: 2600,
    CORE_APPEAR_MS: 2200,
    CORE_APPEAR_DELAY: 400,
    FILAMENTS_APPEAR_MS: 2400,
    FILAMENTS_APPEAR_DELAY: 600,
    STARS_APPEAR_MS: 1400,

    // Movimento ambiente
    NEBULA_DRIFT: 12,
    NEBULA_ROTATION_SPEED: 0.008,
    FILAMENTS_ROTATION_SPEED: -0.006,
    BREATHE_AMPLITUDE: 0.03,
    CORE_PULSE_AMPLITUDE: 0.15,

    // Mouse
    MOUSE_INFLUENCE_POS: 20,
    MOUSE_EASE: 0.05,

    // Estrelas
    STAR_COUNT_DESKTOP: 240,
    STAR_COUNT_TABLET: 150,
    FLARED_STARS: 6,

    // Wisps (nuvens auxiliares nas bordas)
    // x/y = fração do canvas, s = fração de min(W,H), a = alpha
    WISPS: [
      { x: 0.12, y: 0.20, s: 0.34, a: 0.55, dx: 0.4, dy: 0.3 },
      { x: 0.08, y: 0.78, s: 0.30, a: 0.5,  dx: 0.5, dy: 0.4 },
      { x: 0.93, y: 0.18, s: 0.28, a: 0.55, dx: 0.35, dy: 0.5 },
      { x: 0.91, y: 0.86, s: 0.32, a: 0.5,  dx: 0.4, dy: 0.35 },
      { x: 0.45, y: 0.94, s: 0.30, a: 0.4,  dx: 0.5, dy: 0.3 },
      { x: 0.30, y: 0.10, s: 0.22, a: 0.35, dx: 0.6, dy: 0.5 },
    ],

    // Shooting stars — estrelas cadentes
    SHOOTING_STAR_MIN_INTERVAL: 2500,
    SHOOTING_STAR_MAX_INTERVAL: 6000,
    SHOOTING_STAR_MIN_DURATION: 1000,
    SHOOTING_STAR_MAX_DURATION: 1600,
    SHOOTING_STAR_FIRST_DELAY: 2000,   /* primeira cai só 2s depois do splash */

    // Distribuição de cores das estrelas (soma = 1)
    STAR_COLOR_WHITE: 0.72,      // 72% branco puro
    STAR_COLOR_COOL:  0.18,      // 18% branco-azulado sutil
    STAR_COLOR_WARM:  0.10,      // 10% branco-creme sutil

    REVEAL_START: 900,
  };

  /* ─── Estado ─── */
  var canvas, ctx, hero;
  var W = 0, H = 0;
  var rafId = null;
  var running = false;
  var startTime = 0;

  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  var nebulaBody = null;
  var filaments = null;
  var coreGlow = null;
  var mistSprite = null;

  var stars = [];
  var flaredStars = [];
  var shootingStars = [];
  var lastShootingStarTime = 0;
  var nextShootingStarDelay = 2000;   // primeira cai só 2s após splash

  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ─── Nebula body: corpo orgânico grande da nebulosa ─── */
  function createNebulaBody() {
    var size = 900;
    var c = document.createElement("canvas");
    c.width = size; c.height = size;
    var g = c.getContext("2d");
    var cx = size / 2, cy = size / 2;

    // Base amorfa: gradiente radial suave
    var base = g.createRadialGradient(cx, cy, size * 0.12, cx, cy, size * 0.48);
    base.addColorStop(0,   "rgba(255,255,255,0.14)");
    base.addColorStop(0.35, "rgba(255,255,255,0.09)");
    base.addColorStop(0.7,  "rgba(255,255,255,0.03)");
    base.addColorStop(1,    "rgba(255,255,255,0)");
    g.fillStyle = base;
    g.fillRect(0, 0, size, size);

    // Nós de gás densos no centro
    for (var i = 0; i < 6; i++) {
      var angle = Math.random() * Math.PI * 2;
      var dist = Math.pow(Math.random(), 1.5) * size * 0.13;
      var x = cx + Math.cos(angle) * dist;
      var y = cy + Math.sin(angle) * dist;
      var r = rand(size * 0.06, size * 0.14);
      var grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(255,255,255," + rand(0.20, 0.34).toFixed(3) + ")");
      grad.addColorStop(0.5, "rgba(255,255,255," + rand(0.08, 0.16).toFixed(3) + ")");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Nuvens médias formando o volume da nebulosa
    for (var i = 0; i < 30; i++) {
      var angle = Math.random() * Math.PI * 2;
      var dist = Math.pow(Math.random(), 0.7) * size * 0.34;
      var x = cx + Math.cos(angle) * dist;
      var y = cy + Math.sin(angle) * dist;
      var r = rand(size * 0.08, size * 0.20);
      var grad = g.createRadialGradient(x, y, 0, x, y, r);
      var a = rand(0.04, 0.11);
      grad.addColorStop(0, "rgba(255,255,255," + a.toFixed(3) + ")");
      grad.addColorStop(0.7, "rgba(255,255,255," + (a * 0.35).toFixed(3) + ")");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Tendências externas — extensões finas na borda
    for (var i = 0; i < 45; i++) {
      var angle = Math.random() * Math.PI * 2;
      var dist = size * 0.30 + Math.pow(Math.random(), 0.4) * size * 0.16;
      var x = cx + Math.cos(angle) * dist;
      var y = cy + Math.sin(angle) * dist;
      var r = rand(size * 0.03, size * 0.09);
      var grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(255,255,255," + rand(0.05, 0.12).toFixed(3) + ")");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    return c;
  }

  /* ─── Filamentos: curvas finas irradiando do centro ─── */
  function createFilaments() {
    var size = 800;
    var c = document.createElement("canvas");
    c.width = size; c.height = size;
    var g = c.getContext("2d");
    var cx = size / 2, cy = size / 2;

    var filamentCount = 10;
    for (var i = 0; i < filamentCount; i++) {
      var startAngle = (i / filamentCount) * Math.PI * 2 + rand(-0.35, 0.35);
      var length = rand(size * 0.25, size * 0.44);
      var segments = 32;
      var wobbleFreq = rand(0.03, 0.09);
      var currentAngle = startAngle;

      for (var s = 0; s < segments; s++) {
        var t = s / segments;
        currentAngle += (Math.random() - 0.5) * 0.09 +
                        Math.sin(s * wobbleFreq + i * 1.7) * 0.03;
        var d = t * length;
        var x = cx + Math.cos(currentAngle) * d;
        var y = cy + Math.sin(currentAngle) * d;
        // Filamento afina saindo do centro
        var r = (1 - t * 0.85) * rand(2.5, 5.5);
        // Brilho maior no meio do filamento
        var brightness = Math.sin(t * Math.PI) * 0.5 + 0.5;
        var alpha = brightness * rand(0.08, 0.16) * (1 - t * 0.4);
        var grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, "rgba(255,255,255," + alpha.toFixed(3) + ")");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }

    // Filamentos secundários mais finos (detalhe)
    for (var i = 0; i < 8; i++) {
      var startAngle = Math.random() * Math.PI * 2;
      var startDist = rand(size * 0.05, size * 0.15);
      var length = rand(size * 0.15, size * 0.30);
      var segments = 20;
      var currentAngle = startAngle;
      var sx = cx + Math.cos(startAngle) * startDist;
      var sy = cy + Math.sin(startAngle) * startDist;

      for (var s = 0; s < segments; s++) {
        var t = s / segments;
        currentAngle += (Math.random() - 0.5) * 0.15;
        var d = t * length;
        var x = sx + Math.cos(currentAngle) * d;
        var y = sy + Math.sin(currentAngle) * d;
        var r = (1 - t * 0.7) * rand(1.5, 3);
        var alpha = (1 - t * 0.6) * rand(0.04, 0.09);
        var grad = g.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, "rgba(255,255,255," + alpha.toFixed(3) + ")");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }

    return c;
  }

  /* ─── Núcleo pulsante brilhante ─── */
  function createCoreGlow() {
    var size = 400;
    var c = document.createElement("canvas");
    c.width = size; c.height = size;
    var g = c.getContext("2d");
    var cx = size / 2, cy = size / 2;

    // Halo externo (mais amplo, alpha baixo)
    var halo = g.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
    halo.addColorStop(0, "rgba(255,255,255,0.18)");
    halo.addColorStop(0.35, "rgba(255,255,255,0.08)");
    halo.addColorStop(0.7, "rgba(255,255,255,0.02)");
    halo.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = halo;
    g.fillRect(0, 0, size, size);

    // Halo médio
    var mid = g.createRadialGradient(cx, cy, 0, cx, cy, size * 0.22);
    mid.addColorStop(0, "rgba(255,255,255,0.28)");
    mid.addColorStop(0.6, "rgba(255,255,255,0.08)");
    mid.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = mid;
    g.fillRect(0, 0, size, size);

    // Núcleo intenso
    var core = g.createRadialGradient(cx, cy, 0, cx, cy, size * 0.09);
    core.addColorStop(0, "rgba(255,255,255,0.55)");
    core.addColorStop(0.5, "rgba(255,255,255,0.20)");
    core.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = core;
    g.fillRect(0, 0, size, size);

    return c;
  }

  /* ─── Sprite de mist para as wisps ─── */
  function createMistSprite() {
    var size = 700;
    var c = document.createElement("canvas");
    c.width = size; c.height = size;
    var g = c.getContext("2d");
    var cx = size / 2, cy = size / 2;

    var base = g.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
    base.addColorStop(0,    "rgba(255,255,255,0.22)");
    base.addColorStop(0.4,  "rgba(255,255,255,0.12)");
    base.addColorStop(0.75, "rgba(255,255,255,0.03)");
    base.addColorStop(1,    "rgba(255,255,255,0)");
    g.fillStyle = base;
    g.fillRect(0, 0, size, size);

    for (var i = 0; i < 30; i++) {
      var angle = Math.random() * Math.PI * 2;
      var dist = Math.pow(Math.random(), 0.7) * size * 0.4;
      var x = cx + Math.cos(angle) * dist;
      var y = cy + Math.sin(angle) * dist;
      var r = rand(size * 0.08, size * 0.20);
      var grad = g.createRadialGradient(x, y, 0, x, y, r);
      var a = rand(0.03, 0.08);
      grad.addColorStop(0, "rgba(255,255,255," + a.toFixed(3) + ")");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    return c;
  }

  /* ─── Star field regular ─── */
  function buildStars() {
    stars = [];
    var count = window.innerWidth < 1200 ?
      CFG.STAR_COUNT_TABLET : CFG.STAR_COUNT_DESKTOP;
    for (var i = 0; i < count; i++) {
      var sizePow = Math.pow(Math.random(), 2.5);
      var size = 0.4 + sizePow * 2.0;
      var baseAlpha = 0.18 + sizePow * 0.55;

      // Distribuição sutil de cor — mantém a cinematografia monocromática
      // mas com variação de temperatura como no céu real
      var colorRoll = Math.random();
      var color;
      if (colorRoll < CFG.STAR_COLOR_WHITE) {
        color = "rgba(255,255,255,";
      } else if (colorRoll < CFG.STAR_COLOR_WHITE + CFG.STAR_COLOR_COOL) {
        color = "rgba(214,228,255,";   // azul-branco (estrelas jovens/quentes)
      } else {
        color = "rgba(255,238,214,";   // âmbar-branco (estrelas mais frias)
      }

      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: size,
        baseAlpha: baseAlpha,
        color: color,
        twinkleSpeed: rand(0.4, 1.4),
        twinklePhase: Math.random() * Math.PI * 2,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: rand(0.03, 0.12),
        driftAmp: rand(1, 3),
        hasHalo: sizePow > 0.7,
      });
    }
  }

  /* ─── Cross-flared stars: pontos muito brilhantes com raios em cruz ─── */
  function buildFlaredStars() {
    flaredStars = [];
    // Distribuídos por toda a hero, evitando o centro exato do núcleo
    for (var i = 0; i < CFG.FLARED_STARS; i++) {
      // Posição pseudo-aleatória mas distribuída
      var attempt = 0, x, y, ok = false;
      while (!ok && attempt < 30) {
        x = Math.random() * W;
        y = Math.random() * H;
        // Evita o núcleo
        var ncx = W * CFG.NEBULA_CENTER_X;
        var ncy = H * CFG.NEBULA_CENTER_Y;
        var d = Math.sqrt((x - ncx) * (x - ncx) + (y - ncy) * (y - ncy));
        if (d > Math.min(W, H) * 0.25) ok = true;
        attempt++;
      }
      flaredStars.push({
        x: x, y: y,
        size: rand(1.4, 2.4),
        baseAlpha: rand(0.55, 0.85),
        flareAngle: rand(0, Math.PI / 4),
        pulseSpeed: rand(0.3, 0.7),
        pulsePhase: Math.random() * Math.PI * 2,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: rand(0.05, 0.10),
      });
    }
  }

  function drawFlaredStar(s, t, fadeAnim) {
    var pulse = 0.75 + 0.25 *
      Math.sin(t * s.pulseSpeed + s.pulsePhase);
    var alpha = s.baseAlpha * pulse * fadeAnim;
    if (alpha < 0.05) return;

    var dx = Math.sin(t * s.driftSpeed + s.driftPhase) * 2;
    var dy = Math.cos(t * s.driftSpeed * 0.7 + s.driftPhase) * 1.5;
    var mx = (mouse.x - 0.5) * 4;
    var my = (mouse.y - 0.5) * 3;
    var x = s.x + dx + mx;
    var y = s.y + dy + my;
    var size = s.size;

    // Halo grande
    var haloR = size * 8;
    var haloGrad = ctx.createRadialGradient(x, y, 0, x, y, haloR);
    haloGrad.addColorStop(0, "rgba(255,255,255," + (alpha * 0.35).toFixed(3) + ")");
    haloGrad.addColorStop(0.4, "rgba(255,255,255," + (alpha * 0.1).toFixed(3) + ")");
    haloGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = haloGrad;
    ctx.fillRect(x - haloR, y - haloR, haloR * 2, haloR * 2);

    // Cross flare (dois retângulos finos em cruz)
    var flareLen = size * 14;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(s.flareAngle);

    var flareGrad = ctx.createLinearGradient(-flareLen, 0, flareLen, 0);
    flareGrad.addColorStop(0, "rgba(255,255,255,0)");
    flareGrad.addColorStop(0.5, "rgba(255,255,255," + (alpha * 0.55).toFixed(3) + ")");
    flareGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = flareGrad;
    ctx.fillRect(-flareLen, -0.7, flareLen * 2, 1.4);

    ctx.rotate(Math.PI / 2);
    ctx.fillRect(-flareLen, -0.7, flareLen * 2, 1.4);

    ctx.restore();

    // Ponto brilhante central
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255," + alpha.toFixed(3) + ")";
    ctx.fill();
  }

  function drawStars(t, fadeAnim) {
    var mx = (mouse.x - 0.5) * 3;
    var my = (mouse.y - 0.5) * 2;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twinkle = 0.35 + 0.65 *
        (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinklePhase));
      var alpha = s.baseAlpha * twinkle * fadeAnim;
      if (alpha < 0.02) continue;
      var dx = Math.sin(t * s.driftSpeed + s.driftPhase) * s.driftAmp;
      var dy = Math.cos(t * s.driftSpeed * 0.7 + s.driftPhase) * s.driftAmp * 0.7;
      var x = s.x + dx + mx * s.driftAmp * 0.3;
      var y = s.y + dy + my * s.driftAmp * 0.3;

      if (s.hasHalo && alpha > 0.3) {
        var haloR = s.size * 3.5;
        var haloGrad = ctx.createRadialGradient(x, y, 0, x, y, haloR);
        haloGrad.addColorStop(0, s.color + (alpha * 0.32).toFixed(3) + ")");
        haloGrad.addColorStop(1, s.color + "0)");
        ctx.fillStyle = haloGrad;
        ctx.fillRect(x - haloR, y - haloR, haloR * 2, haloR * 2);
      }

      ctx.beginPath();
      ctx.arc(x, y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = s.color + alpha.toFixed(3) + ")";
      ctx.fill();
    }
  }

  function drawWisps(t, fadeAnim) {
    var wisps = CFG.WISPS;
    for (var i = 0; i < wisps.length; i++) {
      var w = wisps[i];
      var wx = W * w.x + Math.sin(t * w.dx * 0.4 + i) * 8;
      var wy = H * w.y + Math.cos(t * w.dy * 0.4 + i * 1.7) * 6;
      var wr = Math.min(W, H) * w.s;
      var breathe = 1 + Math.sin(t * 0.5 + i) * 0.04;
      ctx.globalAlpha = w.a * fadeAnim;
      ctx.drawImage(
        mistSprite,
        wx - wr * breathe, wy - wr * breathe,
        wr * 2 * breathe,  wr * 2 * breathe
      );
    }
    ctx.globalAlpha = 1;
  }

  /* ─── Estrelas cadentes ─── */
  function spawnShootingStar() {
    // Escolhe uma origem — geralmente vinda dos cantos superiores
    var fromTopLeft = Math.random() < 0.5;
    var startX, startY, angle;

    if (fromTopLeft) {
      // vem do canto sup-esq, viaja pra baixo-direita
      startX = -60 + Math.random() * (W * 0.4);
      startY = -30 + Math.random() * (H * 0.3);
      angle = Math.PI * 0.18 + Math.random() * Math.PI * 0.18;   // ~32°-64°
    } else {
      // vem do canto sup-dir, viaja pra baixo-esquerda
      startX = W * 0.6 + Math.random() * (W * 0.4);
      startY = -30 + Math.random() * (H * 0.3);
      angle = Math.PI * 0.62 + Math.random() * Math.PI * 0.18;   // ~112°-144°
    }

    var duration = rand(CFG.SHOOTING_STAR_MIN_DURATION, CFG.SHOOTING_STAR_MAX_DURATION);
    var distance = Math.sqrt(W * W + H * H) * (0.55 + Math.random() * 0.3);
    var speed = distance / duration;

    shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle: angle,
      life: 0,
      maxLife: duration,
      length: 90 + Math.random() * 90,        /* cauda mais longa: 90-180px (era 60-130px) */
      thickness: 1.3 + Math.random() * 0.5,   /* um pouco mais grossa */
    });
  }

  function updateShootingStars(elapsed) {
    // Spawn com intervalo variável (só depois do splash inicial)
    if (elapsed > CFG.SHOOTING_STAR_FIRST_DELAY && elapsed - lastShootingStarTime > nextShootingStarDelay) {
      spawnShootingStar();
      lastShootingStarTime = elapsed;
      nextShootingStarDelay = rand(
        CFG.SHOOTING_STAR_MIN_INTERVAL,
        CFG.SHOOTING_STAR_MAX_INTERVAL
      );
    }
  }

  function drawShootingStars(elapsed, lastElapsed) {
    var dt = elapsed - lastElapsed;
    for (var i = shootingStars.length - 1; i >= 0; i--) {
      var s = shootingStars[i];
      s.life += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // Remove se saiu da tela ou expirou
      if (s.life > s.maxLife ||
          s.x < -100 || s.x > W + 100 ||
          s.y > H + 100) {
        shootingStars.splice(i, 1);
        continue;
      }

      // Alpha: fade-in rápido + fade-out longo (envelope de brilho)
      var progress = s.life / s.maxLife;
      var alpha;
      if (progress < 0.15) {
        alpha = progress / 0.15;              // fade in
      } else if (progress > 0.7) {
        alpha = 1 - (progress - 0.7) / 0.3;   // fade out
      } else {
        alpha = 1;
      }
      alpha *= 0.9;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);

      // Cauda: gradient linear que fade pra transparente na ponta traseira
      var tailGrad = ctx.createLinearGradient(-s.length, 0, 5, 0);
      tailGrad.addColorStop(0,    "rgba(255,255,255,0)");
      tailGrad.addColorStop(0.5,  "rgba(255,255,255," + (alpha * 0.5).toFixed(3) + ")");
      tailGrad.addColorStop(0.95, "rgba(255,255,255," + alpha.toFixed(3) + ")");
      tailGrad.addColorStop(1,    "rgba(255,255,255," + alpha.toFixed(3) + ")");
      ctx.fillStyle = tailGrad;
      ctx.fillRect(-s.length, -s.thickness / 2, s.length + 5, s.thickness);

      // Cabeça brilhante — halo maior pra chamar atenção
      var headR = 3;
      var headGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, headR * 6);
      headGrad.addColorStop(0, "rgba(255,255,255," + alpha.toFixed(3) + ")");
      headGrad.addColorStop(0.3, "rgba(255,255,255," + (alpha * 0.5).toFixed(3) + ")");
      headGrad.addColorStop(0.6, "rgba(255,255,255," + (alpha * 0.15).toFixed(3) + ")");
      headGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = headGrad;
      ctx.fillRect(-headR * 6, -headR * 6, headR * 12, headR * 12);

      ctx.beginPath();
      ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + alpha.toFixed(3) + ")";
      ctx.fill();

      ctx.restore();
    }
  }

  /* ─── Render principal ─── */
  var _lastElapsed = 0;
  function draw(elapsed) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";

    // Spawn/update de estrelas cadentes ocasionais
    updateShootingStars(elapsed);

    // Fades independentes por camada (cinematográfico)
    var nebulaFade = easeOut(Math.min(elapsed / CFG.NEBULA_APPEAR_MS, 1), 3);
    var coreFade   = easeOut(Math.max(0,
      Math.min((elapsed - CFG.CORE_APPEAR_DELAY) / CFG.CORE_APPEAR_MS, 1)), 3);
    var filamentsFade = easeOut(Math.max(0,
      Math.min((elapsed - CFG.FILAMENTS_APPEAR_DELAY) / CFG.FILAMENTS_APPEAR_MS, 1)), 3);
    var starsFade  = easeOut(Math.min(elapsed / CFG.STARS_APPEAR_MS, 1), 2);

    mouse.x += (mouse.tx - mouse.x) * CFG.MOUSE_EASE;
    mouse.y += (mouse.ty - mouse.y) * CFG.MOUSE_EASE;

    var t = elapsed * 0.001;
    var cx = W * CFG.NEBULA_CENTER_X;
    var cy = H * CFG.NEBULA_CENTER_Y;

    var driftX = Math.sin(t * 0.32) * CFG.NEBULA_DRIFT +
                 (mouse.x - 0.5) * CFG.MOUSE_INFLUENCE_POS;
    var driftY = Math.cos(t * 0.24) * (CFG.NEBULA_DRIFT * 0.6) +
                 (mouse.y - 0.5) * (CFG.MOUSE_INFLUENCE_POS * 0.6);

    var breathe = 1 + Math.sin(t * 0.8) * CFG.BREATHE_AMPLITUDE;
    var minWH = Math.min(W, H);

    // ─── 1. WISPS ───
    drawWisps(t, nebulaFade * 0.9);

    // ─── 2. NEBULA BODY (com drift + breathing + rotação sutil) ───
    var bodySize = minWH * CFG.NEBULA_BODY_SCALE;
    var bodyGrowth = 0.75 + nebulaFade * 0.25; // cresce durante a entrada
    var actualBodySize = bodySize * bodyGrowth * breathe;

    ctx.save();
    ctx.translate(cx + driftX, cy + driftY);
    ctx.rotate(t * CFG.NEBULA_ROTATION_SPEED);
    ctx.globalAlpha = nebulaFade;
    ctx.drawImage(
      nebulaBody,
      -actualBodySize / 2, -actualBodySize / 2,
      actualBodySize, actualBodySize
    );
    ctx.restore();

    // ─── 3. FILAMENTS (rotação oposta para efeito parallax) ───
    var filSize = minWH * CFG.FILAMENTS_SCALE;
    var filGrowth = 0.7 + filamentsFade * 0.3;
    var actualFilSize = filSize * filGrowth;

    ctx.save();
    ctx.translate(cx + driftX * 0.7, cy + driftY * 0.7);
    ctx.rotate(t * CFG.FILAMENTS_ROTATION_SPEED);
    ctx.globalAlpha = filamentsFade * 0.85;
    ctx.drawImage(
      filaments,
      -actualFilSize / 2, -actualFilSize / 2,
      actualFilSize, actualFilSize
    );
    ctx.restore();

    // ─── 4. CORE GLOW (pulsando) ───
    var corePulse = 1 + Math.sin(t * 1.3) * CFG.CORE_PULSE_AMPLITUDE;
    var coreSize = minWH * CFG.CORE_GLOW_SCALE * corePulse;
    ctx.globalAlpha = coreFade;
    ctx.drawImage(
      coreGlow,
      cx + driftX * 0.5 - coreSize / 2,
      cy + driftY * 0.5 - coreSize / 2,
      coreSize, coreSize
    );

    // ─── 5. STAR FIELD ───
    ctx.globalAlpha = 1;
    drawStars(t, starsFade);

    // ─── 6. FLARED STARS (astrofoto touch) ───
    for (var i = 0; i < flaredStars.length; i++) {
      drawFlaredStar(flaredStars[i], t, starsFade);
    }

    // ─── 7. SHOOTING STARS (cinematic streaks) ───
    drawShootingStars(elapsed, _lastElapsed);

    _lastElapsed = elapsed;
    ctx.globalAlpha = 1;
  }

  function easeOut(t, power) {
    return 1 - Math.pow(1 - t, power);
  }

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

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, CFG.MAX_DPR);
    var w = canvas.clientWidth || window.innerWidth;
    var h = canvas.clientHeight || window.innerHeight;
    if (w < 4) w = window.innerWidth;
    if (h < 4) h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    W = w; H = h;
  }

  function triggerReveal() {
    var items = hero ? hero.querySelectorAll(".ink-reveal") : [];

    // Espera o loader terminar (body perde .loading-locked) antes de revelar o hero.
    // Se o loader já saiu ou não existe, dispara imediatamente.
    function doReveal() {
      setTimeout(function () {
        items.forEach(function (el) {
          el.classList.add("ink-revealed");
        });
      }, CFG.REVEAL_START);
    }

    if (!document.body.classList.contains("loading-locked")) {
      // Loader já terminou ou não existe
      doReveal();
      return;
    }

    // Observa remoção da classe loading-locked no body
    var bodyObserver = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (!document.body.classList.contains("loading-locked")) {
          bodyObserver.disconnect();
          doReveal();
          return;
        }
      }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    // Segurança: se por algum motivo o observer não disparar em 7s, revela mesmo assim
    setTimeout(function () {
      bodyObserver.disconnect();
      if (!document.querySelector(".ink-revealed")) {
        doReveal();
      }
    }, 7000);
  }

  function onMouseMove(e) {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = e.clientY / window.innerHeight;
  }
  function onTouchMove(e) {
    if (!e.touches.length) return;
    mouse.tx = e.touches[0].clientX / window.innerWidth;
    mouse.ty = e.touches[0].clientY / window.innerHeight;
  }

  function init() {
    if (window.innerWidth < CFG.DESKTOP_MIN) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      triggerReveal();
      return;
    }

    canvas = document.getElementById("hero-ink-canvas");
    hero = document.getElementById("hero");
    if (!canvas || !hero) return;

    ctx = canvas.getContext("2d");
    if (!ctx) return;

    resize();

    // Sprites pré-renderizados (custo zero em runtime)
    nebulaBody = createNebulaBody();
    filaments = createFilaments();
    coreGlow = createCoreGlow();
    mistSprite = createMistSprite();
    buildStars();
    buildFlaredStars();

    var io = new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0 });
    io.observe(canvas);

    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });

    var resizeOb = window.ResizeObserver
      ? new ResizeObserver(function () {
          resize();
          buildStars();
          buildFlaredStars();
        })
      : null;
    if (resizeOb) resizeOb.observe(canvas);
    else window.addEventListener("resize", function () {
      resize();
      buildStars();
      buildFlaredStars();
    }, { passive: true });

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Nebulosa e reveal só iniciam depois do loader sair
    function beginHero() {
      triggerReveal();
      start();
    }

    if (!document.body.classList.contains("loading-locked")) {
      beginHero();
    } else {
      var startObserver = new MutationObserver(function () {
        if (!document.body.classList.contains("loading-locked")) {
          startObserver.disconnect();
          beginHero();
        }
      });
      startObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
      // Segurança
      setTimeout(function () {
        startObserver.disconnect();
        if (!running) beginHero();
      }, 7000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
