# CSP Baseline

This project now ships a baseline Content Security Policy on all static HTML
entry pages using a `<meta http-equiv="Content-Security-Policy">` tag.

Covered entry pages:

- `index.html`
- `signUp.html`
- `summary.html`
- `board.html`
- `contacts.html`
- `addTask.html`
- `help.html`
- `privacy.html`
- `privacy_external.html`
- `legal_notice.html`
- `legal_notice_external.html`

## Baseline Policy

```text
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'self';
form-action 'self';
script-src 'self' https://cdnjs.cloudflare.com https://consent.cookiebot.com https://consentcdn.cookiebot.com;
style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self' https://remote-storage.developerakademie.org https://*.firebasedatabase.app https://*.firebaseio.com https://consent.cookiebot.com https://consentcdn.cookiebot.com;
frame-src 'self' https://consent.cookiebot.com https://consentcdn.cookiebot.com;
worker-src 'self' blob:;
```

## Why these sources are allowed

- `https://cdnjs.cloudflare.com`: Viewer.js assets used by board/add-task flow.
- `https://consent.cookiebot.com`, `https://consentcdn.cookiebot.com`: Cookiebot loader and related assets.
- `https://remote-storage.developerakademie.org`: remote storage backend.
- `https://*.firebasedatabase.app`, `https://*.firebaseio.com`: Firebase Realtime Database access.
- `data:` / `blob:` in `img-src` and `worker-src`: uploaded image previews and viewer/runtime object URLs.

## Rollout visibility

CSP violations are observable via:

1. Browser DevTools Console (`CSP violation: ...` warning logs).
2. Native browser CSP warnings/events.

The runtime registers a `securitypolicyviolation` listener in `script.js` to
surface blocked resources clearly during rollout.

## Migration path to stricter CSP

1. Move inline style attributes to CSS classes.
2. Remove `'unsafe-inline'` from `style-src`.
3. Serve CSP via response headers at hosting level (recommended) and add reporting endpoint (`report-to` / `report-uri`) when available.
4. Periodically review allowed external origins and remove no-longer-used hosts.
