export { getDb } from '@/shared/lib/db'
export { logger, createContextLogger } from '@/shared/lib/logger'
export { generateId } from '@/shared/lib/uuid'
export { colors } from '@/shared/lib/colors'
export type { ColorKey } from '@/shared/lib/colors'
export {
  ThemeProvider,
  useTheme,
  useThemeStore,
} from '@/shared/lib/theme-provider'
export type { ThemeMode } from '@/shared/lib/theme-provider'