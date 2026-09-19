# ScryTable

ScryTable is a local-first Magic: The Gathering virtual tabletop. It supports deck management, Scryfall card search, solo play, online Firebase rooms, booster opening, Pick & Pass Draft, and saved local deck/board data through IndexedDB.

## Local development

Serve the repository over HTTP; do not open `index.html` with `file://`, because service workers and PWA installation require a web origin.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/` in a browser. Firebase, Scryfall, and other live integrations still require a network connection.

## Cloudflare Pages deployment

1. Create a Git repository containing the files in this directory.
2. In Cloudflare Dashboard, open **Workers & Pages → Pages** and create a project from Git.
3. Choose the repository.
4. Configure a static site with **no framework preset**, **no build command**, and `/` (the repository root) as the output directory.
5. Deploy.
6. Attach a custom domain if desired.
7. Open the resulting HTTPS site once online before installing from iOS Safari.

Cloudflare Pages provides the HTTPS origin required for service workers and PWA installation.

## Install on iPhone or iPad

Open ScryTable in Safari, tap **Share**, choose **Add to Home Screen**, confirm the name, and tap **Add**. Launch the app from the new Home Screen icon for standalone mode. The in-app **Install & Offline** guide explains Android and desktop installation too.

## Data backup and restore

Decks, folders, settings, and saved local board states live in the browser/app on the device. Use **My Decks → Export All** regularly. On iPhone and iPad, regular Safari storage and Home Screen app storage can be separate; export before installation if you need to transfer existing data, then use **Import/Restore** in the installed app.

## Offline limitations

The service worker caches only the same-origin app shell. It does not cache or proxy Firebase, `gstatic.com`, Scryfall, MTGJSON, Wizards rules sources, CORS proxies, or other third-party API traffic. New card searches/details, uncached card images, online rooms and syncing, booster/set data, Pick & Pass Draft connectivity, and fresh rules downloads require internet. Local IndexedDB decks and board state may remain available offline.

## Testing checklist

- Load the site online, then verify the browser reports it as installable.
- In iOS Safari, install from **Share → Add to Home Screen** and launch the Home Screen app.
- Check portrait and landscape layouts, including the notch/Dynamic Island and home indicator areas.
- Verify deck lists, modals, rules, chat, and normal scrolling.
- Verify battlefield taps, dragging, long-press menus, and hand interactions.
- Test export/import from **My Decks**.
- With network disabled, confirm the shell loads while live features honestly report that a connection is required.

## Releasing a new shell

When the shell or caching strategy changes materially, update `CACHE_NAME` in `sw.js` (currently `scrytable-shell-v4`) and deploy. The service worker removes older `scrytable-*` caches on activation. Users may need to fully close and reopen the app after a major update; the app does not aggressively reload during a game.