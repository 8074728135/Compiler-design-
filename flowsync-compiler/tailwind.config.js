/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#06b6d4', // cyan-500
          dark: '#0891b2',    // cyan-600
          glow: '#22d3ee',    // cyan-400
        },
      },
    },
  },
  plugins: [],
}
