/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fececa',
          300: '#fcaba5',
          400: '#f87c72',
          500: '#ef5344',
          600: '#dc3626',
          700: '#b92a1c',
          800: '#99261b',
          900: '#7f251d',
        },
        kitchen: {
          queue: '#fbbf24',     // Amarillo - En cola
          preparing: '#f97316', // Naranja - Preparando
          ready: '#22c55e',     // Verde - Listo
          urgent: '#ef4444',    // Rojo - Urgente
          dark: '#1e293b',      // Fondo oscuro
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-urgent': 'pulse-urgent 1s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'flash': 'flash 0.5s ease-in-out',
      },
      keyframes: {
        'pulse-urgent': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'flash': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};
