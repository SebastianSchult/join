# UI Tokens

This project now uses shared UI tokens from `assets/css/ui-tokens.css`.

## Breakpoints

Canonical responsive breakpoints:

- `--ui-bp-mobile-max: 801px`
- `--ui-bp-mobile-min: 802px`
- `--ui-bp-navigation-tablet-max: 950px`
- `--ui-bp-phone-max: 560px`
- `--ui-bp-content-narrow-max: 500px`
- `--ui-bp-board-columns-max: 1400px`

### JS usage

Use `getUiBreakpointValue(key)` from `script.js` for shared keys, and keep `getResponsiveBreakpointPx(...)` as low-level fallback helper.

Example:

```js
const mobileMax = getUiBreakpointValue("mobileMax");
if (window.innerWidth <= mobileMax) {
  // mobile behavior
}
```

### CSS usage

CSS custom properties cannot be used directly inside `@media` in this setup.
Use the canonical values above in media queries and keep them aligned with `ui-tokens.css`.

## Spacing scale

Shared spacing tokens:

- `--ui-space-0: 0`
- `--ui-space-xxs: 4px`
- `--ui-space-2xs: 6px`
- `--ui-space-xs: 8px`
- `--ui-space-sm: 10px`
- `--ui-space-sm-md: 12px`
- `--ui-space-md: 16px`
- `--ui-space-lg: 24px`
- `--ui-space-xl: 32px`
- `--ui-space-2xl: 40px`
- `--ui-space-3xl: 48px`
- `--ui-space-4xl: 64px`
- `--ui-space-5xl: 72px`
- `--ui-touch-target-min: 44px`

Layout helpers:

- `--ui-page-inline: 88px`
- `--ui-page-inline-mobile: 40px`
- `--ui-page-inline-phone: 24px`
- `--ui-content-gap-md: 15px`
- `--ui-content-gap-lg: 20px`

## Rule for future changes

1. Add/change token values in `assets/css/ui-tokens.css` first.
2. In JS, prefer `getUiBreakpointValue(...)` for named core breakpoints (or `getResponsiveBreakpointPx(...)` for low-level access).
3. In CSS, avoid introducing new ad-hoc spacing values when an existing token fits.
4. For mobile controls, keep interactive targets at or above `--ui-touch-target-min`.

## Guardrail

Run `npm run lint:ui-tokens` to validate:

- core breakpoint usage in CSS,
- JS breakpoint fallback alignment,
- tokenized spacing usage in key UI styles.
