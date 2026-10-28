export function initHeader() {
  initDropdowns();
  initAdaptiveMenu();
}

function initDropdowns() {
  const lang = document.querySelector(".header__lang");
  const more = document.querySelector(".header__more");

  lang?.querySelector(".header__lang-btn")?.addEventListener("click", (event) => {
    event.stopPropagation();
    lang.classList.toggle("is-open");
  });

  more?.querySelector(".header__more-btn")?.addEventListener("click", (event) => {
    event.stopPropagation();
    more.classList.toggle("is-open");
  });

  document.addEventListener("click", () => {
    lang?.classList.remove("is-open");
    more?.classList.remove("is-open");
  });
}

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
