function initAboutAnchors() {
  const page = document.querySelector('.about');
  if (!page) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const scrollToHash = (hash, smooth = true) => {
    let id;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(id);
    if (!target || !page.contains(target)) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant',
      block: 'start',
    });
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    let target;
    try {
      target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    } catch {
      return;
    }
    if (!target || !page.contains(target)) return;
    event.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    scrollToHash(url.hash);
  });

  window.addEventListener('hashchange', () => scrollToHash(location.hash));
  const restoreAnchor = () => {
    if (location.hash) scrollToHash(location.hash, false);
  };
  if (document.readyState === 'complete') restoreAnchor();
  else window.addEventListener('load', restoreAnchor, { once: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutAnchors, { once: true });
} else {
  initAboutAnchors();
}
