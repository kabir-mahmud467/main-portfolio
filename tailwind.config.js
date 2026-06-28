export default {
  darkMode: "class",
  content: ["./src/views/**/*.ejs", "./src/public/js/**/*.js"],
  theme: {
    extend: {
      colors: {
        ink: "#101419",
        paper: "#f7f5ef",
        line: "#d8d3c7",
        moss: "#556b4f",
        flame: "#c4532f",
        ocean: "#285f73"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 18px 55px rgba(16, 20, 25, 0.10)"
      }
    }
  },
  plugins: []
};
