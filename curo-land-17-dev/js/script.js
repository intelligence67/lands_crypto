// const API_TOKEN = window.VIP_API_TOKEN;
const API_TOKEN = "cba_qiOzuJ4_BXUNQh4v_jpp4JPSFBudVgIgruA51rJla-M";

document.addEventListener("DOMContentLoaded", async () => {
  initFaq();
  initSliders();
  initDropdowns();
  initAdaptiveMenu();

  try {
    const vipData = await loadVipStatus();
    const contentMap = Object.fromEntries(
      (vipData.content || []).map((item) => [item.type, item])
    );

    renderVipLevel(vipData);
    renderBigWins(contentMap.bigWins);
    renderMonthlyWins(contentMap.monthlyWins);
    renderWithdrawals(contentMap.withdrawals);
  } catch (error) {
    console.error(error);
  }
});

function initFaq() {
  document.querySelectorAll(".faq__item").forEach((item) => {
    item.querySelector(".faq__question")?.addEventListener("click", () => {
      item.classList.toggle("is-active");
    });
  });
}

function initSliders() {
  document.querySelectorAll(".js-slider").forEach((slider) => {
    new Swiper(slider.querySelector(".swiper"), {
      slidesPerView: "auto",
      spaceBetween: 10,
      speed: 600,
      grabCursor: true,
      navigation: {
        nextEl: slider.querySelector(".slider__next"),
        prevEl: slider.querySelector(".slider__prev"),
      },
    });
  });
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

async function loadVipStatus() {
  const playerId = new URLSearchParams(location.search).get("playerId");

  if (!playerId) {
    throw new Error("playerId not found");
  }

  if (!API_TOKEN) {
    throw new Error("VIP_API_TOKEN not found");
  }

  const response = await fetch(
    `https://cbaiendpnt.site/apg/players/${encodeURIComponent(playerId)}/vip-status`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

function setupLink(link, url) {
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
}

function setupImage(image, { imageUrl, title }) {
  image.src = imageUrl;
  image.alt = title;
}

function renderVipLevel({ isVip, level }) {
  if (!isVip) return;

  const cardsByLevel = Object.fromEntries(
    [...document.querySelectorAll(".vip-card")]
      .map((card) => {
        const levelClass = [...card.classList].find((className) =>
          /^vip-card--\d+$/.test(className)
        );

        return levelClass ? [levelClass.replace("vip-card--", ""), card] : null;
      })
      .filter(Boolean)
  );

  Object.values(cardsByLevel).forEach((card) => {
    card.classList.remove("vip-card--active", "vip-card--completed");
  });

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    cardsByLevel[currentLevel]?.classList.add("vip-card--completed");
  }

  cardsByLevel[level]?.classList.add("vip-card--active");
}

function renderBigWins(block) {
  if (!block) return;

  const cards = {
    1: document.querySelector(".vip-win-card--gold"),
    2: document.querySelector(".vip-win-card--metallic"),
    3: document.querySelector(".vip-win-card--peach"),
  };

  block.items.forEach((win) => {
    const card = cards[win.position];

    if (!card) return;

    const link = card.querySelector(".vip-win-card__image");
    const image = link?.querySelector("img");

    if (!link || !image) return;

    setupLink(link, win.link);
    setupImage(image, win);

    card.querySelector(".vip-win-card__id").innerHTML =
      `ID <span>${win.playerId.replace(/^ID\s*/, "")}</span>`;
    card.querySelector(".vip-win-card__amount").textContent = win.amountLabel;
  });
}

function renderMonthlyWins(block) {
  if (!block) return;

  const cards = document.querySelectorAll(".vip-win-item");

  block.items.forEach((win, index) => {
    const card = cards[index];

    if (!card) return;

    const link = card.querySelector(".vip-win-item__image");
    const image = link?.querySelector("img");

    if (!link || !image) return;

    setupLink(link, win.link);
    setupImage(image, win);

    card.querySelector(".vip-win-item__info h3").textContent = win.title;
    card.querySelector(".vip-win-item__info p").innerHTML =
      `ID <span>${win.playerId.replace(/^ID\s*/, "")}</span>`;
    card.querySelector(".vip-win-item__amount").textContent = win.amountLabel;
  });
}

function setWithdrawalAmount(element, amountLabel) {
  const amountTextNode = [...element.childNodes].find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
  );

  if (amountTextNode) {
    amountTextNode.textContent = `${amountLabel} `;
  } else {
    element.prepend(document.createTextNode(`${amountLabel} `));
  }
}

function renderWithdrawals(block) {
  if (!block) return;

  const total = document.querySelector(".vip-withdrawals__amount span");

  if (total) {
    total.textContent = block.totalLabel.replace(/\s*ARS$/, "");
  }

  const cards = document.querySelectorAll(".withdraw-card");

  block.items.forEach((withdraw, index) => {
    const card = cards[index];

    if (!card) return;

    const badge = card.querySelector(".withdraw-card__badge");
    badge.textContent = withdraw.multiplierLabel;
    badge.style.setProperty("--badge-color", withdraw.color);
    badge.classList.remove(
      "withdraw-card__badge--rhomb",
      "withdraw-card__badge--star"
    );
    badge.classList.add(
      withdraw.multiplier < 5
        ? "withdraw-card__badge--rhomb"
        : "withdraw-card__badge--star"
    );

    card.querySelector(".withdraw-card__id").textContent = withdraw.playerId;
    setWithdrawalAmount(
      card.querySelector(".withdraw-card__amount"),
      withdraw.amountLabel
    );
    card.querySelector(".withdraw-card__deposit").textContent = withdraw.depositLabel;
  });
}
