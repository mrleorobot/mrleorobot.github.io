import { useEffect, useRef } from 'react'

const HeroCanvas = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId = null
    let particles = []
    let isVisible = true
    let introAlpha = 0

    const colors = ['#ffffff', '#e5e5e5', '#a3a3a3', '#525252']
    const particleCount = window.innerWidth < 768 ? 12 : 60
    const mouse = { x: null, y: null, radius: 100 }

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.baseX = this.x
        this.baseY = this.y
        this.vx = (Math.random() - 0.5) * 1.2
        this.vy = (Math.random() - 0.5) * 1.2
        this.size = Math.random() * 2 + 1
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.alpha = Math.random() * 0.5 + 0.2
        this.density = Math.random() * 30 + 1
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1

        if (mouse.x !== null) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const distSq = dx * dx + dy * dy
          const maxRadiusSq = mouse.radius * mouse.radius

          if (distSq < maxRadiusSq) {
            const distance = Math.sqrt(distSq)
            const forceDirectionX = dx / distance
            const forceDirectionY = dy / distance
            const force = (mouse.radius - distance) / mouse.radius
            const directionX = forceDirectionX * force * this.density
            const directionY = forceDirectionY * force * this.density
            this.x -= directionX
            this.y -= directionY
          }
        }
      }

      draw(alpha) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.alpha * alpha
        ctx.fill()
      }
    }

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth
      canvas.height = canvas.parentElement.offsetHeight
    }

    const drawLines = (alpha) => {
      if (window.innerWidth < 768) return
      const maxDist = 95
      const maxDistSq = maxDist * maxDist

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distSq = dx * dx + dy * dy

          if (distSq < maxDistSq) {
            const distance = Math.sqrt(distSq)
            const lineAlpha = (1 - distance / maxDist) * 0.12 * alpha
            ctx.beginPath()
            ctx.strokeStyle = p1.color
            ctx.globalAlpha = lineAlpha
            ctx.lineWidth = 0.5
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (introAlpha < 1) {
        introAlpha += 0.04
        if (introAlpha > 1) introAlpha = 1
      }

      particles.forEach((p) => {
        p.update()
        p.draw(introAlpha)
      })

      drawLines(introAlpha)
      animationId = requestAnimationFrame(animate)
    }

    // Mouse move
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const handleMouseOut = () => {
      mouse.x = null
      mouse.y = null
    }

    // Initialize
    resize()
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting
    })
    observer.observe(canvas.parentElement)

    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', handleMouseMove, { passive: true })
    canvas.addEventListener('mouseout', handleMouseOut)
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseout', handleMouseOut)
      observer.disconnect()
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      aria-hidden="true"
    />
  )
}

export default HeroCanvas