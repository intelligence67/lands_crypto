document.addEventListener("DOMContentLoaded", async () => {
  console.log("========== SCRIPT START ==========");

  initTopBanner();

  try {
    const cards = await loadQuests();

    console.log("Cards:", cards);

    updateAchievements(cards);
    animateProgress(cards);
  } catch (error) {
    console.error("ERROR:", error);
  }
});

async function loadQuests() {
  console.log("Current URL:", window.location.href);

  const params = new URLSearchParams(window.location.search);

  console.log("Search params:", window.location.search);

  const PLAYER_ID = params.get("playerId");

  console.log("PLAYER_ID:", PLAYER_ID);

  if (!PLAYER_ID) {
    throw new Error("playerId not found");
  }

  const url = `https://cbaiendpnt.site/apg/players/${encodeURIComponent(
    PLAYER_ID
  )}/quests-layout?accept_language=es&currency=ARS`;

  console.log("Request URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization:
        "Bearer cba_qiOzuJ4_BXUNQh4v_jpp4JPSFBudVgIgruA51rJla-M",
    },
  });

  console.log("Status:", response.status);
  console.log("Response:", response);

  const text = await response.text();

  console.log("Raw response:");
  console.log(text);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = JSON.parse(text);

  console.log("Parsed JSON:", data);

  return data.cards || [];
}

function updateAchievements(cards) {
  console.log("Updating achievements...");

  cards.forEach((card) => {
    console.log("Card:", card);

    const item = document.querySelector(
      `.achievement__item[data-position="${card.position}"]`
    );

    console.log(
      `Position ${card.position}:`,
      item ? "FOUND" : "NOT FOUND"
    );

    if (!item) return;

    item.classList.toggle("achievement__item--complete", card.done);

    if (card.link) {
      item.href = `https://cuatrobet.com${card.link}`;
      item.target = "_blank";
      item.rel = "noopener noreferrer";
    }
  });
}

function animateProgress(cards) {
  const progress = document.querySelector(".achievements-progress");

  if (!progress) {
    console.log("Progress block not found");
    return;
  }

  const completed = cards.filter((card) => card.done).length;

  const percent = Math.round((completed / cards.length) * 100);

  console.log(
    `Completed: ${completed}/${cards.length} (${percent}%)`
  );

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

  if (!topBanner) {
    console.log("Top banner not found");
    return;
  }

  const backBtn = topBanner.querySelector(".top-banner__back");
  const closeBtn = topBanner.querySelector(".top-banner__close");

  backBtn?.addEventListener("click", () => history.back());

  closeBtn?.addEventListener("click", () => {
    topBanner.classList.add("is-hidden");
  });
}