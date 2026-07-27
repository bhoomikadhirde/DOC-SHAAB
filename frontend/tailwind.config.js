/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          navy: '#0F1B2D',
          slate: '#1E2A3D',
          darkBorder: '#2A3B52',
          teal: '#2C7A7B',
          lightTeal: '#E6FFFA',
          blue: '#1D5F8A',
          bg: '#F7F9FB',
          card: '#FFFFFF',
          textDark: '#0D1726',
          textMuted: '#5A6A80',
          danger: '#E53E3E',
          warning: '#DD6B20',
          success: '#38A169'
        }
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      }
    },
  },
  plugins: [],
}
