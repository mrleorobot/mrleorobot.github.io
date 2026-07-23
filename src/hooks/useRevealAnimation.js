import { useEffect } from 'react'

/**
 * Hook para animar elementos com classe .reveal-item
 * Usa Intersection Observer para verificar quando estão visíveis
 */
export const useRevealAnimation = () => {
  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal-item')
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    revealItems.forEach((item) => observer.observe(item))

    // Immediate reveal for hero items
    const heroItems = document.querySelectorAll('#hero .reveal-item, #hero-intro .reveal-item')
    heroItems.forEach((item) => {
      setTimeout(() => item.classList.add('revealed'), 100)
    })

    return () => observer.disconnect()
  }, [])
}

/**
 * Hook para throttle/debounce de eventos
 */
export const useThrottledCallback = (callback, delay) => {
  const timeoutRef = useEffect()
  const lastCallRef = useEffect()

  return (...args) => {
    const now = Date.now()
    const lastCall = lastCallRef.current || 0

    if (now - lastCall >= delay) {
      lastCallRef.current = now
      callback(...args)
    }
  }
}

/**
 * Hook para detectar mouse position (para spotlight effect)
 */
export const useMousePosition = () => {
  const [mousePos, setMousePos] = useEffect({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return mousePos
}