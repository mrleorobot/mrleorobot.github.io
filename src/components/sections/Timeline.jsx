const Timeline = () => {
  const experiences = [
    {
      year: '2024 - Presente',
      title: 'Desenvolvedor Front-end Sênior',
      company: 'Freelancer',
      description: 'Desenvolvimento de aplicações React/Next.js com foco em performance e UX.',
    },
    {
      year: '2023 - 2024',
      title: 'Professor de Web Design',
      company: 'ETEP',
      description: 'Ministração de aulas de web design, HTML/CSS/JS para alunos de TI.',
    },
    {
      year: '2022 - 2023',
      title: 'Desenvolvedor Front-end Pleno',
      company: 'Startup de Saúde Digital',
      description: 'Desenvolvimento de plataforma de telemedicina com React e Node.js.',
    },
    {
      year: '2021 - 2022',
      title: 'Desenvolvedor Front-end Júnior',
      company: 'Agência Digital',
      description: 'Criação de websites e aplicações web com React e Vue.js.',
    },
  ]

  return (
    <section id="timeline" className="relative py-20 px-[5%] bg-black">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black font-space-grotesk text-white mb-4 text-center reveal-item">
          Experiência
        </h2>
        <p className="text-center text-gray-400 mb-12 reveal-item stagger-1">
          Minha jornada profissional até aqui
        </p>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white to-white/10" />

          {/* Timeline items */}
          <div className="space-y-8">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className={`relative pl-16 md:pl-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pr-8 md:ml-0' : 'md:pl-8 md:ml-1/2'} reveal-item ${idx % 2 === 0 ? 'stagger-1' : 'stagger-2'}`}
              >
                {/* Timeline dot */}
                <div className={`absolute left-0 md:left-1/2 top-2 w-8 h-8 -ml-4 rounded-full bg-black border-2 border-white flex items-center justify-center ${idx % 2 === 0 ? '' : 'md:ml-0'}`}>
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>

                {/* Content */}
                <div className="bg-white/3 border border-white/8 rounded-xl p-6 hover:bg-white/5 transition-all spotlight-card">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {exp.year}
                  </p>
                  <h3 className="text-lg font-bold font-space-grotesk text-white mb-1">
                    {exp.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">{exp.company}</p>
                  <p className="text-gray-300 text-sm">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Timeline