(function initMotionSystem(){
"use strict";

// 1. Scroll-triggered (IntersectionObserver — leve)
const motionEls=document.querySelectorAll('.motion-on-scroll,.motion-img-reveal');
if(motionEls.length&&'IntersectionObserver' in window){
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target)}})
  },{threshold:0.08,rootMargin:'0px 0px -5% 0px'});
  motionEls.forEach(el=>obs.observe(el));
}

// 2. Stagger grids
const staggerGrids=document.querySelectorAll('.motion-stagger');
if(staggerGrids.length&&'IntersectionObserver' in window){
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target)}})
  },{threshold:0.05});
  staggerGrids.forEach(el=>obs.observe(el));
}

// 3. Nav scroll (passive — leve)
const nav=document.querySelector('.nav-motion');
if(nav){
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('is-scrolled',window.scrollY>60);
  },{passive:true});
}

// 4. Spotlight (só em desktop)
if(window.matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.motion-spotlight').forEach(el=>{
    el.addEventListener('mousemove',(e)=>{
      const rect=el.getBoundingClientRect();
      el.style.setProperty('--spotlight-x',(e.clientX-rect.left)+'px');
      el.style.setProperty('--spotlight-y',(e.clientY-rect.top)+'px');
    });
  });
}

// 5. Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',function(e){
    const t=document.querySelector(this.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'})}
  });
});

// 6. Botões magnéticos — só os 3 CTAs de destaque (hero, "Ver Todos", download CV),
// pra não diluir o efeito. Puxa sutilmente na direção do cursor quando perto.
if(window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  const MAGNETIC_STRENGTH = 0.35;
  const MAGNETIC_RADIUS = 80; // px de folga além do próprio botão pra já reagir

  document.querySelectorAll('.hero-editorial__cta, .projects-cta-all, .btn-cv').forEach(btn=>{
    let raf = null;
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

    function animate(){
      currentX += (targetX - currentX) * 0.2;
      currentY += (targetY - currentY) * 0.2;
      btn.style.transform = `translate(${currentX}px, ${currentY}px)`;
      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = null;
      }
    }

    function onMove(e){
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const reach = Math.max(rect.width, rect.height) / 2 + MAGNETIC_RADIUS;

      if (dist < reach) {
        targetX = dx * MAGNETIC_STRENGTH * (1 - dist / reach);
        targetY = dy * MAGNETIC_STRENGTH * (1 - dist / reach);
      } else {
        targetX = 0;
        targetY = 0;
      }
      if (!raf) raf = requestAnimationFrame(animate);
    }

    function onLeave(){
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', onMove, { passive: true });
    btn.addEventListener('mouseleave', onLeave);
  });
}

console.log('Motion System loaded');
})();
