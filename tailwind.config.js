/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mlb: {
          blue: '#041E42',
          red: '#BA0C2F',
        },
        nfl: {
          blue: '#013369',
          red: '#D50A0A',
        },
      },
    },
  },
  plugins: [],
}