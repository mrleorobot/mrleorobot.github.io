const Skills = () => {
  const skillCategories = [
    {
      title: 'Front-end',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite'],
    },
    {
      title: 'Design & UX',
      skills: ['Figma', 'UI/UX Design', 'Acessibilidade WCAG', 'Design Systems', 'Prototipagem'],
    },
    {
      title: 'Data & BI',
      skills: ['Power BI', 'DAX', 'SQL', 'Análise de Dados', 'Google Analytics'],
    },
    {
      title: 'Ferramentas',
      skills: ['Git/GitHub', 'Webpack', 'CI/CD', 'Testing', 'Performance'],
    },
  ]

  return (
    <section id="tech-stack" className="relative py-20 px-[5%] bg-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black font-space-grotesk text-white mb-4 text-center reveal-item">
          Habilidades & Tecnologias
        </h2>
        <p className="text-center text-gray-400 mb-12 reveal-item stagger-1">
          Tech stack moderno com foco em performance e UX
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((category, idx) => (
            <div
              key={category.title}
              className={`bg-white/3 border border-white/8 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/5 hover:border-white/15 transition-all reveal-item group spotlight-card ${idx % 2 === 0 ? 'stagger-1' : 'stagger-2'}`}
            >
              <h3 className="text-xl font-bold font-space-grotesk text-white mb-6 uppercase tracking-wider">
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-2 bg-white/10 text-white text-sm rounded-full font-semibold group-hover:bg-white/20 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills