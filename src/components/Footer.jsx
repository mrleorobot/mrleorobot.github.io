const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-white/10 py-12 text-center text-gray-400 text-sm">
      <div className="max-w-6xl mx-auto px-[5%]">
        <p className="mb-2">
          © {currentYear} Leonilson Souza. Desenvolvedor Front-end & UX/UI Designer.
        </p>
        <p className="text-xs text-gray-600">
          Feito com React + Tailwind CSS + Vite 🚀
        </p>
      </div>
    </footer>
  )
}

export default Footer