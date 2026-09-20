# ScryTable 3.0.6 — replacement files and verification

## Replace in your repository

- `index.html`, `pwa.js`, `sw.js`: full PWA.
- `scrytable-lite.html`: standalone online-only edition; no companion files needed.
- `scripts/build-lite.cjs`: optional build helper. Run `node scripts/build-lite.cjs` from the repository root to regenerate Lite from the PWA source and existing branding files.
- `firebase-rules-snippet.json`: proposed Realtime Database rule update, NOT an automatically deployed configuration.

No icon assets or other unchanged files are included.

## Firebase action required

In Firebase **Realtime Database → Rules** (not Firestore), merge the new `.write` entries under `rooms/$code/chat/$message` and `rooms/$code/actions/$action` with your current rules. Preserve any rules added elsewhere, especially draft rules. Review/test before publishing. Replacing a file in Git does not publish Firebase rules.

These additions authorize new records only for a room member whose player record belongs to the authenticated UID, and allow host cleanup. They do not turn on public writes. They have been JSON-checked but have NOT been published or verified against the live project. Existing parent-level permissions remain in place and need a broader security review.

## Fixed

- Safe-area spacing consolidated; keyboard-aware modal geometry and scrolling.
- 16px touch-device inputs to avoid Safari automatic focus zoom.
- Larger touch targets and wrapping deck toolbar while retaining the theme.
- Chat column no longer inherits wrapping from card-grid zones.
- Join claims its own slot before registering disconnect cleanup, matching existing rules. Failed registrations roll the claim back.
- No-op reconciliation aborts rather than submitting unnecessary writes.
- Expired-room sweep reads the permitted public index instead of the denied rooms list. Private abandoned rooms still require a separate cleanup strategy.
- PWA navigations refresh from network with offline fallback; Lite requests bypass PWA caching.
- Lite is generated from the same fixed source and viewport logic.

## Verified

Browser checks: narrow portrait layouts, landscape, Home, deck toolbar, import dialog display, How To, and a seeded solo game. Fresh Lite contexts registered no service worker and requested no local assets.

Actual Firebase SDK checks after the join fix: two distinct anonymous users created and joined a private room; life changes propagated between clients. Temporary test rooms were removed.

JavaScript syntax and packaging checks passed. Full deck import completion was not verified.

## Remaining production blockers / limits

- Room capacity is NOT securely enforced by the existing UID-keyed reservations. It needs bounded seat claims with matching rules or trusted server arbitration.
- Actual SDK chat sending was denied by the current live rules. Publish and test the scoped rule additions above before relying on chat.
- Shared turn transitions, host migration, team chat, and draft room permissions still need full rule/emulator validation. Draft joins also need concurrency-safe capacity handling.
- The current broad room read/write policy is not a complete private-hand or team-chat security boundary.
- WebKit and physical iPhone testing were unavailable. Browser resizing does not prove Dynamic Island, Safari keyboard, rotation, or installed-PWA behavior on hardware.
- A crash between slot claim and disconnect registration can leave a reservation; server-side lease expiry is recommended.

This is a tested improvement build, not a declaration that every feature is production-ready. Back up decks with Export All before replacing an installed build.