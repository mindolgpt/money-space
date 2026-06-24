# Design System

## Design Principles

1. **Clarity** — Content-first. Minimal chrome, maximum data density.
2. **Offline confidence** — Skeletons never shown. SQLite-first means instant UI.
3. **Glass aesthetic** — Apple-inspired translucency, blur, and layering.
4. **Semantic color** — Green = income, Red = expense, no ambiguity.

## Component Inventory

All components in `src/shared/ui/`. Usage via `@/shared/ui` barrel.

### Layout

| Component | File | Props |
|-----------|------|-------|
| Card | `Card.tsx` | `variant: 'solid' | 'glass'`, `className` |
| SectionHeader | `SectionHeader.tsx` | `title`, `action?: { label, onPress }` |
| TopAppBar | `TopAppBar.tsx` | `title`, `onBack?`, `action?` |

### Input

| Component | File | Props |
|-----------|------|-------|
| Input | `Input.tsx` | `label`, `error`, `multiline`, maxLength |
| Select | `Select.tsx` | `options: { label, value }[]`, `selected`, `onSelect` |
| Toggle | `Toggle.tsx` | `checked`, `onChange`, `label` |

### Display

| Component | File | Props |
|-----------|------|-------|
| Typography | `Typography.tsx` | `variant`, `weight`, `color` |
| AmountText | `AmountText.tsx` | `amount: number`, `type: income | expense | saving` |
| Badge | `Badge.tsx` | `variant: green | red | yellow | blue` |
| Chip | `Chip.tsx` | `label`, `selected`, `onPress` |
| CategoryPill | `CategoryPill.tsx` | `icon`, `name`, `selected` |
| IconCircle | `IconCircle.tsx` | `icon`, `color`, `size` |
| ProgressBar | `ProgressBar.tsx` | `progress: 0-100`, `color`, `animated` |
| EntryItem | `EntryItem.tsx` | `entry`, `onPress`, `onSwipe` |

### Navigation

| Component | File | Props |
|-----------|------|-------|
| TabBar | `TabBar.tsx` | `state`, `navigation` (custom bottom tab) |
| Icon | `Icon.tsx` | `icon: ReactNode`, `className` |

### Feedback

| Component | File | Props |
|-----------|------|-------|
| Button | `Button.tsx` | `variant`, `size`, `loading`, `icon`, `fullWidth` |
| ErrorBoundary | `ErrorBoundary.tsx` | `onError`, `fallback?` |

## Icon System

- Library: `lucide-react-native` ^1.21
- 157 named icons in `src/shared/ui/icons/index.ts`
- Usage: `import { ICON_MAP } from '@/shared/ui/icons'; ICON_MAP['home']`
- Or direct: `import { Home } from 'lucide-react-native'`
- Category icons use emoji (not lucide): `🍽️ 식비`, `🚗 교통` — stored as `icon` string field in categories table

## Theming

### Implementation

- `src/shared/lib/theme-provider.tsx` — zustand store + React context
- `src/global.css` — CSS custom properties for light/dark
- `tailwind.config.js` — maps CSS vars to Tailwind classes
- Dark mode via `.dark` class on `<html>`
- NativeWind `darkMode: 'class'`

### ThemeMode

```typescript
type ThemeMode = 'light' | 'dark'
```

Store: `useThemeStore` with `mode`, `isDark`, `toggleTheme()`, `setTheme()`.

### Theme Context

```tsx
// Access theme anywhere
const { mode, isDark } = useTheme()
const { mode, toggleTheme } = useThemeStore()
```

`useTheme()` reads from React context (for conditional rendering). `useThemeStore()` provides direct state access + actions.

## CSS Architecture

Layers in `src/global.css`:

| Layer | Content |
|-------|---------|
| `@layer base` | CSS custom properties (light + dark), global resets, body font |
| `@layer components` | .card, .card-glass, .btn, .input, .pill, .badge, .progress, .entry-item, .icon-circle, .toggle |
| `@layer utilities` | .animate-fade-in-up, .delay-\*, keyframes |

Tailwind classes should be preferred over raw CSS classes. CSS component classes are fallbacks for web preview.

## Utility

```tsx
import { cn } from '@/shared/lib/cn'

// Combines clsx + tailwind-merge (handles conflicting Tailwind classes)
cn('text-text-primary', isDark && 'text-text-inverse', className)
```

## References

- CSS variables: `src/global.css`
- Tailwind tokens: `tailwind.config.js`
- Color constants: `src/shared/lib/colors.ts`
- Component code: `src/shared/ui/`
- Design preview: `design-preview.html`, `design/design-*.html`
