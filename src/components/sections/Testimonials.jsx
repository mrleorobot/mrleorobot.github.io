import { Star } from 'lucide-react'

const Testimonials = () => {
  const testimonials = [
    {
      id: 'c1',
      name: 'Arthur Medeiros',
      type: 'aluno',
      role: 'Ex-Aluno de Web Design',
      text: 'O Professor Leo tem uma paciência incrível para explicar conceitos difíceis. Graças à sua didática, consegui entender a lógica por trás do código sem me sentir frustrado.',
      rating: 5,
      date: 'Dez/2025',
      avatar: 'AM',
    },
    {
      id: 'c2',
      name: 'Jennyfer',
      type: 'colega',
      role: 'Colega de Administração',
      text: 'Trabalhar com ele é ter a certeza de que os processos técnicos estarão sempre organizados e acessíveis. Ele consegue simplificar o uso de sistemas para qualquer pessoa da equipe.',
      rating: 5,
      date: 'Out/2025',
      avatar: 'JE',
    },
    {
      id: 'c3',
      name: 'Julio Nogueira',
      type: 'aluno',
      role: 'Ex-Aluno de Informática',
      text: 'As aulas de informática eram muito visuais e fáceis de acompanhar. Ele realmente se importa em garantir que o aluno não apenas decore, mas entenda a ferramenta.',
      rating: 5,
      date: 'Nov/2025',
      avatar: 'JN',
    },
  ]

  return (
    <section id="depoimentos" className="relative py-20 px-[5%] bg-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black font-space-grotesk text-white mb-4 text-center reveal-item">
          Depoimentos
        </h2>
        <p className="text-center text-gray-400 mb-12 reveal-item stagger-1">
          O que pessoas dizem sobre trabalhar comigo
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div
              key={testimonial.id}
              className={`relative bg-white/3 border border-white/8 rounded-2xl p-6 hover:bg-white/5 transition-all reveal-item spotlight-card ${idx % 3 === 0 ? 'stagger-1' : idx % 3 === 1 ? 'stagger-2' : 'stagger-3'}`}
            >
              {/* Quote mark */}
              <div className="absolute top-4 right-6 text-6xl text-white/5 font-serif pointer-events-none">
                "
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < testimonial.rating ? 'fill-white text-white' : 'text-white/20'}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-300 text-sm italic mb-4 min-h-[72px]">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-bold text-xs">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{testimonial.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials