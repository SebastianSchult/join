# UI Tokens

This project now uses shared UI tokens from `assets/css/ui-tokens.css`.

## Breakpoints

Core runtime breakpoints:

- `--ui-bp-mobile-max: 801px`
- `--ui-bp-mobile-min: 802px`
- `--ui-bp-navigation-tablet-max: 950px`
- `--ui-bp-phone-max: 560px`
- `--ui-bp-content-narrow-max: 500px`
- `--ui-bp-board-columns-max: 1400px`

Approved CSS breakpoint set (v1):

- `--ui-bp-desktop-max: 1200px`
- `--ui-bp-summary-min: 1200px`
- `--ui-bp-summary-mid-min: 600px`
- `--ui-bp-summary-compact-max: 465px`
- `--ui-bp-contacts-large-max: 1124px`
- `--ui-bp-contacts-medium-max: 1010px`
- `--ui-bp-contacts-compact-max: 890px`
- `--ui-bp-contacts-overlay-max: 580px`
- `--ui-bp-contacts-button-max: 420px`
- `--ui-bp-contacts-tiny-max: 380px`
- `--ui-bp-addtask-layout-max: 1070px`
- `--ui-bp-auth-tablet-max: 970px`
- `--ui-bp-auth-mobile-max: 769px`
- `--ui-bp-auth-small-max: 680px`
- `--ui-bp-auth-phone-max: 550px`
- `--ui-bp-auth-compact-max: 480px`
- `--ui-bp-privacy-max: 900px`
- `--ui-bp-help-max: 700px`
- `--ui-bp-help-tiny-max: 360px`
- `--ui-bp-board-compact-max: 450px`
- `--ui-bp-board-small-max: 400px`
- `--ui-bp-board-tiny-max: 350px`

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

- all HTML-referenced stylesheets (including `@import`) use only `--ui-bp-*` token values,
- JS breakpoint fallback alignment,
- tokenized spacing usage in key UI styles.
