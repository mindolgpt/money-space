# Typography

## Font Stack

```
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

- **Inter** — Primary font (Google Fonts)
- **System fonts** — Fallback (San Francisco on iOS, Roboto on Android)

## Type Scale

Defined in `tailwind.config.js` → `theme.extend.fontSize`:

| Token | Size | Line Height | Letter Spacing | Usage |
|-------|------|-------------|----------------|-------|
| `headline-xl` | 36px | 44px | -0.72px | Hero amount, large numbers |
| `headline-lg` | 24px | 32px | -0.24px | Screen titles |
| `headline-md` | 20px | 28px | 0 | Section headers |
| `body-lg` | 18px | 28px | 0 | Body emphasis |
| `body-md` | 16px | 24px | 0 | Default body |
| `label-md` | 14px | 20px | 0.14px | Labels, secondary info |
| `label-sm` | 12px | 16px | 0 | Caption, metadata |

All NativeWind utility classes also support Tailwind defaults (`text-xs` through `text-4xl`) as shorthand.

## Font Weight

| Weight | Class | Usage |
|--------|-------|-------|
| 400 (normal) | `font-normal` | Body, labels |
| 500 (medium) | `font-medium` | Emphasis |
| 600 (semibold) | `font-semibold` | Buttons, headers, amounts |
| 700 (bold) | `font-bold` | Strong emphasis |

## Typography Component

```tsx
<Typography variant="headline-lg" weight="semibold" color="primary">
  Title
</Typography>
```

### Color Options

| Color | Tailwind | Usage |
|-------|----------|-------|
| primary | `text-text-primary` | Main content |
| secondary | `text-text-secondary` | Sub-labels |
| tertiary | `text-text-tertiary` | Placeholder, muted |
| inverse | `text-text-inverse` | On accent bg |
| accent | `text-accent-green` | Green highlight |
| income | `text-semantic-income` | Income amount text |
| expense | `text-semantic-expense` | Expense amount text |
| saving | `text-semantic-saving` | Saving amount text |

## Amount Text

금액 표시는 `AmountText` 컴포넌트 사용:

```tsx
<AmountText amount={45000} type="income" />
```

- `income` → `semantic-income` (#10b981)
- `expense` → `semantic-expense` (#ba1a1a)
- `saving` → `semantic-saving` (#006c49)
- Prefix: `+` for income, `-` for expense/saving
- 3-digit comma formatting
- Font weight: 600 (semibold), letter-spacing: -0.5px
