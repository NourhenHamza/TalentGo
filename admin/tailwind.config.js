/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       colors: {
        'primary':"#15d2d8FF"
      },
      backgroundColor: ['group-hover'], // Enable group-hover for background colors
    },
  },
  plugins: [],
}