import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'Qual é sua experiência com React e Next.js?',
      answer: 'Tenho mais de 5 anos de experiência com React e 3+ anos especializando em Next.js. Já desenvolvi mais de 50 projetos usando essas tecnologias, desde aplicações simples até sistemas complexos com SSR/SSG.',
    },
    {
      question: 'Você trabalha com acessibilidade (a11y)?',
      answer: 'Sim! Acessibilidade é prioridade em todos os meus projetos. Sigo as diretrizes WCAG 2.1, testo com leitores de tela e tenho experiência em design inclusivo para neurodiversidade.',
    },
    {
      question: 'Qual é seu processo de design?',
      answer: 'Começo com pesquisa de usuário, crio wireframes no Figma, prototipo com interações e testo com usuários reais. O design é iterativo e sempre focado em feedback.',
    },
    {
      question: 'Como você garante performance?',
      answer: 'Utilizo Lighthouse, Core Web Vitals e profiling contínuo. Implemento code splitting, lazy loading, otimização de imagens e caching estratégico.',
    },
    {
      question: 'Você faz freelance?',
      answer: 'Sim! Estou aberto a projetos freelance, desde pequenos websites até grandes aplicações. Entre em contato comigo para discutir seu projeto.',
    },
    {
      question: 'Qual é seu preço?',
      answer: 'Varia conforme escopo, complexidade e urgência do projeto. Ofereço consultoria inicial gratuita para entender melhor suas necessidades.',
    },
  ]

  return (
    <section id="faq" className="relative py-20 px-[5%] bg-black">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black font-space-grotesk text-white mb-4 text-center reveal-item">
          Perguntas Frequentes
        </h2>
        <p className="text-center text-gray-400 mb-12 reveal-item stagger-1">
          Dúvidas comuns sobre meu trabalho
        </p>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all reveal-item ${idx % 2 === 0 ? 'stagger-1' : 'stagger-2'}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-4 bg-white/3 hover:bg-white/5 transition-colors flex items-center justify-between group"
              >
                <span className="text-left font-bold text-white text-lg font-space-grotesk uppercase">
                  {faq.question}
                </span>
                <ChevronDown
                  size={24}
                  className={`text-white/50 transition-transform flex-shrink-0 ml-4 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === idx && (
                <div className="px-6 py-4 bg-white/2 border-t border-white/10 text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ