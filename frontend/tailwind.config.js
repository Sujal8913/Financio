/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8faff',
        surface: '#ffffff',
        'surface-container': '#f0f4ff',
        primary: '#3b82f6',
        secondary: '#10b981',
        textPrimary: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'lg': '16px',
        'md': '8px',
      }
    },
  },
  plugins: [],
}
