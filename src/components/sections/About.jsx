const About = () => {
  const features = [
    { title: '5+', description: 'Anos de experiência em Front-end' },
    { title: '50+', description: 'Projetos entregues com sucesso' },
    { title: '100%', description: 'Comprometimento com acessibilidade' },
  ]

  return (
    <section id="sobre" className="relative py-20 px-[5%] bg-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black font-space-grotesk text-white mb-4 text-center reveal-item">
          Sobre Mim
        </h2>
        <p className="text-center text-gray-400 mb-12 reveal-item stagger-1">Conheça minha história e trajetória</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/5 hover:border-white/15 transition-all reveal-item stagger-1 spotlight-card">
            <h3 className="text-2xl font-bold font-space-grotesk text-white mb-4">Quem Sou</h3>
            <p className="text-gray-300 leading-relaxed">
              Sou um desenvolvedor com paixão por criar experiências digitais fluidas e acessíveis.
              Especializo-me em React, Next.js e design inclusivo para neurodiversidade (TDAH).
              Cada pixel, cada interação, é pensada com o usuário em mente.
            </p>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/5 hover:border-white/15 transition-all reveal-item stagger-2 spotlight-card">
            <h3 className="text-2xl font-bold font-space-grotesk text-white mb-4">O Que Faço</h3>
            <p className="text-gray-300 leading-relaxed">
              Front-end Development, UX/UI Design e Analytics com Power BI.
              Transformo conceitos em soluções reais, sempre focando em performance,
              acessibilidade e experiência do usuário excepcional.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="text-center reveal-item stagger-3 bg-white/5 border border-white/8 rounded-xl p-6 hover:bg-white/10 transition-all"
            >
              <p className="text-3xl md:text-4xl font-black font-space-grotesk text-white mb-2">
                {feature.title}
              </p>
              <p className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About