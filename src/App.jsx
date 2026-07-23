import { useEffect, useState } from 'react'
import Navigation from './components/Navigation'
import CinematicLoader from './components/CinematicLoader'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Projects from './components/sections/Projects'
import Timeline from './components/sections/Timeline'
import FAQ from './components/sections/FAQ'
import Testimonials from './components/sections/Testimonials'
import Contact from './components/sections/Contact'
import Footer from './components/Footer'
import { useRevealAnimation } from './hooks/useRevealAnimation'

function App() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    // Scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setScrollProgress(scrollPercent)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Initialize reveal animations
  useRevealAnimation()

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-white z-[9000] transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <CinematicLoader />
      <Navigation />
      
      <main className="w-full">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Timeline />
        <FAQ />
        <Testimonials />
        <Contact />
      </main>
      
      <Footer />
    </div>
  )
}

export default App