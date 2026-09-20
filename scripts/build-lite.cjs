// Generate Lite from the PWA source so fixes cannot drift between editions.
const fs = require('node:fs');
let html = fs.readFileSync('index.html', 'utf8');
const image = path => 'data:image/png;base64,' + fs.readFileSync(path).toString('base64');
html = html.replace('<title>ScryTable</title>', '<title>ScryTable Lite</title>')
  .replace(/(name="application-version" content=")([^"]+)/, '$1$2-lite')
  .replace(/^\s*<link rel="(?:manifest|icon|apple-touch-icon[^"]*)"[^>]*>\s*$/gm, '')
  .replace(/^\s*<meta name="(?:mobile-web-app-capable|apple-mobile-web-app-[^"]*)"[^>]*>\s*$/gm, '')
  .replace('</head>', '<link rel="icon" href="' + image('favicon-32.png') + '" /></head>')
  .replace('src="/scrytable-logo-v5.png"', 'src="' + image('scrytable-logo-v5.png') + '"')
  .replace(/<div id="pwa-install-banner"[\s\S]*?<!-- RULES SCREEN -->/, '<!-- RULES SCREEN -->')
  .replace(/^\s*\.pwa-[^\n]+$/gm, '')
  .replace(/\s*\/\* Installed PWA viewport override\.[\s\S]*?\/\* End installed PWA viewport override \*\/\s*/g, '\n')
  .replace(/,\.pwa-install-banner button/g, '')
  .replace(/\s*'<div class="help-section" id="howto-install">[\s\S]*?'<\/ul><\/div>'\+/, '')
  .replace('Features, installation &amp; offline use', 'Features &amp; online play')
  .replace(/<script>\s*if \("serviceWorker" in navigator\)[\s\S]*?<\/script>/, '');
const pwa = fs.readFileSync('pwa.js', 'utf8');
const viewport = pwa.slice(pwa.indexOf('  function syncViewportVars()'), pwa.indexOf('  function openPwaHelp()'))
  .replace('var standalone = isStandalone();', 'var standalone = false;');
html = html.replace('<script src="/pwa.js"></script>', `<script>
(function(){
${viewport}
syncViewportVars();
window.addEventListener('resize', syncViewportVars);
window.addEventListener('pageshow', syncViewportVars);
window.addEventListener('orientationchange', function(){setTimeout(syncViewportVars,50);setTimeout(syncViewportVars,350);});
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',syncViewportVars);
  window.visualViewport.addEventListener('scroll',syncViewportVars);
}
}());
</script>`);
if (/(?:src|href)="\/|serviceWorker|manifest\.webmanifest|pwa-install-banner/.test(html)) {
  throw new Error('Lite still has a local dependency or PWA feature');
}
fs.writeFileSync('scrytable-lite.html', html);