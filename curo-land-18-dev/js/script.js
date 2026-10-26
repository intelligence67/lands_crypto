function initResponsibleFaq() {
  document.querySelectorAll('.responsible .faq__item').forEach((item) => {
    const question = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!question || !answer || item.dataset.faqReady) return;
    item.dataset.faqReady = 'true';

    question.addEventListener('click', () => {
      const expanded = item.classList.toggle('is-active');
      question.setAttribute('aria-expanded', String(expanded));
      answer.inert = !expanded;
    });
  });
}

function initResponsibleAnchors() {
  const page = document.querySelector('.responsible');
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
    target.setAttribute('tabindex', '-1');
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

function initResponsibleTop() {
  const hero = document.querySelector('.responsible-hero');
  const button = document.querySelector('.responsible-top');
  if (!hero || !button) return;

  const update = () => {
    const visible = hero.getBoundingClientRect().bottom <= 80;
    button.classList.toggle('is-visible', visible);
    button.inert = !visible;
  };
  let scheduled = false;
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      update();
      scheduled = false;
    });
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  new ResizeObserver(scheduleUpdate).observe(hero);
  update();
}

function initResponsible() {
  initResponsibleFaq();
  initResponsibleAnchors();
  initResponsibleTop();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initResponsible, { once: true });
} else {
  initResponsible();
}
