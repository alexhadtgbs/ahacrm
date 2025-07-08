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
        primary: {
          DEFAULT: '#008080',
          light: '#00A0A0',
          dark: '#006060',
        },
        secondary: {
          DEFAULT: '#D4EDDA',
          light: '#E8F5E8',
          dark: '#C3E6C3',
        },
        background: '#F8F9FA',
        surface: '#FFFFFF',
        text: {
          primary: '#212529',
          secondary: '#6C757D',
        },
        alert: {
          error: '#DC3545',
          warning: '#FFC107',
          success: '#28A745',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Nunito Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['22px', { lineHeight: '1.3', fontWeight: '700' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
} 