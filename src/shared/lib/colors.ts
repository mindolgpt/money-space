export const colors = {
  accentGreen: '#10b981',
  accentBlue: '#565e74',
  accentRed: '#ba1a1a',
  accentOrange: '#a43a3a',
  accentYellow: '#ffcc00',
  accentPurple: '#5c647a',
  accentPink: '#fc7c78',

  textPrimary: '#191c1d',
  textSecondary: '#3c4a42',
  textTertiary: '#6c7a71',
  textInverse: '#ffffff',

  bgPrimary: '#f8f9fa',
  bgSecondary: '#ffffff',
  bgTertiary: '#f3f4f5',
  bgElevated: '#edeeef',

  borderDefault: '#e5e7eb',
  borderSubtle: 'rgba(0,0,0,0.04)',

  semanticIncome: '#10b981',
  semanticExpense: '#ba1a1a',
  semanticSaving: '#006c49',

  cardBg: '#ffffff',
  cardForeground: '#191c1d',

  tintColorLight: '#10b981',
  tintColorDark: '#10b981',

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const

export type ColorKey = keyof typeof colors
