document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.faq__item').forEach(item => {
    item.querySelector('.faq__question').addEventListener('click', () => {
      item.classList.toggle('is-active');
    });
  });

  document.querySelectorAll('.js-slider').forEach(slider => {
    new Swiper(slider.querySelector('.swiper'), {
      slidesPerView: 'auto',
      spaceBetween: 10,
      speed: 600,
      grabCursor: true,

      navigation: {
        nextEl: slider.querySelector('.slider__next'),
        prevEl: slider.querySelector('.slider__prev'),
      },
    });
  });

  const lang = document.querySelector('.header__lang');
  const more = document.querySelector('.header__more');

  if (lang) {
    lang.querySelector('.header__lang-btn').addEventListener('click', e => {
      e.stopPropagation();
      lang.classList.toggle('is-open');
    });
  }

  if (more) {
    more.querySelector('.header__more-btn').addEventListener('click', e => {
      e.stopPropagation();
      more.classList.toggle('is-open');
    });
  }

  document.addEventListener('click', () => {
    if (lang) lang.classList.remove('is-open');
    if (more) more.classList.remove('is-open');
  });

  const nav = document.querySelector('.header__nav');
  const menu = document.querySelector('.header__menu');
  const moreList = document.querySelector('.header__more-list');

  if (!nav || !menu || !more || !moreList) return;

  function updateMenu() {

    while (moreList.firstChild) {
      menu.appendChild(moreList.firstChild);
    }

    more.style.visibility = 'hidden';

    const moreWidth = more.offsetWidth || 70;

    while (
      menu.scrollWidth + moreWidth > nav.clientWidth &&
      menu.children.length > 1
    ) {
      more.style.visibility = 'visible';
      moreList.prepend(menu.lastElementChild);
    }

    if (!moreList.children.length) {
      more.style.visibility = 'hidden';
    }

  }

  updateMenu();

  window.addEventListener('resize', updateMenu);

});