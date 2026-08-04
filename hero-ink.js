// ============================================================
// hero-ink.js — Generative Ink-in-Water Hero Effect
// Architecture: OGL (WebGL) + GLSL Shader + GSAP + Lenis
// Author: Leonilson Souza Portfolio
// ============================================================

const VERTEX_SHADER = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uScroll;
uniform float uIntensity;

// ---- Simplex Noise 3D (Ashima Arts / Ian McEwan) ----
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                             + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                            dot(x12.zw,x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x  = 2.0 * fract(p * C.www) - 1.0;
    vec3 h  = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// ---- Fractal Brownian Motion ----
float fbm(vec2 p, float time) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
        value += amplitude * snoise(p * frequency + time * 0.08);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// ---- Domain Warping (creates the ink-dissolving look) ----
float domainWarp(vec2 p, float time) {
    vec2 q = vec2(
        fbm(p + vec2(0.0, 0.0), time),
        fbm(p + vec2(5.2, 1.3), time)
    );

    vec2 r = vec2(
        fbm(p + 4.0 * q + vec2(1.7, 9.2), time * 0.8),
        fbm(p + 4.0 * q + vec2(8.3, 2.8), time * 0.8)
    );

    return fbm(p + 3.5 * r, time * 0.6);
}

void main() {
    // Normalize coordinates keeping aspect ratio
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    // Scale for visual density
    p *= 2.5;

    // Slow time for organic movement
    float time = uTime * 0.15;

    // Mouse influence — subtle distortion near cursor
    vec2 mouseNorm = uMouse * vec2(aspect, 1.0);
    float mouseDist = length(p - mouseNorm);
    float mouseInfluence = smoothstep(1.2, 0.0, mouseDist) * 0.15;
    p += mouseInfluence * vec2(
        snoise(p + time * 0.5),
        snoise(p + time * 0.5 + 100.0)
    );

    // Core ink effect via domain warping
    float ink = domainWarp(p, time);

    // Map to black and white with contrast curve
    // This creates the ink-in-water look: dark tendrils on white/gray
    float v = ink * 0.5 + 0.5; // remap from [-1,1] to [0,1]

    // Contrast curve — push midtones toward extremes
    v = smoothstep(0.25, 0.75, v);

    // Invert: dark ink tendrils on dark background (matching the portfolio)
    v = 1.0 - v;

    // Subtle opacity based on scroll progress
    float scrollFade = 1.0 - smoothstep(0.0, 0.6, uScroll);

    // Apply global intensity (for intro fade-in)
    float alpha = v * uIntensity * scrollFade * 0.35; // Max opacity 35% for subtlety

    // Output: white ink forms on transparent background over black page
    gl_FragColor = vec4(vec3(1.0), alpha);
}
`;

// ============================================================
// Initialization
// ============================================================

export function initHeroInk() {
    const canvas = document.getElementById('hero-ink');
    if (!canvas) return null;

    // Check WebGL support
    const gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        antialias: false,
        preserveDrawingBuffer: false,
    });

    if (!gl) {
        console.warn('WebGL not supported — falling back to CSS gradient');
        canvas.style.display = 'none';
        document.querySelector('.hero-ink-fallback')?.classList.add('active');
        return null;
    }

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.display = 'none';
        document.querySelector('.hero-ink-fallback')?.classList.add('active');
        return null;
    }

    // ---- Device detection ----
    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2);
    const pixelScale = isMobile ? 0.5 : 1.0; // Half resolution on mobile

    // ---- Sizing ----
    function resize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = Math.floor(w * dpr * pixelScale);
        canvas.height = Math.floor(h * dpr * pixelScale);
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();

    // ---- Compile shader ----
    function compileShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }

    gl.useProgram(program);

    // ---- Fullscreen triangle (covers viewport with 1 triangle, more efficient than quad) ----
    const positions = new Float32Array([
        -1, -1,
         3, -1,
        -1,  3,
    ]);
    const uvs = new Float32Array([
        0, 0,
        2, 0,
        0, 2,
    ]);

    // Position buffer
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // UV buffer
    const uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    const uvLoc = gl.getAttribLocation(program, 'uv');
    gl.enableVertexAttribArray(uvLoc);
    gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

    // ---- Uniforms ----
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    const uScroll = gl.getUniformLocation(program, 'uScroll');
    const uIntensity = gl.getUniformLocation(program, 'uIntensity');

    // Initial values
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform2f(uMouse, 0.0, 0.0);
    gl.uniform1f(uScroll, 0.0);
    gl.uniform1f(uIntensity, 0.0); // Starts invisible, GSAP fades in

    // Enable blending for transparent background
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // ---- State ----
    let mouseX = 0, mouseY = 0;
    let smoothMouseX = 0, smoothMouseY = 0;
    let scrollProgress = 0;
    let intensity = 0;
    let isVisible = true;
    let animationId = null;
    let lastFrameTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    // ---- Mouse tracking ----
    function onMouseMove(e) {
        // Normalize to [-0.5, 0.5]
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = -((e.clientY / window.innerHeight) - 0.5); // Flip Y for GL
    }
    if (!isMobile) {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
    }

    // ---- Touch tracking (mobile) ----
    function onTouchMove(e) {
        if (e.touches.length > 0) {
            mouseX = (e.touches[0].clientX / window.innerWidth) - 0.5;
            mouseY = -((e.touches[0].clientY / window.innerHeight) - 0.5);
        }
    }
    if (isMobile) {
        canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    }

    // ---- Visibility observer (pause when out of viewport) ----
    const observer = new IntersectionObserver(
        ([entry]) => {
            isVisible = entry.isIntersecting;
            if (isVisible && !animationId) {
                lastFrameTime = performance.now();
                loop(lastFrameTime);
            }
        },
        { threshold: 0.05 }
    );
    observer.observe(canvas);

    // ---- Resize handler ----
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resize();
            gl.useProgram(program);
            gl.uniform2f(uResolution, canvas.width, canvas.height);
        }, 150);
    }, { passive: true });

    // ---- Render loop ----
    function loop(now) {
        if (!isVisible) {
            animationId = null;
            return;
        }

        animationId = requestAnimationFrame(loop);

        // Throttle FPS on mobile
        const delta = now - lastFrameTime;
        if (delta < frameInterval) return;
        lastFrameTime = now - (delta % frameInterval);

        // Smooth mouse interpolation
        smoothMouseX += (mouseX - smoothMouseX) * 0.05;
        smoothMouseY += (mouseY - smoothMouseY) * 0.05;

        // Update uniforms
        gl.useProgram(program);
        gl.uniform1f(uTime, now * 0.001); // seconds
        gl.uniform2f(uMouse, smoothMouseX, smoothMouseY);
        gl.uniform1f(uScroll, scrollProgress);
        gl.uniform1f(uIntensity, intensity);

        // Clear and draw
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // Start loop
    lastFrameTime = performance.now();
    loop(lastFrameTime);

    // ---- Public API for GSAP/Lenis integration ----
    return {
        setIntensity(v) { intensity = v; },
        setScroll(v)    { scrollProgress = v; },
        destroy() {
            if (animationId) cancelAnimationFrame(animationId);
            observer.disconnect();
            window.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('resize', resize);
            gl.deleteProgram(program);
            gl.deleteShader(vertShader);
            gl.deleteShader(fragShader);
            gl.deleteBuffer(posBuf);
            gl.deleteBuffer(uvBuf);
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) ext.loseContext();
        },
    };
}
