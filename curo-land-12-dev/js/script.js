document.addEventListener("DOMContentLoaded", async () => {
  initTopBanner();

  try {
    const cards = await loadQuests();

    updateAchievements(cards);
    animateProgress(cards);
  } catch (error) {
    console.error(error);
  }
});

async function loadQuests() {
  const params = new URLSearchParams(window.location.search);
  const PLAYER_ID = params.get("playerId");

  if (!PLAYER_ID) {
    throw new Error("playerId not found");
  }

  const response = await fetch(
    `https://cbaiendpnt.site/apg/players/${encodeURIComponent(
      PLAYER_ID
    )}/quests-layout?accept_language=es&currency=ARS`,
    {
      method: "GET",
      headers: {
        Authorization:
          "Bearer cba_qiOzuJ4_BXUNQh4v_jpp4JPSFBudVgIgruA51rJla-M",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  return data.cards || [];
}

function updateAchievements(cards) {
  cards.forEach((card) => {
    const item = document.querySelector(
      `.achievement__item[data-position="${card.position}"]`
    );

    if (!item) return;

    item.classList.toggle("achievement__item--complete", card.done);

    if (card.link) {
      item.href = `https://cuatrobet.com${card.link}`;
      item.target = "_blank";
      item.rel = "noopener noreferrer";
    }
  });

  sortAchievements();
}

function sortAchievements() {
  const list = document.querySelector(".achievement");

  if (!list) return;

  const items = Array.from(list.querySelectorAll(".achievement__item"));

  items.sort((a, b) => {
    const aDone = a.classList.contains("achievement__item--complete");
    const bDone = b.classList.contains("achievement__item--complete");

    if (aDone === bDone) return 0;

    return aDone ? 1 : -1;
  });

  items.forEach((item) => list.appendChild(item));
}

function animateProgress(cards) {
  const progress = document.querySelector(".achievements-progress");

  if (!progress) return;

  const completed = cards.filter((card) => card.done).length;
  const percent = Math.round((completed / cards.length) * 100);

  const fill = progress.querySelector(".achievements-progress__fill");
  const text = progress.querySelector(".achievements-progress__title span");

  const duration = 3000;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const t = Math.min(elapsed / duration, 1);

    const value = 1 - Math.pow(1 - t, 3);

    fill.style.width = `${percent * value}%`;
    text.textContent = `${Math.round(percent * value)}%`;

    if (t < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function initTopBanner() {
  const topBanner = document.getElementById("topBanner");

  if (!topBanner) return;

  const backBtn = topBanner.querySelector(".top-banner__back");
  // const closeBtn = topBanner.querySelector(".top-banner__close");

  backBtn?.addEventListener("click", () => history.back());

  // closeBtn?.addEventListener("click", () => {
  //   topBanner.classList.add("is-hidden");
  // });
}