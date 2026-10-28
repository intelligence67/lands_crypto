import { renderVipPerks } from "./vip-perks.js";

export function initVipVisibility(apiStatus) {
  const statuses = [
    "guest",
    "no-vip",
    "vip-1",
    "vip-2",
    "vip-3",
    "vip-4",
    "unavallable",
  ];
  const param = new URLSearchParams(location.search).get("vip");
  const status = statuses.includes(apiStatus) ? apiStatus : document.body.hasAttribute("data-vip-integration") ? "unavallable" : statuses.includes(param) ? param : "guest";

  statuses.forEach((item) => {
    document.body.classList.remove(`vip-status--${item}`);
  });

  document.body.classList.add(`vip-status--${status}`);

  document.querySelectorAll("[data-vip-visible]").forEach((block) => {
    block.hidden = !block.dataset.vipVisible
      .trim()
      .split(/\s+/)
      .includes(status);
  });

  renderVipAccount(status);
  renderVipNext(status);
  renderVipPerks(status);
}

function renderVipAccount(status) {
  const block = document.querySelector(".vip-account");
  if (!block) return;

  const unavailable = status === "unavallable";
  const level = Number(status.replace("vip-", "")) || 1;
  const names = ["I", "II", "III", "IV"];
  const topLevel = status === "vip-4";
  const banner = block.querySelector(".vip-account__banner");

  banner.querySelector(".vip-account__level img").src =
    `./img/vip-account-lvl-${level}.webp`;
  banner.querySelector(".vip-account__level span").textContent = unavailable
    ? "Loading…"
    : `VIP ${names[level - 1]}`;
  banner.querySelector(".vip-account__badge span").textContent = unavailable
    ? "Estado desconocido"
    : "Tu nivel actual";
  banner
    .querySelector(".vip-account__badge use")
    .setAttribute(
      "href",
      `./img/vip-account-${unavailable ? "alert" : "check"}.svg#icon`,
    );
  banner.querySelector(".vip-account__expiry span").textContent = topLevel
    ? "VIP de por vida"
    : "Vence en 3 días";
  banner.querySelector(".vip-account__benefits span").textContent = topLevel
    ? "Ver experiencias VIP"
    : "Beneficios";

  const secondary = banner.querySelector(".vip-account__secondary");
  secondary.querySelector("span").textContent = unavailable
    ? "Escribir al soporte"
    : topLevel
      ? "Hablar con mi asesor"
      : "Progreso";
  secondary
    .querySelector("use")
    .setAttribute(
      "href",
      `./img/vip-account-${unavailable || topLevel ? "chat" : "trend"}.svg#icon`,
    );

  const currentLevel = Number(status.replace("vip-", "")) || 0;
  const targetLevel = Math.min(currentLevel + 1, 4);
  block.querySelector(".vip-progress__level img").src =
    `./img/vip-account-lvl-${targetLevel}.webp`;
  block.querySelector(".vip-progress__level span").textContent =
    `VIP ${names[targetLevel - 1]}`;
  block.querySelector(".vip-progress__amount").textContent = unavailable
    ? "$"
    : "$76,25 M";
  block.querySelector(".vip-progress__target span").textContent = unavailable
    ? "$"
    : "$76,25 M";
}

function renderVipNext(status) {
  const block = document.querySelector(".vip-next");
  if (!block) return;

  const level = Number(status.replace("vip-", "")) || 0;
  const unavailable = status === "unavallable";

  block.querySelectorAll(".vip-next-card").forEach((card, index) => {
    const current = !unavailable && index + 1 === level;
    const available = !unavailable && index + 1 < level;

    card.classList.toggle("is-current", current);
    card.classList.toggle("is-available", available);
    card.classList.toggle("is-unavailable", unavailable);
    card.querySelector(".vip-next-card__status-text").textContent = unavailable
      ? "Desconocido"
      : current
        ? "Tu nivel"
        : available
          ? "Disponible"
          : "Bloqueado";
  });

  block.querySelector(".vip-next-card__period").textContent = unavailable
    ? "1 mes"
    : "Vence en 3 días";

  block.querySelector(".swiper").swiper?.update();
}
