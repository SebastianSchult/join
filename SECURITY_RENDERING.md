# Secure Rendering Strategy (XSS Prevention)

This project stores user-generated values (for example task title/description and contact data).  
To prevent stored XSS, follow these rules for all UI rendering:

1. Use `textContent` for dynamic text whenever possible.
2. If dynamic text must be inserted into template HTML strings, escape it with `escapeHtml(...)`.
3. Never insert raw user data into inline attributes (`onclick`, `id`, `style`, `href`).
4. For attribute contexts, use dedicated sanitizers from `js/helper.js`:
   - `toSafeInteger(...)` for IDs/handler parameters
   - `sanitizeCssColor(...)` for inline color styles
   - `sanitizeMailtoHref(...)` for email links
5. Keep HTML templates for trusted static markup only; treat all user-provided values as untrusted input.

## Regression check examples

Verify that payloads like these are rendered as text and do not execute:

- `<script>alert(1)</script>`
- `<img src=x onerror=alert(1)>`
- `" onmouseover="alert(1)`

If a new feature adds dynamic rendering, apply the same helper functions before output.
