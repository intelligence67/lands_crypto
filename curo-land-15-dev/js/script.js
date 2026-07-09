document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.faq__item').forEach(item => {
    item.querySelector('.faq__question').addEventListener('click', () => {
      item.classList.toggle('is-active');
    });
  });
  
  new Swiper('.vip-parlays__slider', {
    slidesPerView: 'auto',
    spaceBetween: 20,
    speed: 600,
    grabCursor: true,

    navigation: {
      nextEl: '.vip-parlays__next',
      prevEl: '.vip-parlays__left',
    },
  });
});