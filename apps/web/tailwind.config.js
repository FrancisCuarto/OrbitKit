/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
          900: '#244059',
          950: '#0d141b', // Godot Dark Canvas
          card: '#15202b',
          cardHover: '#1c2b3a',
          border: '#233547'
        }
      }
    },
  },
  plugins: [],
}
