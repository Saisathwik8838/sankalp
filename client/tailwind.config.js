/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--sf)',
        primary: {
          DEFAULT: 'var(--pr)',
          dark: 'var(--pd)',
        },
        maroon: 'var(--tx)',
        muted: 'var(--mt)',
        completed: 'var(--ok)',
        clay: 'var(--ms)',
        line: 'var(--ln)',
      },
      fontFamily: {
        serif: ['"Noto Serif"', '"Tiro Devanagari Hindi"', 'Georgia', 'serif'],
        sans: ['Inter', '"Noto Sans"', 'system-ui', 'sans-serif'],
        devanagari: ['"Noto Serif Devanagari"', '"Tiro Devanagari Hindi"', 'serif'],
      },
      borderRadius: {
        'card': '16px',
        'sheet': '24px',
        'phone': '36px',
        'day': '12px',
        'diya': '12px 12px 50% 50%',
      },
      boxShadow: {
        'card': 'var(--sh)',
        'sheet': '0 -8px 30px rgba(0, 0, 0, 0.25)',
      },
      minHeight: {
        'touch': '44px',
        'button': '52px',
      },
      minWidth: {
        'touch': '44px',
      }
    },
  },
  plugins: [],
};
