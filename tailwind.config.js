/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ventic: {
          accent: '#208B67',
          bg: '#F8F9FA',
          surface: '#FFFFFF',
          dark: {
            bg: '#1A1D21',
            surface: '#24282D',
          },
        },
      },
    },
  },
  plugins: [],
};
