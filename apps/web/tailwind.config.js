/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Archivo', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Archivo', 'Impact', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Light "game manual" surfaces
        paper: {
          DEFAULT: '#efe9dd',
          dim: '#e5ddcc',
          deep: '#d9cfba'
        },
        ink: {
          DEFAULT: '#15130f',
          soft: '#3b362e',
          mute: '#6b6357'
        },
        signal: {
          DEFAULT: '#ff4f1a', // Single loud accent (large text / blocks)
          dark: '#c2370c', // Accessible accent for small text on paper
          light: '#ff8a5c'
        },
        // Legacy token kept for dark panels (terminal, docs appendix):
        // remapped from Godot-blue to warm ink + signal accent.
        godot: {
          50: '#fff3ed',
          100: '#ffe2d4',
          200: '#ffc3a8',
          300: '#ff9a73',
          400: '#ff6a3d',
          500: '#ff4f1a',
          600: '#d93d0c',
          700: '#a8300b',
          800: '#4a2a1d',
          900: '#221d18',
          950: '#14120f',
          card: '#1c1915',
          cardHover: '#24201b',
          border: '#36302a'
        },
        // Warm neutrals instead of the cool blue-gray "slate"
        slate: {
          100: '#f5f2ec',
          200: '#e7e3dc',
          300: '#d4cfc6',
          400: '#a59e93',
          500: '#7a7368',
          600: '#57514a',
          700: '#3f3a34',
          800: '#2a2622',
          900: '#1c1916',
          950: '#14120f'
        }
      }
    },
  },
  plugins: [],
}
