// Google Analytics 4 for Pinup Salon (property "Pinup Salon" 544077905 in Storm's GA account).
// Kept in its own file because the CSP allows no inline scripts.
// Only the real domain reports: preview and localhost visits would otherwise pollute the numbers
// that Storm reports to the salon.
(function () {
  var ID = 'G-LJZ4XR3WR5';
  if (!/(^|\.)pinupsalonseattle\.com$/.test(location.hostname)) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ID);
})();
