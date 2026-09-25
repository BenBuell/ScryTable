# ScryTable 3.1.0 — Firebase turn permissions and card lookup caching

## Changed files

- `index.html`
- `firebase-rules-snippet.json`
- `sw.js`
- `scrytable-lite.html` (regenerated)
- `BUG_FIX_CHANGELOG.md`
- `README.md`
- `MANUAL_TEST_CHECKLIST.md`
- `firebase.json`
- `tests/firebase-rules.test.cjs`
- `package.json`
- `pnpm-lock.yaml`
- `.gitignore`
- `.replit`

## Firebase action required

Publish the complete current `firebase-rules-snippet.json` in **Firebase Console → Realtime Database → Rules**. This is not Firestore. It adds a dedicated `/rooms/{code}/turnState` permission for the currently active player, active 2HG teammate, or authenticated host. It denies deletion of turnState and validates the turn pointer, cycle, timestamp, and ready markers.

New rooms initialize `/turnState` as well as the old flat fields. Existing rooms without `/turnState` fall back to their flat turn values and initialize the new node on the first successful turn transaction.

Back up existing rules before publishing. The new rules have now been compiled and exercised in the local Firebase Realtime Database Emulator; they have not been published or tested against production.

## What changed

- Normal turn end, 2HG ready-up, and host force-pass transact only on the small `/turnState` node instead of rewriting the full room record. This avoids depending on broad parent-room permission comparisons for the turn action. New 2HG seats are assigned a balanced team when they join.
- Room listeners read the nested state with fallback to legacy flat fields.
- Opponent rendering avoids a redundant rerender when a room snapshot changes but displayed player fields have not.
- Scryfall named-card requests now share an in-flight promise across rerenders, cache results case-insensitively, and cache 404s briefly. This stops repeat lookups while board taps or Firebase updates rerender opponent cards.
- Existing card image URLs continue to take priority; fallback API lookups only occur for cards without usable synced/cached art.
- Service-worker cache is `scrytable-shell-v12`; application version is `3.1.0`, and Lite is generated as `3.1.0-lite`.

## Verification

- JavaScript parser checks for inline scripts, PWA helper, and service worker.
- Firebase Emulator compiled the current rules and ran seven passing cases: active player allowed, out-of-turn player denied, active 2HG teammate allowed, other-team teammate denied, host force-pass allowed, non-member denied, and legacy flat-turn room migration allowed.
- Focused transaction harness confirmed end-turn targets `/rooms/{code}/turnState` and advances to the next present player.
- Focused Scryfall harness confirmed one in-flight request for duplicate case/whitespace variants, successful case-insensitive cache reuse, and cooldown for repeated 404 lookups.
- First emulator run caught an invalid parenthesis in the new permission rule; it was corrected before the passing run.
- Emulator tests use the demo project `demo-scrytable`; no production RTDB data was read or changed.

Run the local rules suite with `pnpm test:firebase-rules` (Java 21 required; the emulator downloads on first run). After publishing, verify normal turn end, concurrent 2HG ready-up, host force-pass, reset, kick-current-player, and reconnect on two authenticated clients. Ensure both clients load version `3.1.0`; close/reopen installed PWAs so cache v12 activates.
