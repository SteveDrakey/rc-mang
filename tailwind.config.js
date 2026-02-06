export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#b9d7ff',
          300: '#8ebaff',
          400: '#5e94ff',
          500: '#3b6dff',
          600: '#2f52f5',
          700: '#263fca',
          800: '#24359f',
          900: '#1f2f7d'
        }
      }
    }
  },
  plugins: []
};
