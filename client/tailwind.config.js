/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // adjust depending on your project structure
  ],
  theme: {
    extend: {
        colors: {
      'coral-pink': '#FF6DA8',
    },
    },
  },
  plugins: [],
}
