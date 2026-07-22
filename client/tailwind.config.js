/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1D36',
          50: '#E8EEF5',
          100: '#C5D3E4',
          200: '#8FA7C4',
          700: '#16355C',
          800: '#0F2947',
          900: '#0B1D36',
        },
        saffron: {
          DEFAULT: '#E07A3D',
          50: '#FDF3EC',
          100: '#F8E0D0',
          400: '#E8915C',
          500: '#E07A3D',
          600: '#C9652B',
        },
        sand: {
          DEFAULT: '#F7F4EF',
          100: '#FBFAF7',
          200: '#F0EBE3',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(11, 29, 54, 0.18)',
      },
    },
  },
  plugins: [],
};
