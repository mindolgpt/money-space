# Style Guide

## Brand Identity

금융 관리 앱으로, 신뢰감과 안정감을 주는 디자인. Apple-inspired glass morphism 스타일, 그린/블루/레드 시맨틱 컬러 시스템.

## Color Palette

### Background

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `bg-primary` | `#f8f9fa` | `#0f1110` | Screen background |
| `bg-secondary` | `#ffffff` | `#1a1c1b` | Card surface |
| `bg-tertiary` | `#f3f4f5` | `#242726` | Input, pressed state |
| `bg-elevated` | `#edeeef` | `#2e3132` | Focused input |
| `bg-glass` | `rgba(255,255,255,0.85)` | `rgba(15,17,16,0.85)` | Glass card, nav bar |

### Text

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `text-primary` | `#191c1d` | `#e1e3e4` | Primary content |
| `text-secondary` | `#3c4a42` | `#bbcabf` | Secondary labels |
| `text-tertiary` | `#6c7a71` | `#6c7a71` | Placeholder, muted |
| `text-inverse` | `#ffffff` | `#191c1d` | Text on accent bg |

### Accent

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-green` | `#10b981` | Primary action, income |
| `accent-blue` | `#565e74` | Secondary accent |
| `accent-red` | `#ba1a1a` | Danger, expense |
| `accent-orange` | `#a43a3a` | Warning |
| `accent-yellow` | `#ffcc00` | Caution badge |
| `accent-purple` | `#5c647a` | Utility |
| `accent-pink` | `#fc7c78` | Highlight |

### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `semantic-income` | `#10b981` | Income amount, badge |
| `semantic-expense` | `#ba1a1a` | Expense amount, badge |
| `semantic-saving` | `#006c49` | Saving amount, badge |

### Border

| Token | Light | Dark |
|-------|-------|------|
| `border` | `#e5e7eb` | `#2e3132` |
| `border-subtle` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.05)` |

## Spacing

Consistent 16px padding system. All content padding: `16px` horizontal, vertical varies by context. Card padding: `20px`. Modal padding: `24px`.

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Small elements |
| `radius-md` | 8px | Buttons, inputs |
| `radius-lg` | 12px | Cards |
| `radius-xl` | 14px | Large cards |
| `radius-2xl` | 16px | FAB, modal top |
| `radius-3xl` | 20px | Glass cards |
| `radius-full` | 9999px | Pills, badges, circles |

## Shadows

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.04)` | `0 1px 3px rgba(0,0,0,0.2)` | Card default |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.06)` | `0 4px 12px rgba(0,0,0,0.25)` | Elevated card |
| `shadow-lg` | `0 12px 40px rgba(0,0,0,0.08)` | `0 12px 40px rgba(0,0,0,0.35)` | Modal |
| `shadow-glass` | `0 8px 32px rgba(0,0,0,0.06)` | `0 8px 32px rgba(0,0,0,0.3)` | Glass card |

## Glass Effect

```
background: var(--color-bg-glass);
backdrop-filter: blur(40px) saturate(180%);
border: 0.5px solid var(--color-border);
```

Used on: bottom tab bar, glass cards, modal sheets.

## Button Styles

| Variant | BG | Text | Active |
|---------|-----|------|--------|
| `primary` | `accent-green` | `text-inverse` | opacity 90% |
| `secondary` | `bg-tertiary` | `text-primary` | opacity 80% |
| `ghost` | transparent | `text-primary` | tint `bg-tertiary` |
| `danger` | `rgba(#ba1a1a, 0.15)` | `accent-red` | opacity 80% |
| `outline` | transparent + border | `text-primary` | tint `bg-tertiary` |

Sizes: `sm` (py-2 px-4), `md` (py-2.5 px-6), `lg` (py-3.5 px-8). All buttons have `TouchableOpacity activeOpacity: 0.7`.

## Pill / Chip

```
padding: 8px 16px;
border-radius: 9999px;
font-size: 13px;
font-weight: 500;
```

| State | BG | Text |
|-------|-----|------|
| Active | `accent-green` | white |
| Inactive | `bg-tertiary` | `text-secondary` |

## Toggle Switch

```
width: 51px, height: 31px, thumb: 27px diameter
transition: all 0.3s ease
active: background = accent-green, thumb offset: left 22px
```

## Badge

```
padding: 4px 10px;
border-radius: 9999px;
font-size: 12px;
font-weight: 500;
```

| Variant | BG | Text |
|---------|-----|------|
| green | `rgba(#10b981, 0.15)` | `accent-green` |
| red | `rgba(#ba1a1a, 0.15)` | `accent-red` |
| yellow | `rgba(#ffcc00, 0.15)` | `accent-yellow` |
| blue | `rgba(#565e74, 0.15)` | `accent-blue` |

## Entry Item

```
display: flex; align-items: center;
padding: 14px 20px;
border-bottom: 0.5px solid var(--color-border-subtle);
active: background = bg-tertiary
```

## Icons

All icons from `lucide-react-native` ^1.21. Icon map: `src/shared/ui/icons/index.ts` (157 icons). Usage via `ICON_MAP[name]` or direct lucide import.

## Animations

| Animation | Duration | Easing |
|-----------|----------|--------|
| fadeInUp | 0.5-0.6s | `cubic-bezier(0.16, 1, 0.3, 1)` |
| scaleIn | 0.4s | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Chart bar fill | 0.8-1.0s | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Button press | 0.2s | ease |
| Modal slide | 0.4s | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Toggle | 0.3s | ease |
| Progress bar | 0.8s | `cubic-bezier(0.16, 1, 0.3, 1)` |
