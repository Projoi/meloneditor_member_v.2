/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        body: "#202326",
        sidebar: "#25282b",
        main: "#2d3236",
        primary: "#69bd46",
        second: "#ff9829"
      },
    },
  },
  plugins: [],
};
