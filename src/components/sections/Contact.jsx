import { Mail, Github, Linkedin, ExternalLink } from 'lucide-react'
import { useState } from 'react'

const Contact = () => {
  const [emailCopied, setEmailCopied] = useState(false)

  const socialLinks = [
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:leosouza5555@gmail.com',
      value: 'leosouza5555@gmail.com',
    },
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/mrleorobot',
      value: '@mrleorobot',
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: 'https://linkedin.com/in/leonilson',
      value: 'Leonilson Souza',
    },
  ]

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('leosouza5555@gmail.com')
    setEmailCopied(true)
    setTimeout(() => setEmailCopied(false), 2000)
  }

  return (
    <section id="cta-final" className="relative py-20 px-[5%] bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black font-space-grotesk text-white mb-4 reveal-item">
          Vamos Colaborar?
        </h2>

        <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto reveal-item stagger-1">
          Estou sempre disponível para novos projetos, consultoria e conversas sobre tecnologia.
          Entre em contato comigo e vamos criar algo incrível juntos!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {socialLinks.map((social, idx) => {
            const Icon = social.icon
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`bg-white/3 border border-white/10 rounded-2xl p-8 hover:bg-white/5 hover:border-white/20 transition-all group reveal-item ${idx % 3 === 0 ? 'stagger-1' : idx % 3 === 1 ? 'stagger-2' : 'stagger-3'} spotlight-card`}
              >
                <Icon className="w-8 h-8 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {social.label}
                </p>
                <p className="text-white font-bold font-mono text-sm">{social.value}</p>
              </a>
            )
          })}
        </div>

        {/* Direct Email Button */}
        <button
          onClick={handleCopyEmail}
          className="px-8 py-4 bg-white text-black font-bold uppercase tracking-wider rounded-lg hover:scale-105 transition-all mb-8 reveal-item stagger-2"
        >
          {emailCopied ? '✓ E-mail Copiado!' : '📋 Copiar E-mail'}
        </button>

        <p className="text-gray-400 text-sm reveal-item stagger-3">
          Respondo emails em até 24 horas. 🚀
        </p>
      </div>
    </section>
  )
}

export default Contact