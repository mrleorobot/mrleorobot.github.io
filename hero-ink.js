// ============================================================
// hero-ink.js — Efeito de tinta se dissolvendo na água (Hero, web)
// Vanilla JS + WebGL puro (sem OGL/GSAP/Three.js — bundle leve, um
// único loop de animação, zero build step, publica igual ao resto
// do site).
//
// Só roda em telas >= 769px (desktop/tablet largo). No mobile o canvas
// nem chega a inicializar o contexto WebGL — zero custo de GPU lá.
// ============================================================
(function () {
  "use strict";

  var DESKTOP_BREAKPOINT = 769;

  function init() {
    var canvas = document.getElementById("hero-ink-canvas");
    if (!canvas) return;

    // Só web: se a tela for mobile, nem tenta — deixa o canvas vazio/oculto
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      return;
    }

    // Respeita quem pediu menos movimento no sistema
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    var gl =
      canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false }) ||
      canvas.getContext("experimental-webgl", { alpha: true });

    if (!gl) {
      // Sem WebGL: o canvas fica transparente e a seção usa só o fundo
      // sólido normal — sem fallback visual chamativo, é só um detalhe
      // extra que deixa de existir silenciosamente.
      return;
    }

    var vertexSrc = [
      "attribute vec2 aPosition;",
      "varying vec2 vUv;",
      "void main() {",
      "  vUv = aPosition * 0.5 + 0.5;",
      "  gl_Position = vec4(aPosition, 0.0, 1.0);",
      "}",
    ].join("\n");

    // Simplex noise 3D (Ashima Arts / Stefan Gustavson) + curl-noise pra
    // domain warping — dá o visual de fluido/tinta, não de ruído estático.
    var fragmentSrc = [
      "precision highp float;",
      "uniform float uTime;",
      "uniform vec2 uResolution;",
      "varying vec2 vUv;",

      "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}",
      "vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}",
      "vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}",
      "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}",

      "float snoise(vec3 v){",
      "  const vec2 C = vec2(1.0/6.0, 1.0/3.0);",
      "  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);",
      "  vec3 i  = floor(v + dot(v, C.yyy));",
      "  vec3 x0 = v - i + dot(i, C.xxx);",
      "  vec3 g = step(x0.yzx, x0.xyz);",
      "  vec3 l = 1.0 - g;",
      "  vec3 i1 = min(g.xyz, l.zxy);",
      "  vec3 i2 = max(g.xyz, l.zxy);",
      "  vec3 x1 = x0 - i1 + C.xxx;",
      "  vec3 x2 = x0 - i2 + C.yyy;",
      "  vec3 x3 = x0 - D.yyy;",
      "  i = mod289(i);",
      "  vec4 p = permute(permute(permute(",
      "    i.z + vec4(0.0, i1.z, i2.z, 1.0))",
      "    + i.y + vec4(0.0, i1.y, i2.y, 1.0))",
      "    + i.x + vec4(0.0, i1.x, i2.x, 1.0));",
      "  float n_ = 0.142857142857;",
      "  vec3 ns = n_ * D.wyz - D.xzx;",
      "  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);",
      "  vec4 x_ = floor(j * ns.z);",
      "  vec4 y_ = floor(j - 7.0 * x_);",
      "  vec4 x = x_ * ns.x + ns.yyyy;",
      "  vec4 y = y_ * ns.x + ns.yyyy;",
      "  vec4 h = 1.0 - abs(x) - abs(y);",
      "  vec4 b0 = vec4(x.xy, y.xy);",
      "  vec4 b1 = vec4(x.zw, y.zw);",
      "  vec4 s0 = floor(b0) * 2.0 + 1.0;",
      "  vec4 s1 = floor(b1) * 2.0 + 1.0;",
      "  vec4 sh = -step(h, vec4(0.0));",
      "  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;",
      "  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;",
      "  vec3 p0 = vec3(a0.xy, h.x);",
      "  vec3 p1 = vec3(a0.zw, h.y);",
      "  vec3 p2 = vec3(a1.xy, h.z);",
      "  vec3 p3 = vec3(a1.zw, h.w);",
      "  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));",
      "  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;",
      "  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);",
      "  m = m * m;",
      "  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));",
      "}",

      "vec2 curl(vec2 p, float t){",
      "  float eps = 0.06;",
      "  float n1 = snoise(vec3(p.x, p.y + eps, t));",
      "  float n2 = snoise(vec3(p.x, p.y - eps, t));",
      "  float n3 = snoise(vec3(p.x + eps, p.y, t));",
      "  float n4 = snoise(vec3(p.x - eps, p.y, t));",
      "  float dx = (n1 - n2) / (2.0 * eps);",
      "  float dy = (n3 - n4) / (2.0 * eps);",
      "  return vec2(dy, -dx);",
      "}",

      "void main(){",
      "  vec2 uv = vUv;",
      "  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);",
      "  vec2 p = (uv - 0.5) * aspect * 2.4;",

      "  float t = uTime * 0.01;",

      "  vec2 warp1 = curl(p * 0.45, t);",
      "  vec2 p2 = p + warp1 * 0.5;",
      "  vec2 warp2 = curl(p2 * 1.0 + 11.0, t * 1.1);",
      "  vec2 p3 = p2 + warp2 * 0.25;",

      "  float ink = snoise(vec3(p3 * 0.8, t * 0.5));",
      "  ink = smoothstep(-0.26, 0.56, ink);",

      "  float vign = 1.0 - smoothstep(0.4, 1.3, length(p));",
      "  ink *= mix(0.5, 1.0, vign);",

      "  vec3 color = vec3(1.0);",
      "  float alpha = ink * 1.0;",

      "  gl_FragColor = vec4(color, alpha);",
      "}",
    ].join("\n");

    function compileShader(type, src) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("hero-ink: erro ao compilar shader —", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    var vs = compileShader(gl.VERTEX_SHADER, vertexSrc);
    var fs = compileShader(gl.FRAGMENT_SHADER, fragmentSrc);
    if (!vs || !fs) return;

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("hero-ink: erro ao linkar programa —", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    var positions = new Float32Array([-1, -1, 3, -1, -1, 3]);
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    var aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    var uTime = gl.getUniformLocation(program, "uTime");
    var uResolution = gl.getUniformLocation(program, "uResolution");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      if (w < 2) w = window.innerWidth;
      if (h < 2) h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    var resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    var startTime = performance.now();
    var rafId = null;
    var isRunning = false;

    function render(now) {
      var elapsed = (now - startTime) / 1000;
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafId = requestAnimationFrame(render);
    }

    function start() {
      if (isRunning) return;
      isRunning = true;
      rafId = requestAnimationFrame(render);
    }

    function stop() {
      if (!isRunning) return;
      isRunning = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries[0].isIntersecting ? start() : stop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });

    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
