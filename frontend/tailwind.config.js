/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        navy: {
          950: '#060B13',
          900: '#0B1120',
          850: '#0D1527',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        brand: {
          orange: '#F97316',
          orangeHover: '#EA580C',
          orangeLight: '#FFF7ED',
          orangeDark: '#C2410C',
        },
      },
    },
  },
  plugins: [],
}
