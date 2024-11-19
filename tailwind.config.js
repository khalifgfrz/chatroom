/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: ["./src/**/*.jsx"],
  theme: {
    screens: {
      xxsm: "321px",
      xsm: "376px",
      tbt: "426px",
      sm: "641px",
      md: "769px",
      lg: "1025px",
      xl: "1281px",
      "2xl": "1441px",
      "4xl": "1537px",
      uw: "2041px",
    },
    extend: {},
  },
  plugins: [],
};

export default tailwindConfig;
