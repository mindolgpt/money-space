/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
          glass: 'var(--color-bg-glass)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
        },
        accent: {
          blue: 'var(--color-accent-blue)',
          green: 'var(--color-accent-green)',
          red: 'var(--color-accent-red)',
          orange: 'var(--color-accent-orange)',
          yellow: 'var(--color-accent-yellow)',
          purple: 'var(--color-accent-purple)',
          pink: 'var(--color-accent-pink)',
        },
        semantic: {
          income: 'var(--color-income)',
          expense: 'var(--color-expense)',
          saving: 'var(--color-saving)',
        },
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
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
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glass: 'var(--shadow-glass)',
      },
    },
  },
  plugins: [],
}