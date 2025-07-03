/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',       // 🔵 Bleu acier
          dark: '#1E3A8A',
        },
        neutral: {
          light: '#F3F4F6',         // ⚪ Blanc cassé
          dark: '#1F2937',          // ⚫ Gris anthracite
          darker: '#111827',
        },
        success: '#10B981',         // 🟢 Vert (machine UP)
        danger: '#EF4444',          // 🔴 Rouge doux (fallback)
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

