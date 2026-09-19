# ScryTable multiplayer reliability changelog

Version: 3.0.1

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