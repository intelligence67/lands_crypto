document.addEventListener('DOMContentLoaded', () => {
  const progress = document.querySelector('.achievements-progress');
  if (!progress) return;

  const items = document.querySelectorAll('.achievement__item');
  const completedItems = document.querySelectorAll('.achievement__item--complete');

  const percent = Math.round(
    (completedItems.length / items.length) * 100
  );

  const fill = progress.querySelector('.achievements-progress__fill');
  const text = progress.querySelector('.achievements-progress__title span');

  const duration = 3000;
  const startTime = performance.now();

function animate(currentTime) {
  const elapsed = currentTime - startTime;
  const t = Math.min(elapsed / duration, 1);

  const progressValue = 1 - Math.pow(1 - t, 3);

  const currentPercent = Math.round(percent * progressValue);

  fill.style.width = `${percent * progressValue}%`;
  text.textContent = `${currentPercent}%`;

  if (t < 1) {
    requestAnimationFrame(animate);
  }
}

  requestAnimationFrame(animate);
});