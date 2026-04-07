/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#102033",
        brass: "#a97a2b",
        sand: "#efe6d6",
        paper: "#f8f4eb",
        wine: "#6a2435"
      },
      boxShadow: {
        panel: "0 20px 50px rgba(16, 32, 51, 0.08)"
      },
      fontFamily: {
        display: ["Spectral", "serif"],
        body: ["Manrope", "sans-serif"]
      }
    }
  },
  plugins: []
};
