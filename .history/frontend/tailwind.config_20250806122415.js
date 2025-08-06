/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // ← Agregar index.html
    "./src/**/*.{js,ts,jsx,tsx,html}", // ← Agregar más extensiones
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
