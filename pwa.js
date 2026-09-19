(function () {
  'use strict';

  var INSTALL_DISMISSED = 'scrytable_pwa_install_hint_dismissed';
  var DATA_NOTICE_DISMISSED = 'scrytable_pwa_data_notice_seen';
  var NON_SAFARI_IOS = /CriOS|FxiOS|EdgiOS|OPiOS|GSA|DuckDuckGo|Instagram|FBAN|FBAV|Line|Twitter/i;

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function isNormalIOSSafari() {
    return isIOS() && !isStandalone() &&
      !NON_SAFARI_IOS.test(navigator.userAgent) &&
      (/Safari/i.test(navigator.userAgent) || navigator.platform === 'MacIntel');
  }

  function isActiveGame() {
    var game = document.getElementById('screen-game');
    if (!game || !game.classList.contains('hidden')) return true;
    return window.G && G.screen === 'game';
  }

  function isHomeVisible() {
    var home = document.getElementById('screen-home');
    return !!home && !home.classList.contains('hidden');
  }

  function openPwaHelp() {
    if (typeof window.openModal !== 'function') return;
    var html =
      '<div class="modal-title">&#128241; Install &amp; Offline</div>' +
      '<div style="max-height:72vh;overflow-y:auto;padding-right:.25rem">' +
        '<div class="pwa-help-section" style="border-top:0;padding-top:0;margin-top:0"><h3>Install on iPhone or iPad</h3>' +
          '<ol class="pwa-help-list">' +
            '<li>Open ScryTable in <strong>Safari</strong>. Installation is not available from most in-app browsers.</li>' +
            '<li>Tap the <strong>Share</strong> button.</li>' +
            '<li>Scroll if needed and choose <strong>Add to Home Screen</strong>.</li>' +
            '<li>Confirm the name and tap <strong>Add</strong>.</li>' +
            '<li>Open ScryTable from its new Home Screen icon for the full-screen app experience.</li>' +
          '</ol>' +
        '</div>' +
        '<div class="pwa-help-section"><h3>Install on Android or desktop</h3><p>Use the browser Install App or Add to Home Screen option when it appears. If it does not appear, open the browser menu and look for Install, Add to Home screen, or Create shortcut. Wording varies by browser.</p></div>' +
        '<div class="pwa-help-section"><h3>Important data note</h3><p>Decks, folders, settings, and saved local board states are stored in the browser/app on that device. On iPhone and iPad, the Home Screen app can have separate storage from regular Safari. Use <strong>My Decks → Export All</strong> before installing if you want a backup or need to move existing Safari-local data, then use <strong>Import/Restore</strong> in the installed app. Safari data is not automatically migrated.</p></div>' +
        '<div class="pwa-help-section"><h3>Offline behavior</h3><p>The installed app caches its interface for a faster, more reliable launch, but not every feature works without internet. New Scryfall searches and card details, online games and Firebase room sync, new booster/set data and Pick &amp; Pass Draft connectivity, fresh comprehensive rules downloads, and card images not already held by the browser cache all need a connection. Locally saved decks and board state generally remain device-local; export regularly as a backup.</p></div>' +
        '<div class="pwa-help-section"><h3>Updates</h3><p>ScryTable updates automatically the next time it opens online. After a major update, fully close and reopen the app if the new version does not appear. Do not force-close during an active game unless you have saved what you need.</p></div>' +
      '</div>';
    window.openModal(html, '560px');
  }

  function refreshInstallBanner() {
    var banner = document.getElementById('pwa-install-banner');
    if (!banner) return;
    var shouldShow = isNormalIOSSafari() &&
      !localStorage.getItem(INSTALL_DISMISSED) &&
      !isActiveGame() &&
      isHomeVisible();
    banner.hidden = !shouldShow;
  }

  function dismissInstallHint() {
    localStorage.setItem(INSTALL_DISMISSED, '1');
    refreshInstallBanner();
  }

  function installLearnMore() {
    dismissInstallHint();
    openPwaHelp();
  }

  function maybeShowInstalledDataNotice() {
    if (!isIOS() || !isStandalone() ||
        localStorage.getItem(DATA_NOTICE_DISMISSED) ||
        isActiveGame() || !isHomeVisible()) return;
    localStorage.setItem(DATA_NOTICE_DISMISSED, '1');
    if (typeof window.openModal !== 'function') return;
    window.openModal(
      '<div class="modal-title">&#9432; Welcome to the installed app</div>' +
      '<p style="font-size:.82rem;line-height:1.5;margin-bottom:.85rem">On iPhone and iPad, decks saved in Safari may be separate from decks saved here. Use <strong>My Decks → Export All</strong> before installation, then <strong>Import/Restore</strong> here if you need to transfer a backup.</p>' +
      '<div style="display:flex;gap:.45rem"><button class="btn btn-gold w-full" onclick="closeModal();openPwaHelp()">Backup &amp; restore details</button><button class="btn w-full" onclick="closeModal()">Got it</button></div>',
      '460px'
    );
  }

  window.openPwaHelp = openPwaHelp;
  window.pwaDismissInstallHint = dismissInstallHint;
  window.pwaInstallLearnMore = installLearnMore;
  window.pwaRefreshInstallBanner = refreshInstallBanner;
  window.isIOS = isIOS;
  window.isStandalone = isStandalone;

  window.addEventListener('load', function () {
    refreshInstallBanner();
    window.setTimeout(maybeShowInstalledDataNotice, 700);
  });
  document.addEventListener('visibilitychange', refreshInstallBanner);
}());