import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const navLinks = [
    { href: '#hero', label: 'Início' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#tech-stack', label: 'Habilidades' },
    { href: '#projetos', label: 'Portfólio' },
    { href: '#timeline', label: 'Experiência' },
    { href: '#faq', label: 'FAQ' },
    { href: '#depoimentos', label: 'Depoimentos' },
    { href: '#cta-final', label: 'Contato' },
  ]

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e, href) => {
    e.preventDefault()
    const id = href.substring(1)
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      })
    }
    setIsOpen(false)
  }

  const navBgOpacity = scrollY > 50 ? 'bg-black/95' : 'bg-black/50'

  return (
    <nav
      className={`fixed top-0 w-full px-[5%] py-4 flex justify-between items-center ${navBgOpacity} backdrop-blur-xl z-[1000] border-b border-white/8 transition-all duration-300`}
    >
      {/* Logo */}
      <a
        href="#hero"
        className="text-lg font-black tracking-wider font-space-grotesk text-white hover:text-gray-300 transition-colors hidden sm:block"
        aria-label="Voltar ao topo"
      >
        LEONILSON_
      </a>

      {/* Desktop Menu */}
      <div className="hidden lg:flex gap-1 items-center ml-auto">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className="text-xs font-semibold text-white/80 px-3 py-2 uppercase tracking-wider transition-all hover:text-white hover:bg-white/10 rounded-md"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* CV Button (Desktop) */}
      <a
        href="/curriculo.pdf"
        download="Leonilson_Souza_CV.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-gray-200 transition-all ml-4"
        aria-label="Baixar Currículo em PDF"
      >
        📄 CV
      </a>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 text-white hover:bg-white/10 rounded-md transition-colors"
        aria-label="Abrir menu de navegação"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/8 p-4 flex flex-col gap-2 lg:hidden max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors uppercase text-sm font-semibold"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/curriculo.pdf"
            download="Leonilson_Souza_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 bg-white text-black rounded-md uppercase text-sm font-bold text-center mt-2"
          >
            📄 Baixar CV
          </a>
        </div>
      )}
    </nav>
  )
}

export default Navigation