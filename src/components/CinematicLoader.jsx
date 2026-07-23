import { useEffect, useState } from 'react'

const CinematicLoader = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let counter = 0
    const interval = setInterval(() => {
      const increment = counter > 80 ? 1 : Math.floor(Math.random() * 3) + 1
      counter += increment
      setProgress(counter)

      if (counter >= 100) {
        counter = 100
        clearInterval(interval)
        setTimeout(() => {
          setIsLoading(false)
          document.body.classList.remove('loading-locked')
        }, 2000)
      }
    }, 70)

    document.body.classList.add('loading-locked')

    return () => {
      clearInterval(interval)
      document.body.classList.remove('loading-locked')
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Animated curtains */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-black" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-black" />

      {/* Loading Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl md:text-6xl font-black font-space-grotesk text-white mb-2">
          LEONILSON
        </h1>
        <p className="text-lg text-gray-400 mb-12">Portfolio</p>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white font-mono mt-4">{progress}%</p>
      </div>
    </div>
  )
}

export default CinematicLoader