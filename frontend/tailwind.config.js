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
        // Fresh & Natural Theme
        primary: {
          50: '#f4f7f5',
          100: '#e4ebe7',
          200: '#c9d7cf',
          300: '#a3bba9',
          400: '#7a9d84',
          500: '#6B8E7F', // Sage Green - main primary
          600: '#567366',
          700: '#465c53',
          800: '#3b4c45',
          900: '#33403b',
          950: '#1a2320',
        },
        secondary: {
          50: '#f5f7f4',
          100: '#e8ece6',
          200: '#d1d9cd',
          300: '#b1bfab',
          400: '#8FAF8B', // Olive - main secondary
          500: '#6f9169',
          600: '#587553',
          700: '#465d43',
          800: '#3a4c38',
          900: '#313f30',
          950: '#182118',
        },
        accent: {
          50: '#fdf6f3',
          100: '#fceae3',
          200: '#fad5c7',
          300: '#f5b69f',
          400: '#C97A5A', // Warm Terracotta - main accent
          500: '#c26a48',
          600: '#b4553a',
          700: '#964431',
          800: '#7b3a2d',
          900: '#66342a',
          950: '#371813',
        },
        background: '#F7F6F3', // Off-White
        charcoal: '#2E2E2E', // Text color
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
