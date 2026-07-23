import { ExternalLink } from 'lucide-react'

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: 'Dashboard de Gestão',
      description: 'Painel interativo com gráficos dinâmicos para visualização de dados de inventário com filtros em tempo real.',
      tech: ['Next.js', 'Tailwind CSS', 'Recharts', 'TypeScript'],
      category: 'Web Development',
      link: '#',
    },
    {
      id: 2,
      title: 'Refúgio Sereno',
      description: 'Gerenciador de tarefas gamificado para pessoas com TDAH, com interface acessível e feedback positivo.',
      tech: ['React', 'JavaScript', 'Tailwind CSS', 'LocalStorage'],
      category: 'UX/UI Design',
      link: '#',
    },
    {
      id: 3,
      title: 'Portal Corporativo',
      description: 'Interface administrativa para suporte técnico e gestão operacional com tabelas responsivas.',
      tech: ['React', 'Node.js', 'CSS Modules', 'REST API'],
      category: 'Full-stack',
      link: '#',
    },
    {
      id: 4,
      title: 'Tutor IA',
      description: 'Interface de chat conversacional com renderização em Markdown e respostas de streaming.',
      tech: ['Next.js', 'Gemini API', 'Tailwind CSS', 'React Hooks'],
      category: 'AI/ML',
      link: '#',
    },
    {
      id: 5,
      title: 'Design System ETEP',
      description: 'Biblioteca unificada de componentes reutilizáveis com documentação completa.',
      tech: ['TypeScript', 'Storybook', 'React', 'Figma'],
      category: 'Design System',
      link: '#',
    },
    {
      id: 6,
      title: 'Convite Digital',
      description: 'Convite interativo com RSVP, mapa de rotas e animações de constelações.',
      tech: ['React', 'Framer Motion', 'Tailwind CSS', 'Mapbox'],
      category: 'UX/UI Design',
      link: '#',
    },
  ]

  return (
    <section id="projetos" className="relative py-20 px-[5%] bg-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black font-space-grotesk text-white mb-4 text-center reveal-item">
          Portfólio
        </h2>
        <p className="text-center text-gray-400 mb-12 reveal-item stagger-1">
          Projetos que demonstram minha expertise em front-end e design
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <div
              key={project.id}
              className={`bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/8 transition-all group reveal-item spotlight-card ${idx % 3 === 0 ? 'stagger-1' : idx % 3 === 1 ? 'stagger-2' : 'stagger-3'}`}
            >
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {project.category}
                </span>
                <h3 className="text-lg md:text-xl font-bold font-space-grotesk text-white mt-2">
                  {project.title}
                </h3>
              </div>

              <p className="text-gray-400 text-sm mb-6 line-clamp-3 min-h-[72px]">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((t) => (
                  <span key={t} className="text-xs px-2.5 py-1 bg-white/10 text-gray-300 rounded-full font-mono">
                    {t}
                  </span>
                ))}
              </div>

              <a
                href={project.link}
                className="inline-flex items-center gap-2 text-white font-semibold text-sm hover:gap-3 transition-all group-hover:text-gray-300"
              >
                Ver Projeto
                <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects