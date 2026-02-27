import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#08080D',
          card: 'rgba(255, 255, 255, 0.025)',
          'card-hover': 'rgba(255, 255, 255, 0.045)',
        },
        amber: {
          DEFAULT: '#E8A230',
          50: '#FFF8EB',
          100: '#FEECC7',
          200: '#FDD889',
          300: '#F5C04A',
          400: '#E8A230',
          500: '#D4891A',
          600: '#B86B10',
          700: '#964F10',
          800: '#7A3F14',
          900: '#663416',
        },
        blue: {
          DEFAULT: '#2563EB',
          deep: '#2563EB',
          400: '#60A5FA',
        },
        success: '#059669',
        alert: '#DC2626',
        text: {
          DEFAULT: '#E8E8ED',
          secondary: '#8A8A9A',
          muted: '#5A5A6A',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          hover: 'rgba(232, 162, 48, 0.15)',
          active: 'rgba(232, 162, 48, 0.3)',
        },
      },
      fontFamily: {
        serif: ['var(--font-instrument)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      boxShadow: {
        'deep': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glow-amber': '0 0 60px rgba(232, 162, 48, 0.04)',
        'glow-blue': '0 0 60px rgba(37, 99, 235, 0.04)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
