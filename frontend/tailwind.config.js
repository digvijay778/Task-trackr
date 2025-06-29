// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          100: '#e2e5d9',
          200: '#c5ccb3',
          300: '#a8b28d',
          400: '#8b9967',
          500: '#6e7f41',
          600: '#586634',
          700: '#424c27',
          800: '#2c331a',
          900: '#16190d',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: 0, transform: 'translateY(10px)' },
          'to': { opacity: 1, transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}