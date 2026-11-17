// Small progressive enhancements. Without this file the site works the same, just without motion.
// Sources for each effect are in FEATURES.md.
(() => {
  const root = document.documentElement;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Header shadow once scrolled, back-to-top button (Maeve In June).
  const top = document.querySelector('.to-top');
  const onScroll = () => {
    const y = window.scrollY;
    root.classList.toggle('scrolled', y > 40);
    if (top) top.classList.toggle('show', y > window.innerHeight);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (top) top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' }));

  // Looping videos (Media.astro). They play only while on screen, so a long page never runs
  // several at once, and never start on their own under reduced motion (the poster photo shows,
  // and the button plays it on request). The button pauses or plays, and a pause sticks.
  for (const v of document.querySelectorAll('video[data-loop]')) {
    const btn = v.parentElement.querySelector('.vid-toggle');
    let userPaused = still;
    const sync = () => {
      if (!btn) return;
      btn.textContent = v.paused ? '▶' : '❚❚';
      btn.setAttribute('aria-label', v.paused ? 'Play video' : 'Pause video');
    };
    const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    v.addEventListener('play', sync);
    v.addEventListener('pause', sync);
    if (btn) {
      btn.hidden = false;
      sync();
      btn.addEventListener('click', () => {
        if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); }
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !userPaused) play();
          else if (!e.isIntersecting) v.pause();
        }
      }, { threshold: 0.25 }).observe(v);
    } else if (!userPaused) play();
  }

  // Home opener video (index.astro, [data-opener]). Lives here, not inline in the page, because the site's
  // Content-Security-Policy (public/_headers) allows only same-origin script files. Plays while on screen,
  // pauses off screen, never autoplays under reduced motion, and one button pauses or plays it.
  const opener = document.querySelector('[data-opener]');
  const openerBtn = document.querySelector('[data-opener-toggle]');
  if (opener && openerBtn) {
    let openerPaused = still;
    const paintOpener = () => {
      openerBtn.textContent = openerPaused ? '▶' : '❚❚';
      openerBtn.setAttribute('aria-label', openerPaused ? 'Play video' : 'Pause video');
    };
    const playOpener = () => { const p = opener.play(); if (p && p.catch) p.catch(() => {}); };
    openerBtn.hidden = false;
    paintOpener();
    openerBtn.addEventListener('click', () => { openerPaused = !openerPaused; paintOpener(); if (openerPaused) opener.pause(); else playOpener(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { if (openerPaused) return; if (e.isIntersecting) playOpener(); else opener.pause(); }, { threshold: 0.2 }).observe(opener);
    } else if (!openerPaused) playOpener();
  }

  if (still) return;

  // Wrap every word of an element in spans, keeping <em> and other inline tags intact.
  const wrapWords = (el, make) => {
    let i = 0;
    const walk = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          for (const part of parts) {
            if (!part) continue;
            if (/^\s+$/.test(part)) frag.append(part);
            else frag.append(make(part, i++));
          }
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      }
    };
    walk(el);
    return i;
  };

  // Section headlines rise word by word (Monday Studio, Huehaus, Superlocal, Neutomni).
  for (const h of document.querySelectorAll('main h2')) {
    wrapWords(h, (word, i) => {
      const w = document.createElement('span');
      w.className = 'w';
      const inner = document.createElement('span');
      inner.style.setProperty('--i', i);
      inner.textContent = word;
      w.append(inner);
      return w;
    });
    h.classList.add('split');
    h.setAttribute('data-reveal', '');
  }

  // Scroll reveals (Muse, Soak & Sage).
  if ('IntersectionObserver' in window) {
    root.classList.add('reveal-on');
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px' });
    const items = [...document.querySelectorAll('[data-reveal]')];
    items.forEach((el) => io.observe(el));
    // Safety net: anything already on or above the screen shows, even if the observer never fires
    // (seen in an emulated phone viewport). Hidden content is worse than a missed animation.
    const sweep = () => {
      const vh = window.innerHeight;
      for (const el of items) if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < vh) el.classList.add('is-in');
    };
    let queued = false;
    window.addEventListener('scroll', () => { if (!queued) { queued = true; setTimeout(() => { queued = false; sweep(); }, 250); } }, { passive: true });
    setTimeout(sweep, 1200);
  }

  // Statement words light up as the paragraph scrolls past (Neutomni's split statement copy).
  const big = document.querySelector('[data-light]');
  if (big) {
    const words = [];
    wrapWords(big, (word) => { const s = document.createElement('span'); s.className = 'lw'; s.textContent = word; words.push(s); return s; });
    root.classList.add('lit-on');
    let ticking = false;
    const paint = () => {
      ticking = false;
      const r = big.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the paragraph's top reaches 85% down the screen, 1 when its bottom reaches 45%.
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.4)));
      const n = Math.round(p * words.length);
      words.forEach((w, k) => w.classList.toggle('lit', k < n));
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    paint();
  }

  if (!finePointer) return;

  // "See more" bubble following the mouse over the photo loop (Huehaus, Odyssée). The real cursor stays.
  for (const zone of document.querySelectorAll('[data-cursor]')) {
    const b = document.createElement('div');
    b.className = 'bubble';
    b.setAttribute('aria-hidden', 'true');
    b.textContent = zone.getAttribute('data-cursor');
    document.body.append(b);
    zone.addEventListener('pointermove', (e) => { b.style.translate = `${e.clientX}px ${e.clientY}px`; b.classList.add('on'); });
    zone.addEventListener('pointerleave', () => b.classList.remove('on'));
  }
  // (The 3D card tilt from the deco build is gone: HoneyBliss's cards sit still.)
})();
