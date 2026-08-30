/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "stitch-green": "#00ff41",
        "stitch-green-dim": "#00e639",
        "stitch-cyan": "#00daf3",
        "stitch-cyan-light": "#00e3fd",
        "stitch-bg": "#131314",
        "stitch-surface": "#1c1b1c",
        "stitch-surface-high": "#2a2a2b",
        "stitch-outline": "#3b4b37",
        "stitch-outline-light": "#84967e",
        "stitch-text": "#e5e2e3",
        "stitch-text-muted": "#b9ccb2"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
