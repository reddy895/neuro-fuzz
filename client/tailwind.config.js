/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#020204',
          gray: '#0a0a0c',
          green: '#00ff41',
          'green-glow': 'rgba(0, 255, 65, 0.3)',
          red: '#ff2d55',
          blue: '#007aff'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 65, 0.5)',
        'neon-strong': '0 0 20px rgba(0, 255, 65, 0.8)',
      }
    },
  },
  plugins: [],
}
