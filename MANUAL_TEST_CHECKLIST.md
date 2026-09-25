# ScryTable manual multiplayer test checklist

Use separate browser profiles/devices so each participant has independent local storage and Firebase anonymous auth.

## Local Firebase rules checks

- [x] `pnpm test:firebase-rules` passes against the local Realtime Database Emulator: active turn, out-of-turn denial, 2HG teammate readiness, host force-pass, non-member denial, and legacy-room initialization.

## Required scenarios

- [ ] **Host + 3 joiners:** create a four-player public room, join simultaneously from three clients, and confirm there are exactly four players, one canonical seat order, matching turn order, and one slim lobby entry.
- [ ] **Full-room rejection:** while the four-player room is full, attempt a fifth join and confirm it is rejected without adding a player, member, private state, or public zone.
- [ ] **Force-close during active turn:** close the active player's tab without using Leave. Confirm the Offline badge appears, their state remains reclaimable, and the turn automatically skips after one minute.
- [ ] **30-second airplane-mode reconnect:** disconnect a player for 30 seconds, reconnect, and confirm the same seat and board state return without duplicate actions, duplicate spectators, or stale action-toast floods.
- [ ] **Explicit Leave:** use Leave, confirm a reclaimable tombstone remains, rejoin from the same device during the 15-minute grace period, then repeat and confirm stale player/private/public state is removed after the grace period while another client remains active.
- [ ] **Host leaves:** explicitly leave as host. Confirm the longest-present remaining player becomes host and gains Kick, Close, Reset, and Force Pass controls.
- [ ] **Archenemy host migration:** repeat host migration in Archenemy and confirm the Archenemy badge/role stays with the original player rather than moving to the new host.
- [ ] **2HG shared turn:** run a four-player 2HG room. Confirm randomized seats create consistent teams on all clients and the turn passes only after both active teammates ready up.
- [ ] **Kick active-turn player:** host-kick the active player. Confirm the next canonical present seat receives the turn and the kicked player’s player/private/public/ready state is removed.
- [ ] **Spectator reconnect:** join as spectator, force-close, reconnect from the same device, and confirm there is a single spectator entry. Confirm the spectator can inspect player hands.

## Data, lobby, and PWA checks

- [ ] Leave the lobby for Home, Decks, Rules, and Draft screens; confirm no lobby listener continues receiving updates.
- [ ] Confirm lobby records contain only summary fields and no hands, libraries, chat, actions, or public zones.
- [ ] Generate more than 200 chat messages/actions in a test room and confirm only the newest 200 remain.
- [ ] Seed an expired room and confirm lobby lazy cleanup removes both `/rooms/{code}` and `/publicRooms/{code}`.
- [ ] Suspend/background iOS Safari immediately after moving a card; reopen and confirm the final zone/private state was flushed.
- [ ] Load Commander Roulette through a simulated Scryfall 429/5xx response; confirm retries occur and partial pages are not cached.
- [ ] Install/reload the PWA and confirm the current service-worker shell cache activates and old shell caches are removed.