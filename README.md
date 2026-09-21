# ScryTable

**🃏 Live App → [scrytable.benjaminianbuell.workers.dev](https://scrytable.benjaminianbuell.workers.dev/)**

ScryTable is a local-first Magic: The Gathering virtual tabletop and deck manager. It runs entirely in the browser, installs as a PWA on any device, and requires no account or server-side setup. Multiplayer and live card data rely on Firebase and Scryfall respectively, but your decks and board state are stored locally in IndexedDB.

## Features

- **Deck Manager** — Build, import, and organize decks by folder. Browse cards with full Scryfall search syntax and tag filters (removal, ramp, tribal, keywords, format legality, and more). View mana curve, card-type breakdown, and estimated market value.
- **Play Online** — Host or join rooms via Firebase. Supports Commander/EDH, Standard, Modern, Legacy, Casual, Two-Headed Giant, and Archenemy. Optional Planechase modifier, bracket rating, and friendly-mulligan rules.
- **Solo / Local** — Practice alone against a local board with full zone management (battlefield, library, graveyard, exile, command zone, hand).
- **Battlefield** — Tap/untap, drag cards, long-press for counters and tokens, pair Auras, flip DFCs, use impulse draw, scry/surveil, tutor, and zoom any card.
- **Commander Roulette** — Roll a random commander filtered by EDHREC rank range. Tracks session history.
- **Open Packs** — Open virtual Play, Draft, or Collector boosters for any set with real rarity rates and estimated USD value.
- **Pick & Pass Draft** — Full multiplayer booster draft via Firebase. Host generates packs, shares a room code, players pick and pass in real time. Supports set boosters and CubeCobra cube imports.
- **Full Comprehensive Rules** — Searchable, browsable MTG rules built in to the app.
- **PWA / Offline Shell** — Installs to home screen on iOS, Android, and desktop. App shell loads offline; live features (card search, online rooms, booster data) require internet.

## Install on iPhone or iPad

Open the live app in Safari, tap **Share → Add to Home Screen**, confirm, and tap **Add**. Launch from the Home Screen icon for full standalone mode. The in-app **How To** screen covers Android and desktop installation as well.

> **Note:** Safari storage and Home Screen app storage are separate on iOS. Export your decks from **My Decks → Export** before installing if you want to transfer existing data, then use **Import** inside the installed app.

## Data backup

All decks, folders, and local board states live in the browser on-device. Use **My Decks → Export** regularly to keep a backup file. Use **Import** to restore on a new device or browser.

## Offline limitations

The service worker caches only the same-origin app shell. Card images, Scryfall search, Firebase rooms, booster and draft data, and the rules download all require an internet connection. Local decks and saved board state may remain available offline.

## Local development

Serve the repo over HTTP — do not open `index.html` directly with `file://`, as service workers require a proper web origin.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/` in your browser.

## ScryTable Lite

ScryTable Lite can be run directly from `file://` by opening `scrytable-lite.html` in a browser.
