// Runs before the page paints. The home-page intro plays once per visit; after that it is hidden
// before it can flash. Storage can throw in private windows, so failure just means it plays again.
try {
  if (sessionStorage.getItem('pinup-intro')) document.documentElement.classList.add('intro-seen');
  else sessionStorage.setItem('pinup-intro', '1');
} catch (e) { /* storage blocked: harmless */ }
