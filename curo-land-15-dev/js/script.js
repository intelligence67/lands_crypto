document.addEventListener('DOMContentLoaded', () => {

  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(item => {
    const button = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');

    if (!button || !answer) return;

    const setAnswerHeight = () => {
      item.style.setProperty('--answer-height', `${answer.scrollHeight + 18}px`);
    };

    setAnswerHeight();

    button.addEventListener('click', () => {
      item.classList.toggle('is-active');
      setAnswerHeight();
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