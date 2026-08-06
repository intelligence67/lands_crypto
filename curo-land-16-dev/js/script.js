document.addEventListener("DOMContentLoaded", async () => {
  initAdaptiveMenu();
});

function initAdaptiveMenu() {
  const nav = document.querySelector(".header__nav");
  const menu = document.querySelector(".header__menu");
  const more = document.querySelector(".header__more");
  const moreList = document.querySelector(".header__more-list");

  if (!nav || !menu || !more || !moreList) return;

  const updateMenu = () => {
    while (moreList.firstChild) {
      menu.appendChild(moreList.firstChild);
    }

    more.style.visibility = "hidden";
    const moreWidth = more.offsetWidth || 70;

    while (menu.scrollWidth + moreWidth > nav.clientWidth && menu.children.length > 1) {
      more.style.visibility = "visible";
      moreList.prepend(menu.lastElementChild);
    }

    if (!moreList.children.length) {
      more.style.visibility = "hidden";
    }
  };

  const debouncedUpdateMenu = debounce(updateMenu, 100);

  updateMenu();
  window.addEventListener("resize", debouncedUpdateMenu);
}

function debounce(callback, delay) {
  let timerId;

  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => callback(...args), delay);
  };
}