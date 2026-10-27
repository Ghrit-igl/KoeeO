import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hud: {
          bg: '#030712',
          cyan: '#00f0ff',
          amber: '#ff6b00',
          green: '#00ff88',
          red: '#ff0044',
          text: '#e0f2ff',
          muted: '#5b8a9a',
          panel: 'rgba(0, 20, 40, 0.85)',
          grid: 'rgba(0, 240, 255, 0.06)',
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      animation: {
        flicker: 'flicker 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        scanline: 'scanline 8s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.97' },
          '25%': { opacity: '0.99' },
          '75%': { opacity: '0.98' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
