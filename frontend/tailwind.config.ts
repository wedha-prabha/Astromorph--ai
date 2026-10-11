import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        navy: {
          50: '#F0F5FA',
          100: '#DCE7F3',
          200: '#B9CFE6',
          300: '#8AADD3',
          400: '#5A87BC',
          500: '#37679E',
          600: '#274F80',
          700: '#1D3C64',
          800: '#142B48',
          900: '#0C1D33',
          950: '#071423',
        },
        primary: {
          50: '#EFFAF8',
          100: '#D7F2EC',
          200: '#AFE4DB',
          300: '#7ED0C4',
          400: '#4BB5A8',
          500: '#269C8E',
          600: '#158276',
          700: '#12695F',
          800: '#11544D',
          900: '#104640',
          DEFAULT: '#158276',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#0891B2',
          soft: '#ECFEFF',
        },
        background: '#F6F8FB',
        surface: '#FFFFFF',
        mutedfg: '#5B6B7F',
        line: '#E4EAF1',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(12,29,51,0.04), 0 4px 16px -2px rgba(12,29,51,0.06)',
        lift: '0 2px 4px rgba(12,29,51,0.05), 0 12px 32px -8px rgba(12,29,51,0.14)',
        ring: '0 0 0 3px rgba(21,130,118,0.15)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '-400px 0' },
          to: { backgroundPosition: '400px 0' },
        },
        'flow-dash': {
          to: { strokeDashoffset: '-28' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.82)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.35s ease both',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s linear infinite',
        'flow-dash': 'flow-dash 1s linear infinite',
        'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
        'spin-slow': 'spin-slow 2.4s linear infinite',
        float: 'float 5s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.32s cubic-bezier(0.22,1,0.36,1)',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [animate],
}

export default config
