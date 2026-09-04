// tailwind.config.js — tema black + pink
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Fraunces', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Token utama tema black + pink
        bp: {
          bg: '#0a0a0c',
          card: '#121217',
          cardSoft: '#17171f',
          border: '#262630',
          pink: '#f472b6',
          pinkBright: '#ec4899',
          pinkDeep: '#be185d',
          pinkGlow: 'rgba(236, 72, 153, 0.15)',
          text: '#f3f4f6',
          muted: '#9ca3af',
        },
        // Alias semantik yang dipakai komponen (dipetakan ke tema gelap)
        paper: '#0a0a0c',
        line: '#262630',
        ink: {
          DEFAULT: '#f3f4f6',
          light: '#c7c7d1',
          faint: '#8b8b99',
        },
        gold: {
          500: '#f9a8d4',
          600: '#f472b6',
        },
        brand: {
          50: '#fdf2f8',
          100: '#fbcfe8',
          200: '#f9a8d4',
          300: '#f472b6',
          400: '#ec4899',
          500: '#ec4899',
          600: '#ec4899',
          700: '#db2777',
          800: '#f472b6',
          900: '#f9a8d4',
        },
        // Skala abu-abu dibalik agar komponen lama tetap terbaca di latar hitam
        gray: {
          50: '#121217',
          100: '#1c1c24',
          200: '#262630',
          300: '#3a3a46',
          400: '#8b8b99',
          500: '#a1a1b0',
          600: '#c3c3ce',
          700: '#d8d8e0',
          800: '#ececf2',
          900: '#f5f5fa',
        },
        white: '#15151b',
      },
      boxShadow: {
        pink: '0 18px 45px -20px rgba(236, 72, 153, 0.55)',
      },
    },
  },
  plugins: [],
};
