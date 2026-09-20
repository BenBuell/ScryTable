# ScryTable 3.0.8 — installed iOS PWA viewport fix

## Changed files

- `index.html`
- `pwa.js`
- `sw.js`
- `scrytable-lite.html`
- `scripts/build-lite.cjs`

## What changed

- Installed Home Screen mode now uses a stable `100vh` fixed app containing block.
- Normal Safari continues using dynamic `visualViewport` pixel sizing for browser chrome and keyboard changes.
- Safe-area handling remains scoped to the top bar, hand bar, dialogs, and floating controls; no page-level safe-area padding was added.
- Viewport synchronization runs after `pageshow` and when the app returns to the foreground.
- Service-worker cache bumped to `scrytable-shell-v11`.
- Lite generation strips the PWA-only standalone CSS and remains online-only.

## Physical iPhone verification

This workspace cannot verify an actual installed iOS Home Screen app. On a Mac, enable iPhone **Settings → Safari → Advanced → Web Inspector**, connect the phone, launch the Home Screen app, and inspect it from Safari’s **Develop** menu.

Before testing, delete the existing Home Screen installation and add the updated site again. Confirm the installed app reports version `3.0.8`. Test cold launch, portrait, landscape rotation, background/resume, input focus/keyboard, and return to the game screen. Also confirm normal Safari separately.

The local checks verify syntax, generated Lite isolation, cache/version updates, and that standalone sizing no longer depends on a shortened JavaScript `innerHeight`. They do not replace physical iPhone/WebKit testing.