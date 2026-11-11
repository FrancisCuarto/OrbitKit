/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Chivo', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        godot: {
          50: '#f0f7fc',
          100: '#e1eef8',
          200: '#c2def0',
          300: '#91c4e5',
          400: '#69a7d0',
          500: '#478cbf', // Official Godot Blue
          600: '#3571a0',
          700: '#2b5a81',
          800: '#274b6b',
          900: '#1b2a38',
          950: '#0b0f15', // Deep Dark Engine Lacquer
          card: '#111823', // Clean elevated dark surface
          cardHover: '#172230',
          border: '#1f2e40' // Crisp technical border
        }
      }
    },
  },
  plugins: [],
}
