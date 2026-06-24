/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#f8f9fa',
          secondary: '#ffffff',
          tertiary: '#f3f4f5',
          elevated: '#edeeef',
          glass: 'rgba(255, 255, 255, 0.85)',
        },
        text: {
          primary: '#191c1d',
          secondary: '#3c4a42',
          tertiary: '#6c7a71',
          inverse: '#ffffff',
        },
        border: {
          DEFAULT: '#e5e7eb',
          subtle: 'rgba(0, 0, 0, 0.04)',
        },
        accent: {
          blue: '#565e74',
          green: '#10b981',
          red: '#ba1a1a',
          orange: '#a43a3a',
          yellow: '#ffcc00',
          purple: '#5c647a',
          pink: '#fc7c78',
        },
        semantic: {
          income: '#10b981',
          expense: '#ba1a1a',
          saving: '#006c49',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#191c1d',
        },
      },
      fontSize: {
        'headline-xl': ['36px', { lineHeight: 44, letterSpacing: -0.72 }],
        'headline-lg': ['24px', { lineHeight: 32, letterSpacing: -0.24 }],
        'headline-md': ['20px', { lineHeight: 28 }],
        'body-lg': ['18px', { lineHeight: 28 }],
        'body-md': ['16px', { lineHeight: 24 }],
        'label-md': ['14px', { lineHeight: 20, letterSpacing: 0.14 }],
        'label-sm': ['12px', { lineHeight: 16 }],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.04)',
        md: '0 4px 12px rgba(0, 0, 0, 0.06)',
        lg: '0 12px 40px rgba(0, 0, 0, 0.08)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}