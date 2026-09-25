# ScryTable multiplayer reliability changelog

Version: 3.1.0

## 3.1.0 turn permissions and opponent card lookup caching

- Move regular turns, 2HG ready-up, and host force-pass transactions from the full room record to a dedicated `/turnState` path.
- Add an authenticated active-player/team/host write rule for turn state; room creation writes both nested and legacy flat turn fields, while clients accept legacy rooms and migrate on first turn action.
- Assign a balanced team to newly joining 2HG players immediately so the scoped teammate permission can validate their ready-up.
- Avoid re-rendering opponent boards for unrelated room snapshots when the displayed player data did not change.
- Cache Scryfall named lookups case-insensitively, deduplicate in-flight requests, and briefly cache misses/transient failures so repeated board renders and taps do not repeat API requests.
- Bump service-worker cache to v12.
- The updated `firebase-rules-snippet.json` must be published in Firebase Realtime Database Rules before `/turnState` writes are permitted.

## 3.0.5 anonymous-auth rejoin fix

- Reclaim an existing multiplayer seat only when both its local device ID and Firebase anonymous-auth UID match.
- If browser or preview storage rotates the anonymous Firebase account while preserving local device data, join with a fresh seat instead of attempting an owner change that Realtime Database Rules correctly deny.
- Restore the Join button after handled failures and bump the service-worker shell cache to v8.

## 3.0.4 iPhone viewport fit

- Use the full layout viewport in iOS standalone mode instead of the shorter visual viewport, preventing top safe-area crowding and the matching empty strip at the bottom.
- Moved installation and offline guidance into the main How To guide and removed the separate Home card.
- Bumped the service-worker shell cache to v7.

## 3.0.3 Safari icon discovery fix

- Added a conventional root `/favicon.ico`, a PNG favicon, and root Apple touch-icon fallbacks so Safari never has to generate a letter tile.
- Moved active logo and manifest icon references to root-level versioned assets for compatibility with Cloudflare static-asset deployments.
- Bumped the service-worker shell cache to v6.

## 3.0.2 iOS multiplayer and branding fix

- Added the missing `cryptoRandomIndex` helper used when hosting or joining an online room, with secure random generation and a compatibility fallback.
- Versioned the logo and install-icon URLs again and bumped the service-worker shell cache to v5 so Cloudflare and existing PWA caches fetch the supplied artwork.

## 3.0.1 branding update

- Replaced the text-only home logo and all install icons with the supplied ScryTable artwork.
- Composited iOS, standard PWA, and maskable icons onto an opaque `#171513` charcoal background.
- Versioned icon URLs to bypass the previous immutable icon cache and bumped the service-worker shell cache to v4.

1. **Explicit leave cleanup:** explicit Leave creates a reclaimable 15-minute tombstone while other players remain, advances the turn when needed, migrates the host, and lets host-side lazy cleanup remove player/private/public state after the grace period. If the final player leaves, the room and its index are deleted immediately. Accidental disconnects preserve all game state.
2. **Stalled turns:** disconnected turn holders are skipped after one minute, and hosts have a **Force Pass** action.
3. **Presence:** players register reconnect-safe `onDisconnect` state, heartbeat `lastSeen`, display an Offline badge, and spectators register disconnect removal.
4. **Host migration:** the longest-present player is promoted transactionally. Archenemy remains assigned to the original `archenemyId`.
5. **Atomic joins:** new players reserve one of the room’s fixed Firebase slot nodes transactionally before their player record is written, preventing concurrent joins from exceeding capacity. Open/expiry checks run first, and device-based rejoin is handled before capacity checks.
5b. **Cross-device reclaim:** intentionally unsupported by product policy; device-based reclaim remains the supported flow.
5c. **Spectator recovery:** spectator entries are reused by `devicePid` and removed on disconnect.
6. **Canonical seats:** randomized room seating is persisted and reused for player display, normal turns, forced turns, and kick reassignment. 2HG team identity is also persisted so cleanup cannot reshuffle teams.
7. **Duplicate draft IDs:** draft and completed-pool grids now use distinct IDs.
8. **Lobby privacy:** the lobby reads a slim `/publicRooms` index limited to the 20 most recent rooms, rather than downloading room state.
9. **Lobby lifecycle:** leaving the lobby always detaches its Firebase listener.
10. **Bounded history:** actions, normal chat, and team chat are trimmed to 200 stored entries.
11. **Lazy cleanup:** lobby entry sweeps a bounded batch of rooms older than 24 hours; host reconciliation removes orphaned state after the 15-minute disconnect grace period.
12. **Room codes:** codes use independent cryptographic random characters and room creation uses a collision-safe transaction.
13. **Scryfall resilience:** the shared queue observes 100 ms spacing, retries 429/5xx/network failures with backoff, caps pagination, and caches commander data only after complete pagination.
14. **Sync ownership:** private/public zone blobs remain intentionally owner-authoritative; shared 2HG life and turn transitions continue to use transactions. The rules snippet enforces owner writes for zone blobs.
15. **Reconnect replay:** remote actions are deduplicated by Firebase key/timestamp and persist a per-device last-seen timestamp instead of relying on a fixed reconnect suppression window.
16. **Escaping:** draft content now uses the same HTML escaping helper as the rest of the app.
17. **Static cleanup:** removed the `showScreen` monkey patch and dead duplicate `openAddCardToBattlefield` implementation.
18. **Mobile/PWA:** prior dynamic viewport work is retained; pending online and local board-state saves now flush on `visibilitychange` and `pagehide`.
19. **Error handling:** multiplayer writes, history trimming, Scryfall pagination, and primary network actions now log causes while retaining user-facing errors and retry paths.

## Data policy notes

- Explicit Leave preserves a reclaimable tombstone for 15 minutes when another player remains; the final player leaving deletes the room.
- Disconnected players retain their state and are skipped after one minute.
- Disconnected/tombstoned player state is removed after 15 minutes when an active client performs reconciliation.
- Room expiry cleanup is client-driven and bounded.
- Spectators may read hands.
- Private rooms continue to use the room code as access control.
- Cross-device or cleared-data seat reclaim is not supported.

## Firebase rules rollout

`firebase-rules-snippet.json` is the rules template implied by these changes. Test it in the Firebase Emulator Suite before production. Existing rooms created before anonymous auth do not contain `authUid`, `members`, or `/publicRooms` records; expire or migrate those rooms before enforcing the new rules.