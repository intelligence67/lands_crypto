document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('.faq__item').forEach(item => {
    item.querySelector('.faq__question').addEventListener('click', () => {
      item.classList.toggle('is-active');
    });
  });

  document.querySelectorAll('.js-slider').forEach(slider => {
    new Swiper(slider.querySelector('.swiper'), {
      slidesPerView: 'auto',
      spaceBetween: 20,
      speed: 600,
      grabCursor: true,

      navigation: {
        nextEl: slider.querySelector('.slider__next'),
        prevEl: slider.querySelector('.slider__prev'),
      },
    });
  });
});