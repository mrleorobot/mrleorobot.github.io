/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        black: '#000000',
        'dark-bg': '#0a0a0a',
      },
      spacing: {
        'safe': 'max(1rem, env(safe-area-inset-left))',
      },
      animation: {
        'reveal': 'reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)', filter: 'blur(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      zIndex: {
        '1000': '1000',
        '9000': '9000',
        '9999': '9999',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
