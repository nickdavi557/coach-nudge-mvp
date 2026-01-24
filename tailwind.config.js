/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bain: {
          red: '#CC0000',
          darkRed: '#990000',
          gray: '#4A4A4A',
          lightGray: '#F5F5F5',
        }
      }
    },
  },
  plugins: [],
}
