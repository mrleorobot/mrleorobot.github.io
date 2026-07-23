import { useEffect, useRef } from 'react'
import HeroCanvas from '../HeroCanvas'

const Hero = () => {
  const titleRef = useRef(null)

  useEffect(() => {
    if (titleRef.current) {
      const text = 'Criatividade\nem Código.'
      titleRef.current.textContent = ''
      let index = 0

      const type = () => {
        if (index < text.length) {
          if (text[index] === '\n') {
            const br = document.createElement('br')
            titleRef.current.appendChild(br)
          } else {
            titleRef.current.textContent += text[index]
          }
          index++
          const speed = Math.random() * 70 + 50
          setTimeout(type, speed)
        }
      }

      setTimeout(type, 300)
    }
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-40 pb-20 px-[5%] overflow-hidden"
    >
      {/* Background Canvas */}
      <HeroCanvas />

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center reveal-item">
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-black font-space-grotesk text-white mb-6 leading-tight break-words"
        >
          Criatividade em Código.
        </h1>

        <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto reveal-item stagger-1">
          Desenvolvedor Front-end Sênior, UX/UI Designer e especialista em Power BI.
          Transformando problemas complexos em interfaces excepcionais e acessíveis.
        </p>

        <div className="flex gap-4 justify-center flex-wrap reveal-item stagger-2">
          <a
            href="#projetos"
            className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-lg hover:scale-105 hover:shadow-lg transition-all"
          >
            Ver Portfólio
          </a>
          <a
            href="#cta-final"
            className="px-6 py-3 border border-white text-white font-bold uppercase tracking-wider rounded-lg hover:bg-white/10 transition-all"
          >
            Conversar
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero